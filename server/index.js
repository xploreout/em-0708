import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { v2 as cloudinary } from 'cloudinary'
import nodemailer from 'nodemailer'
import multer from 'multer'
import pg from 'pg'

dotenv.config()

const { Pool } = pg
const JWT_SECRET  = process.env.JWT_SECRET
const JWT_EXPIRES = '8h'
const ROLES = ['calendar', 'praiseTeam', 'worship', 'admin']
const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']

if (!JWT_SECRET || JWT_SECRET === 'replace-with-a-long-random-secret-string') {
  console.warn('⚠ WARNING: JWT_SECRET not set.')
}

// ── Database ──────────────────────────────────────────────────────────────────
const isLocal = (process.env.DATABASE_URL || '').includes('localhost')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
})

async function initDB() {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id   SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS contacts (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name       VARCHAR(200) NOT NULL,
        phone      VARCHAR(50)  DEFAULT '',
        email      VARCHAR(200) DEFAULT '',
        photo_url  TEXT         DEFAULT '',
        created_at TIMESTAMPTZ  DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS events (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_date DATE         NOT NULL,
        event_name VARCHAR(200) NOT NULL DEFAULT '',
        team_id    INTEGER REFERENCES teams(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ  DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS event_persons (
        id          SERIAL PRIMARY KEY,
        event_id    UUID         NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        person_name VARCHAR(200) NOT NULL,
        task        VARCHAR(200) DEFAULT '',
        sort_order  INTEGER      DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS passwords (
        role VARCHAR(50) PRIMARY KEY,
        hash TEXT        NOT NULL
      );
    `)

    // Seed default passwords for any missing roles
    const defaults = {
      calendar:   process.env.PASSWORD_CALENDAR    || 'calendar123',
      praiseTeam: process.env.PASSWORD_PRAISE_TEAM || 'praise123',
      worship:    process.env.PASSWORD_WORSHIP     || 'worship123',
      admin:      process.env.PASSWORD_ADMIN       || 'admin123',
    }
    for (const [role, pass] of Object.entries(defaults)) {
      const { rows } = await client.query('SELECT 1 FROM passwords WHERE role=$1', [role])
      if (rows.length === 0) {
        await client.query('INSERT INTO passwords(role,hash) VALUES($1,$2)',
          [role, bcrypt.hashSync(pass, 10)])
      }
    }

    console.log('✓ Database ready')
  } finally {
    client.release()
  }
}

// ── Cloudinary ────────────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files are allowed'))
  },
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function requireAuth(requiredRole) {
  return (req, res, next) => {
    const auth = req.headers.authorization
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
    try {
      const payload = jwt.verify(auth.slice(7), JWT_SECRET)
      if (requiredRole && payload.role !== 'admin' && payload.role !== requiredRole) {
        return res.status(403).json({ error: 'Forbidden' })
      }
      req.user = payload
      next()
    } catch {
      res.status(401).json({ error: 'Token invalid or expired' })
    }
  }
}

function createMailer() {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email not configured — set EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env')
  }
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  })
}

const toMember = r => ({
  id: r.id, name: r.name,
  phone: r.phone || '', email: r.email || '', photoUrl: r.photo_url || '',
})

// ── App ───────────────────────────────────────────────────────────────────────
const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

// ── Auth ──────────────────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { role, password } = req.body ?? {}
  if (!role || !password || !ROLES.includes(role)) return res.status(400).json({ error: 'Invalid request' })
  const { rows } = await pool.query('SELECT hash FROM passwords WHERE role=$1', [role])
  if (rows.length === 0 || !bcrypt.compareSync(password, rows[0].hash)) {
    return res.status(401).json({ error: 'Incorrect password' })
  }
  const token = jwt.sign({ role }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
  res.json({ token, role })
})

app.get('/api/me', requireAuth(), (req, res) => res.json({ role: req.user.role }))

app.post('/api/admin/change-password', requireAuth('admin'), async (req, res) => {
  const { role, newPassword } = req.body ?? {}
  if (!role || !newPassword || !ROLES.includes(role)) return res.status(400).json({ error: 'Invalid request' })
  if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
  await pool.query('UPDATE passwords SET hash=$1 WHERE role=$2', [bcrypt.hashSync(newPassword, 10), role])
  res.json({ success: true })
})

// ── Schedule ──────────────────────────────────────────────────────────────────
app.get('/api/schedule', requireAuth(), async (_req, res) => {
  const { rows } = await pool.query(`
    SELECT
      to_char(e.event_date, 'YYYY-MM-DD') AS date,
      e.id         AS event_id,
      e.event_name,
      e.team_id,
      ep.person_name,
      ep.task,
      ep.sort_order
    FROM events e
    LEFT JOIN event_persons ep ON ep.event_id = e.id
    ORDER BY e.event_date, e.created_at, ep.sort_order, ep.id
  `)

  const schedule = {}
  const eventMap = {}
  for (const row of rows) {
    if (!schedule[row.date]) schedule[row.date] = []
    if (!eventMap[row.event_id]) {
      const entry = { eventName: row.event_name, teamId: row.team_id, persons: [] }
      eventMap[row.event_id] = entry
      schedule[row.date].push(entry)
    }
    if (row.person_name) {
      eventMap[row.event_id].persons.push({ name: row.person_name, task: row.task || '' })
    }
  }
  res.json(schedule)
})

app.put('/api/schedule/:date', requireAuth(), async (req, res) => {
  const { date } = req.params
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: 'Invalid date format' })
  const { entries } = req.body ?? {}
  if (!Array.isArray(entries)) return res.status(400).json({ error: 'entries must be an array' })

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM events WHERE event_date=$1', [date])

    for (const entry of entries.filter(e => e?.eventName || e?.personOnDuty)) {
      const { rows: [ev] } = await client.query(
        'INSERT INTO events(event_date,event_name,team_id) VALUES($1,$2,$3) RETURNING id',
        [date, entry.eventName || '', entry.teamId || null]
      )
      const persons = entry.persons ?? []
      for (let i = 0; i < persons.length; i++) {
        const { name, task } = persons[i]
        if (!name?.trim()) continue
        await client.query(
          'INSERT INTO event_persons(event_id,person_name,task,sort_order) VALUES($1,$2,$3,$4)',
          [ev.id, name.trim(), task || '', i]
        )
      }
    }

    await client.query('COMMIT')
    res.json({ success: true })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Schedule save error:', err)
    res.status(500).json({ error: 'Failed to save schedule' })
  } finally {
    client.release()
  }
})

// ── Teams ─────────────────────────────────────────────────────────────────────
app.get('/api/teams', requireAuth(), async (_req, res) => {
  const { rows } = await pool.query('SELECT id, name FROM teams ORDER BY name')
  res.json(rows)
})

app.post('/api/teams', requireAuth('admin'), async (req, res) => {
  const { name } = req.body ?? {}
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })
  try {
    const { rows: [team] } = await pool.query(
      'INSERT INTO teams(name) VALUES($1) RETURNING *', [name.trim()])
    res.json(team)
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Team already exists' })
    throw err
  }
})

app.delete('/api/teams/:id', requireAuth('admin'), async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM teams WHERE id=$1', [req.params.id])
  if (rowCount === 0) return res.status(404).json({ error: 'Team not found' })
  res.json({ success: true })
})

// ── Congregation ──────────────────────────────────────────────────────────────
app.get('/api/congregation/names', requireAuth(), async (_req, res) => {
  const { rows } = await pool.query('SELECT id, name FROM contacts ORDER BY name')
  res.json(rows)
})

app.get('/api/congregation', requireAuth('admin'), async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM contacts ORDER BY name')
  res.json(rows.map(toMember))
})

app.post('/api/congregation', requireAuth('admin'), async (req, res) => {
  const { name, phone, email, photoUrl } = req.body ?? {}
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })
  const { rows: [m] } = await pool.query(
    'INSERT INTO contacts(name,phone,email,photo_url) VALUES($1,$2,$3,$4) RETURNING *',
    [name.trim(), phone?.trim() ?? '', email?.trim() ?? '', photoUrl?.trim() ?? '']
  )
  res.json(toMember(m))
})

app.put('/api/congregation/:id', requireAuth('admin'), async (req, res) => {
  const { name, phone, email, photoUrl } = req.body ?? {}
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })
  const { rows, rowCount } = await pool.query(
    'UPDATE contacts SET name=$1,phone=$2,email=$3,photo_url=$4 WHERE id=$5 RETURNING *',
    [name.trim(), phone?.trim() ?? '', email?.trim() ?? '', photoUrl?.trim() ?? '', req.params.id]
  )
  if (rowCount === 0) return res.status(404).json({ error: 'Member not found' })
  res.json(toMember(rows[0]))
})

app.delete('/api/congregation/:id', requireAuth('admin'), async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM contacts WHERE id=$1', [req.params.id])
  if (rowCount === 0) return res.status(404).json({ error: 'Member not found' })
  res.json({ success: true })
})

// ── Photo upload ──────────────────────────────────────────────────────────────
app.post('/api/congregation/upload-photo', requireAuth('admin'), upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  if (!process.env.CLOUDINARY_CLOUD_NAME) return res.status(503).json({ error: 'Cloudinary not configured' })
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'acbcc-congregation', resource_type: 'image',
          transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }] },
        (err, r) => err ? reject(err) : resolve(r)
      )
      stream.end(req.file.buffer)
    })
    res.json({ url: result.secure_url })
  } catch (err) {
    console.error('Cloudinary upload error:', err)
    res.status(500).json({ error: 'Photo upload failed' })
  }
})

// ── Send reminders ────────────────────────────────────────────────────────────
app.post('/api/reminders/send', requireAuth('admin'), async (req, res) => {
  const { year, month } = req.body ?? {}
  if (year == null || month == null) return res.status(400).json({ error: 'year and month are required' })

  const { rows: scheduleRows } = await pool.query(`
    SELECT e.event_date, e.event_name, ep.person_name, ep.task
    FROM events e
    JOIN event_persons ep ON ep.event_id = e.id
    WHERE EXTRACT(YEAR  FROM e.event_date) = $1
      AND EXTRACT(MONTH FROM e.event_date) = $2
    ORDER BY e.event_date
  `, [year, month + 1])

  const { rows: congregation } = await pool.query('SELECT * FROM contacts')

  const dutyMap = {}
  for (const row of scheduleRows) {
    const person = row.person_name?.trim()
    if (!person) continue
    if (!dutyMap[person]) dutyMap[person] = []
    dutyMap[person].push({
      date: new Date(row.event_date),
      eventName: row.event_name || 'Duty',
      task: row.task || '',
    })
  }

  if (Object.keys(dutyMap).length === 0) {
    return res.json({ sent: [], skipped: [], errors: [], message: 'No duties found for this month' })
  }

  let mailer
  try { mailer = createMailer() } catch (err) {
    return res.status(503).json({ error: err.message })
  }

  const sent = [], skipped = [], errors = []

  for (const [personName, duties] of Object.entries(dutyMap)) {
    const pLower = personName.toLowerCase()
    const member = congregation.find(m => {
      const mLower = m.name.toLowerCase()
      return mLower === pLower || mLower.includes(pLower) || pLower.includes(mLower)
    })
    if (!member)        { skipped.push({ name: personName, reason: 'not in database' }); continue }
    if (!member.email)  { skipped.push({ name: personName, reason: 'no email on file' }); continue }

    const dutyRows = duties
      .sort((a, b) => a.date - b.date)
      .map(d => `<li style="margin:4px 0">${d.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} — <strong>${d.eventName}</strong>${d.task ? ` <span style="color:#6b7280">(${d.task})</span>` : ''}</li>`)
      .join('')

    const html = `
<div style="font-family:sans-serif;max-width:520px;margin:auto;color:#333">
  <h2 style="color:#1d4ed8">ACBCC English Ministry</h2>
  <p>Hi <strong>${member.name}</strong>,</p>
  <p>Friendly reminder — your duties in <strong>${MONTH_NAMES[month]} ${year}</strong>:</p>
  <ul style="line-height:1.8">${dutyRows}</ul>
  <p>Thank you for your faithful service! Contact the ministry coordinator with any questions.</p>
  <p style="color:#6b7280;font-size:0.85em;margin-top:24px">— ACBCC English Ministry Team</p>
</div>`

    try {
      await mailer.sendMail({
        from: process.env.EMAIL_FROM || `ACBCC EM <${process.env.EMAIL_USER}>`,
        to: member.email,
        subject: `Your ${MONTH_NAMES[month]} ${year} Schedule — ACBCC English Ministry`,
        html,
        text: duties.map(d => `• ${d.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} — ${d.eventName}`).join('\n'),
      })
      sent.push({ name: member.name, email: member.email })
    } catch (err) {
      errors.push({ name: member.name, email: member.email, error: err.message })
    }
  }

  res.json({ sent, skipped, errors })
})

// ── Start ─────────────────────────────────────────────────────────────────────
if (!process.env.DATABASE_URL) {
  console.error('✗ DATABASE_URL is not set. Add a PostgreSQL database in Railway and link it to this service.')
  process.exit(1)
}

const PORT = process.env.PORT || 3001
initDB()
  .then(() => app.listen(PORT, () => console.log(`✓ Server → http://localhost:${PORT}`)))
  .catch(err => { console.error('DB init failed:', err.stack || err.message || err); process.exit(1) })
