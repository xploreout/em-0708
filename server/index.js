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
const ROLES = ['calendar', 'admin', 'attendance']
const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']

if (!JWT_SECRET) {
  console.error('✗ JWT_SECRET is not set. Add JWT_SECRET to Railway Variables.')
  process.exit(1)
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

      CREATE TABLE IF NOT EXISTS event_types (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(200) NOT NULL UNIQUE,
        recurring  BOOLEAN      DEFAULT TRUE,
        created_at TIMESTAMPTZ  DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS passwords (
        role VARCHAR(50) PRIMARY KEY,
        hash TEXT        NOT NULL
      );

      CREATE TABLE IF NOT EXISTS classes (
        id                 SERIAL PRIMARY KEY,
        name               VARCHAR(200) NOT NULL UNIQUE,
        lead_name          VARCHAR(200) DEFAULT '',
        lead_email         VARCHAR(200) DEFAULT '',
        description        TEXT         DEFAULT '',
        location           TEXT         DEFAULT '',
        meeting_day        VARCHAR(20)  DEFAULT '',
        meeting_time       VARCHAR(20)  DEFAULT '',
        recurrence         VARCHAR(20)  DEFAULT 'none',
        end_date           DATE,
        lead_password_hash TEXT         DEFAULT '',
        created_at         TIMESTAMPTZ  DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS class_sessions (
        id           SERIAL PRIMARY KEY,
        class_id     INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        session_date DATE NOT NULL,
        topic        TEXT DEFAULT '',
        notes        TEXT DEFAULT '',
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(class_id, session_date)
      );

      CREATE TABLE IF NOT EXISTS class_attendance (
        id             SERIAL PRIMARY KEY,
        session_id     INTEGER NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
        person_name    VARCHAR(200) NOT NULL,
        phone          VARCHAR(50)  DEFAULT '',
        attendee_notes TEXT DEFAULT '',
        checked_in_at  TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS class_notes (
        id         SERIAL PRIMARY KEY,
        class_id   INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        content    TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS class_documents (
        id          SERIAL PRIMARY KEY,
        class_id    INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        name        VARCHAR(300) NOT NULL,
        url         TEXT NOT NULL,
        file_type   VARCHAR(100) DEFAULT '',
        size_bytes  INTEGER DEFAULT 0,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS class_roster (
        id          SERIAL PRIMARY KEY,
        class_id    INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        person_name VARCHAR(200) NOT NULL,
        added_at    TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Migration: add columns to classes table for existing installations
    for (const ddl of [
      `ALTER TABLE classes ADD COLUMN IF NOT EXISTS location TEXT DEFAULT ''`,
      `ALTER TABLE classes ADD COLUMN IF NOT EXISTS meeting_day VARCHAR(20) DEFAULT ''`,
      `ALTER TABLE classes ADD COLUMN IF NOT EXISTS meeting_time VARCHAR(20) DEFAULT ''`,
      `ALTER TABLE classes ADD COLUMN IF NOT EXISTS recurrence VARCHAR(20) DEFAULT 'none'`,
      `ALTER TABLE classes ADD COLUMN IF NOT EXISTS end_date DATE`,
      `ALTER TABLE classes ADD COLUMN IF NOT EXISTS lead_password_hash TEXT DEFAULT ''`,
      `ALTER TABLE classes ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false`,
      `ALTER TABLE classes ADD COLUMN IF NOT EXISTS start_date DATE`,
      `ALTER TABLE classes ADD COLUMN IF NOT EXISTS end_time VARCHAR(20) DEFAULT ''`,
      `ALTER TABLE class_sessions ADD COLUMN IF NOT EXISTS session_lead_name VARCHAR(200) DEFAULT ''`,
      `ALTER TABLE class_sessions ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT ''`,
      `ALTER TABLE class_documents ADD COLUMN IF NOT EXISTS session_id INTEGER REFERENCES class_sessions(id) ON DELETE SET NULL`,
      `CREATE UNIQUE INDEX IF NOT EXISTS class_roster_unique_idx ON class_roster (class_id, lower(trim(person_name)))`,
    ]) { await client.query(ddl) }

    // Backfill class_roster from existing attendance records so all historical names are preserved
    await client.query(`
      INSERT INTO class_roster (class_id, person_name)
      SELECT DISTINCT cs.class_id, ca.person_name
      FROM class_attendance ca
      JOIN class_sessions cs ON ca.session_id = cs.id
      ON CONFLICT DO NOTHING
    `)

    // Seed default passwords for any missing roles
    const defaults = {
      calendar:   process.env.PASSWORD_CALENDAR   || 'calendar123',
      admin:      process.env.PASSWORD_ADMIN      || 'admin123',
      attendance: process.env.PASSWORD_ATTENDANCE || 'attend123',
    }
    for (const [role, pass] of Object.entries(defaults)) {
      await client.query(
        `INSERT INTO passwords(role,hash) VALUES($1,$2)
         ON CONFLICT (role) DO UPDATE SET hash=EXCLUDED.hash`,
        [role, bcrypt.hashSync(pass, 10)]
      )
    }

    console.log('✓ Database ready')
  } finally {
    client.release()
  }
}

// ── Cloudinary ────────────────────────────────────────────────────────────────
if (process.env.CLOUDINARY_URL) {
  // Railway plugin sets CLOUDINARY_URL=cloudinary://key:secret@cloud — SDK reads it automatically
  cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL })
  const cfg = cloudinary.config()
  console.log(`✓ Cloudinary (via CLOUDINARY_URL): cloud=${cfg.cloud_name} key=${String(cfg.api_key).slice(0, 6)}…`)
} else if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key:    process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
  })
  console.log(`✓ Cloudinary: cloud=${process.env.CLOUDINARY_CLOUD_NAME.trim()} key=${process.env.CLOUDINARY_API_KEY.trim().slice(0, 6)}…`)
} else {
  console.warn('⚠ Cloudinary: set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET')
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files are allowed'))
  },
})

const uploadDoc = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ]
    if (file.mimetype.startsWith('image/') || allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Unsupported file type'))
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
    pool: true,
    maxConnections: 5,
  })
}

const toMember = r => ({
  id: r.id, name: r.name,
  phone: r.phone || '', email: r.email || '', photoUrl: r.photo_url || '',
})

// Wraps async route handlers so unhandled rejections reach the error handler
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next)

// ── App ───────────────────────────────────────────────────────────────────────
const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

// ── Auth ──────────────────────────────────────────────────────────────────────
app.post('/api/login', wrap(async (req, res) => {
  const { role, password } = req.body ?? {}
  if (!role || !password || !ROLES.includes(role)) return res.status(400).json({ error: 'Invalid request' })
  const { rows } = await pool.query('SELECT hash FROM passwords WHERE role=$1', [role])
  if (rows.length === 0 || !bcrypt.compareSync(password, rows[0].hash)) {
    return res.status(401).json({ error: 'Incorrect password' })
  }
  const token = jwt.sign({ role }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
  res.json({ token, role })
}))

app.get('/api/me', requireAuth(), (req, res) => res.json({ role: req.user.role }))

app.post('/api/admin/change-password', requireAuth('admin'), wrap(async (req, res) => {
  const { role, newPassword } = req.body ?? {}
  if (!role || !newPassword || !ROLES.includes(role)) return res.status(400).json({ error: 'Invalid request' })
  if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
  await pool.query('UPDATE passwords SET hash=$1 WHERE role=$2', [bcrypt.hashSync(newPassword, 10), role])
  res.json({ success: true })
}))

// ── Schedule ──────────────────────────────────────────────────────────────────
app.get('/api/schedule', requireAuth(), wrap(async (_req, res) => {
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
}))

app.put('/api/schedule/:date', requireAuth('calendar'), wrap(async (req, res) => {
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
}))

// ── Teams ─────────────────────────────────────────────────────────────────────
app.get('/api/teams', requireAuth(), wrap(async (_req, res) => {
  const { rows } = await pool.query('SELECT id, name FROM teams ORDER BY name')
  res.json(rows)
}))

app.post('/api/teams', requireAuth('admin'), wrap(async (req, res) => {
  const { name } = req.body ?? {}
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })
  const { rows: [team] } = await pool.query(
    'INSERT INTO teams(name) VALUES($1) RETURNING *', [name.trim()])
    .catch(err => {
      if (err.code === '23505') { res.status(409).json({ error: 'Team already exists' }); return { rows: [] } }
      throw err
    })
  if (team) res.json(team)
}))

app.delete('/api/teams/:id', requireAuth('admin'), wrap(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM teams WHERE id=$1', [req.params.id])
  if (rowCount === 0) return res.status(404).json({ error: 'Team not found' })
  res.json({ success: true })
}))

// ── Event Types ───────────────────────────────────────────────────────────────
app.get('/api/event-types', requireAuth(), wrap(async (_req, res) => {
  const { rows } = await pool.query('SELECT id, name, recurring FROM event_types ORDER BY name')
  res.json(rows)
}))

app.post('/api/event-types', requireAuth(), wrap(async (req, res) => {
  const { name, recurring = true } = req.body ?? {}
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })
  const { rows: [et] } = await pool.query(
    'INSERT INTO event_types(name, recurring) VALUES($1,$2) RETURNING *', [name.trim(), recurring])
    .catch(err => {
      if (err.code === '23505') { res.status(409).json({ error: 'Event type already exists' }); return { rows: [] } }
      throw err
    })
  if (et) res.json(et)
}))

app.delete('/api/event-types/:id', requireAuth('admin'), wrap(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM event_types WHERE id=$1', [req.params.id])
  if (rowCount === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
}))

// ── Congregation ──────────────────────────────────────────────────────────────
app.get('/api/congregation/names', requireAuth(), wrap(async (_req, res) => {
  const { rows } = await pool.query('SELECT id, name FROM contacts ORDER BY name')
  res.json(rows)
}))

app.get('/api/congregation', requireAuth('admin'), wrap(async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM contacts ORDER BY name')
  res.json(rows.map(toMember))
}))

app.post('/api/congregation', requireAuth('admin'), wrap(async (req, res) => {
  const { name, phone, email, photoUrl } = req.body ?? {}
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })
  const { rows: [m] } = await pool.query(
    'INSERT INTO contacts(name,phone,email,photo_url) VALUES($1,$2,$3,$4) RETURNING *',
    [name.trim(), phone?.trim() ?? '', email?.trim() ?? '', photoUrl?.trim() ?? '']
  )
  res.json(toMember(m))
}))

app.post('/api/congregation/quick-add', requireAuth('attendance'), wrap(async (req, res) => {
  const { name, phone, email } = req.body ?? {}
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })
  const { rows: existing } = await pool.query(
    'SELECT id FROM contacts WHERE LOWER(TRIM(name)) = LOWER(TRIM($1))',
    [name.trim()]
  )
  if (existing.length > 0) return res.status(409).json({ error: 'Contact already exists in congregation' })
  const { rows: [m] } = await pool.query(
    'INSERT INTO contacts(name,phone,email,photo_url) VALUES($1,$2,$3,$4) RETURNING *',
    [name.trim(), phone?.trim() ?? '', email?.trim() ?? '', '']
  )
  res.json(toMember(m))
}))

app.put('/api/congregation/:id', requireAuth('admin'), wrap(async (req, res) => {
  const { name, phone, email, photoUrl } = req.body ?? {}
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })
  const { rows, rowCount } = await pool.query(
    'UPDATE contacts SET name=$1,phone=$2,email=$3,photo_url=$4 WHERE id=$5 RETURNING *',
    [name.trim(), phone?.trim() ?? '', email?.trim() ?? '', photoUrl?.trim() ?? '', req.params.id]
  )
  if (rowCount === 0) return res.status(404).json({ error: 'Member not found' })
  res.json(toMember(rows[0]))
}))

app.get('/api/congregation/:id/in-use', requireAuth('admin'), wrap(async (req, res) => {
  const { rows: [contact] } = await pool.query('SELECT name FROM contacts WHERE id=$1', [req.params.id])
  if (!contact) return res.status(404).json({ error: 'Not found' })
  const { rows: [{ count }] } = await pool.query(
    'SELECT COUNT(*) FROM event_persons WHERE LOWER(TRIM(person_name)) = LOWER(TRIM($1))',
    [contact.name]
  )
  res.json({ name: contact.name, count: parseInt(count) })
}))

app.delete('/api/congregation/:id', requireAuth('admin'), wrap(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM contacts WHERE id=$1', [req.params.id])
  if (rowCount === 0) return res.status(404).json({ error: 'Member not found' })
  res.json({ success: true })
}))

// ── Photo upload ──────────────────────────────────────────────────────────────
app.post('/api/congregation/upload-photo', requireAuth('admin'), upload.single('photo'), wrap(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const cfg = cloudinary.config()
  if (!cfg.cloud_name || !cfg.api_key || !cfg.api_secret) {
    return res.status(503).json({ error: 'Cloudinary not configured — set CLOUDINARY_URL or individual CLOUDINARY_* variables in Railway' })
  }
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'acbcc-congregation', resource_type: 'image' },
      (err, r) => err ? reject(err) : resolve(r)
    )
    stream.end(req.file.buffer)
  })
  // Apply crop/face-detection via delivery URL (no signing required)
  const url = result.secure_url.replace('/upload/', '/upload/w_300,h_300,c_fill,g_face/')
  res.json({ url })
}))

// ── Send reminders ────────────────────────────────────────────────────────────
app.post('/api/reminders/send', requireAuth('admin'), wrap(async (req, res) => {
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

  const emailTasks = []
  for (const [personName, duties] of Object.entries(dutyMap)) {
    const pLower = personName.toLowerCase()
    const member = congregation.find(m => {
      const mLower = m.name.toLowerCase()
      return mLower === pLower || mLower.includes(pLower) || pLower.includes(mLower)
    })
    if (!member)       { skipped.push({ name: personName, reason: 'not in database' }); continue }
    if (!member.email) { skipped.push({ name: personName, reason: 'no email on file' }); continue }

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

    emailTasks.push({ member, duties, html })
  }

  await Promise.allSettled(emailTasks.map(({ member, duties, html }) =>
    mailer.sendMail({
      from: process.env.EMAIL_FROM || `ACBCC EM <${process.env.EMAIL_USER}>`,
      to: member.email,
      subject: `Your ${MONTH_NAMES[month]} ${year} Schedule — ACBCC English Ministry`,
      html,
      text: duties.map(d => `• ${d.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} — ${d.eventName}`).join('\n'),
    })
    .then(() => sent.push({ name: member.name, email: member.email }))
    .catch(err => errors.push({ name: member.name, email: member.email, error: err.message }))
  ))

  res.json({ sent, skipped, errors })
}))

// ── Cross-class attendance search ─────────────────────────────────────────────
app.get('/api/attendance/search', requireAuth('attendance'), wrap(async (req, res) => {
  const q = (req.query.q || '').trim()
  if (q.length < 2) return res.json([])
  const pattern = `%${q}%`
  const { rows } = await pool.query(`
    WITH matches AS (
      SELECT
        c.id            AS class_id,
        c.name          AS class_name,
        c.lead_name,
        c.lead_email,
        c.location,
        c.meeting_day,
        c.meeting_time,
        ca.person_name,
        ca.phone,
        COUNT(DISTINCT cs.id)::int AS session_count,
        MAX(cs.session_date)       AS last_seen
      FROM class_attendance ca
      JOIN class_sessions cs ON cs.id = ca.session_id
      JOIN classes c         ON c.id  = cs.class_id
      WHERE ca.person_name ILIKE $1 OR ca.phone ILIKE $1
      GROUP BY c.id, c.name, c.lead_name, c.lead_email, c.location, c.meeting_day, c.meeting_time, ca.person_name, ca.phone
    )
    SELECT m.*,
      EXISTS(
        SELECT 1 FROM class_sessions cs2
        JOIN class_attendance ca2 ON ca2.session_id = cs2.id
        WHERE cs2.class_id = m.class_id
          AND cs2.session_date = CURRENT_DATE
          AND LOWER(TRIM(ca2.person_name)) = LOWER(TRIM(m.person_name))
      ) AS checked_in_today
    FROM matches m
    ORDER BY last_seen DESC
    LIMIT 30
  `, [pattern])

  // One entry per class (keep highest session_count if name matched multiple spellings)
  const byClass = new Map()
  for (const r of rows) {
    const ex = byClass.get(r.class_id)
    if (!ex || r.session_count > ex.session_count) {
      byClass.set(r.class_id, {
        classId: r.class_id, className: r.class_name,
        leadName: r.lead_name || '', leadEmail: r.lead_email || '',
        location: r.location || '', meetingDay: r.meeting_day || '', meetingTime: r.meeting_time || '',
        personName: r.person_name, phone: r.phone || '',
        sessionCount: r.session_count,
        lastSeen: r.last_seen ? new Date(r.last_seen).toISOString().slice(0, 10) : null,
        checkedInToday: r.checked_in_today === true || r.checked_in_today === 't',
      })
    }
  }
  res.json([...byClass.values()])
}))

// ── Classes ───────────────────────────────────────────────────────────────────
app.get('/api/classes', requireAuth('attendance'), wrap(async (req, res) => {
  const isAdmin = req.user.role === 'admin'
  const { rows } = await pool.query(
    isAdmin
      ? 'SELECT * FROM classes ORDER BY archived, name'
      : 'SELECT * FROM classes WHERE archived = false OR archived IS NULL ORDER BY name'
  )
  res.json(rows.map(toClass))
}))

app.get('/api/classes/:id', requireAuth('attendance'), wrap(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM classes WHERE id=$1', [req.params.id])
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
  res.json(toClass(rows[0]))
}))

const toClass = r => ({
  id: r.id, name: r.name, lead_name: r.lead_name || '', lead_email: r.lead_email || '',
  description: r.description || '', location: r.location || '',
  meeting_day: r.meeting_day || '', meeting_time: r.meeting_time || '', end_time: r.end_time || '',
  recurrence: r.recurrence || 'none',
  start_date: r.start_date ? new Date(r.start_date).toISOString().slice(0, 10) : null,
  end_date: r.end_date ? new Date(r.end_date).toISOString().slice(0, 10) : null,
  has_lead_password: !!(r.lead_password_hash),
  archived: r.archived || false,
})

app.post('/api/classes', requireAuth('admin'), wrap(async (req, res) => {
  const { name, lead_name='', lead_email='', description='', location='', meeting_day='', meeting_time='', end_time='', recurrence='none', start_date=null, end_date=null, lead_password='' } = req.body ?? {}
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })
  const hash = lead_password ? bcrypt.hashSync(lead_password, 10) : ''
  const { rows: [cls] } = await pool.query(
    `INSERT INTO classes(name,lead_name,lead_email,description,location,meeting_day,meeting_time,end_time,recurrence,start_date,end_date,lead_password_hash)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [name.trim(), lead_name.trim(), lead_email.trim(), description.trim(), location.trim(), meeting_day.trim(), meeting_time.trim(), end_time.trim(), recurrence, start_date || null, end_date || null, hash]
  ).catch(err => {
    if (err.code === '23505') { res.status(409).json({ error: 'Class already exists' }); return { rows: [] } }
    throw err
  })
  if (cls) res.json(toClass(cls))
}))

app.put('/api/classes/:id', requireAuth('attendance'), wrap(async (req, res) => {
  const { name, lead_name='', lead_email='', description='', location='', meeting_day='', meeting_time='', end_time='', recurrence='none', start_date=null, end_date=null, lead_password } = req.body ?? {}
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })
  const base = [name.trim(), lead_name.trim(), lead_email.trim(), description.trim(), location.trim(), meeting_day.trim(), meeting_time.trim(), end_time.trim(), recurrence, start_date || null, end_date || null]
  let rows, rowCount
  if (lead_password !== undefined) {
    const hash = lead_password ? bcrypt.hashSync(lead_password, 10) : ''
    ;({ rows, rowCount } = await pool.query(
      `UPDATE classes SET name=$1,lead_name=$2,lead_email=$3,description=$4,location=$5,meeting_day=$6,meeting_time=$7,end_time=$8,recurrence=$9,start_date=$10,end_date=$11,lead_password_hash=$12 WHERE id=$13 RETURNING *`,
      [...base, hash, req.params.id]
    ))
  } else {
    ;({ rows, rowCount } = await pool.query(
      `UPDATE classes SET name=$1,lead_name=$2,lead_email=$3,description=$4,location=$5,meeting_day=$6,meeting_time=$7,end_time=$8,recurrence=$9,start_date=$10,end_date=$11 WHERE id=$12 RETURNING *`,
      [...base, req.params.id]
    ))
  }
  if (rowCount === 0) return res.status(404).json({ error: 'Not found' })
  res.json(toClass(rows[0]))
}))

app.patch('/api/classes/:id/lead-password', requireAuth('admin'), wrap(async (req, res) => {
  const { password } = req.body ?? {}
  if (!password) return res.status(400).json({ error: 'Password required' })
  const { rowCount } = await pool.query(
    'UPDATE classes SET lead_password_hash=$1 WHERE id=$2',
    [bcrypt.hashSync(password, 10), req.params.id]
  )
  if (rowCount === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
}))

app.post('/api/classes/:id/lead-verify', requireAuth('attendance'), wrap(async (req, res) => {
  const { password } = req.body ?? {}
  if (!password) return res.json({ ok: false })
  const { rows } = await pool.query('SELECT lead_password_hash FROM classes WHERE id=$1', [req.params.id])
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
  const hash = rows[0].lead_password_hash
  if (!hash) return res.status(422).json({ error: 'No lead password set for this class' })
  res.json({ ok: bcrypt.compareSync(password, hash) })
}))

app.patch('/api/classes/:id/archive', requireAuth('admin'), wrap(async (req, res) => {
  const { archived } = req.body ?? {}
  const { rows, rowCount } = await pool.query(
    'UPDATE classes SET archived=$1 WHERE id=$2 RETURNING *',
    [!!archived, req.params.id]
  )
  if (rowCount === 0) return res.status(404).json({ error: 'Not found' })
  res.json(toClass(rows[0]))
}))

app.delete('/api/classes/:id', requireAuth('admin'), wrap(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM classes WHERE id=$1', [req.params.id])
  if (rowCount === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
}))

// ── Class Notes ────────────────────────────────────────────────────────────────
app.get('/api/classes/:id/notes', requireAuth('attendance'), wrap(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, content, created_at FROM class_notes WHERE class_id=$1 ORDER BY created_at DESC',
    [req.params.id]
  )
  res.json(rows)
}))

app.post('/api/classes/:id/notes', requireAuth('attendance'), wrap(async (req, res) => {
  const { content } = req.body ?? {}
  if (!content?.trim()) return res.status(400).json({ error: 'Content is required' })
  const { rows: [note] } = await pool.query(
    'INSERT INTO class_notes(class_id, content) VALUES($1,$2) RETURNING id, content, created_at',
    [req.params.id, content.trim()]
  )
  res.json(note)
}))

app.delete('/api/classes/:id/notes/:noteId', requireAuth('attendance'), wrap(async (req, res) => {
  const { rowCount } = await pool.query(
    'DELETE FROM class_notes WHERE id=$1 AND class_id=$2',
    [req.params.noteId, req.params.id]
  )
  if (rowCount === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
}))

// ── Class Documents ────────────────────────────────────────────────────────────

// Public: all classes + their documents (no auth) for Class Resources page
app.get('/api/public/class-resources', wrap(async (_req, res) => {
  const { rows: classes } = await pool.query('SELECT * FROM classes ORDER BY archived, name')
  const { rows: docs }    = await pool.query(`
    SELECT cd.id, cd.class_id, cd.name, cd.url, cd.file_type, cd.size_bytes, cd.created_at,
           cd.session_id, to_char(cs.session_date,'YYYY-MM-DD') AS session_date, cs.topic AS session_topic
    FROM class_documents cd
    LEFT JOIN class_sessions cs ON cs.id = cd.session_id
    ORDER BY cd.created_at DESC
  `)
  const result = classes.map(c => ({
    ...toClass(c),
    documents: docs.filter(d => d.class_id === c.id).map(d => ({
      id: d.id, name: d.name, url: d.url, file_type: d.file_type,
      size_bytes: d.size_bytes, created_at: d.created_at,
      session_id: d.session_id || null, session_date: d.session_date || null, session_topic: d.session_topic || null,
    })),
  }))
  res.json(result)
}))

// Public PDF proxy — fetches a Cloudinary PDF server-side to avoid browser CORS/auth issues.
// Uses private_download_url (Cloudinary API server) which works regardless of resource
// access_mode, then falls back to plain CDN URL for truly public resources.
app.get('/api/proxy-pdf', wrap(async (req, res) => {
  const { url } = req.query
  if (!url || !url.startsWith('https://res.cloudinary.com/')) {
    return res.status(400).json({ error: 'Invalid URL' })
  }

  // Parse: https://res.cloudinary.com/{cloud}/{resType}/upload/[v{n}/]{publicId}
  const parsed = url.match(/res\.cloudinary\.com\/[^/]+\/(image|raw|video)\/upload\/(?:v\d+\/)?([^?]+)/)
  const resourceType = parsed?.[1] ?? 'raw'
  const publicId     = decodeURIComponent(parsed?.[2] ?? '')

  const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46] // %PDF
  function isPdf(buf) {
    return buf.length > 4 && buf[0] === PDF_MAGIC[0] && buf[1] === PDF_MAGIC[1] &&
           buf[2] === PDF_MAGIC[2] && buf[3] === PDF_MAGIC[3]
  }
  async function tryUrl(u) {
    const r = await fetch(u)
    if (!r.ok) { console.warn(`proxy-pdf: ${r.status} from ${u.slice(0, 120)}`); return null }
    const buf = Buffer.from(await r.arrayBuffer())
    if (isPdf(buf)) return buf
    console.warn(`proxy-pdf: non-PDF bytes (${buf.slice(0, 4).toString('hex')}) from ${u.slice(0, 120)}`)
    return null
  }

  // Resolve credentials: SDK config first, individual env vars as fallback
  const cfg = cloudinary.config()
  const cloudName = cfg.cloud_name || (process.env.CLOUDINARY_CLOUD_NAME || '').trim()
  const apiKey    = String(cfg.api_key || '') || (process.env.CLOUDINARY_API_KEY || '').trim()
  const apiSecret = cfg.api_secret || (process.env.CLOUDINARY_API_SECRET || '').trim()
  console.log(`proxy-pdf: cloud=${cloudName} key=${apiKey.slice(0, 8)}… hasSecret=${!!apiSecret} publicId=${publicId}`)

  // Strategy 1: private_download_url → api.cloudinary.com (bypasses CDN delivery restrictions)
  if (publicId && cloudName && apiKey && apiSecret) {
    try {
      const dlUrl = cloudinary.utils.private_download_url(publicId, '', {
        resource_type: resourceType,
        type: 'upload',
        expires_at: Math.floor(Date.now() / 1000) + 300,
      })
      console.log(`proxy-pdf: strategy1 → ${dlUrl.slice(0, 150)}`)
      const buf = await tryUrl(dlUrl)
      if (buf) {
        res.set('Content-Type', 'application/pdf')
        res.set('Content-Disposition', 'inline')
        return res.send(buf)
      }
    } catch (e) {
      console.warn('proxy-pdf: strategy1 error:', e.message)
    }
  } else {
    console.warn(`proxy-pdf: skipping strategy1 — missing: cloud=${!cloudName} key=${!apiKey} secret=${!apiSecret}`)
  }

  // Strategy 2: plain CDN URL (works for public resources)
  for (const u of publicId.endsWith('.pdf') ? [url] : [url + '.pdf', url]) {
    try {
      const buf = await tryUrl(u)
      if (buf) {
        res.set('Content-Type', 'application/pdf')
        res.set('Content-Disposition', 'inline')
        return res.send(buf)
      }
    } catch { continue }
  }

  console.error(`proxy-pdf: all strategies failed for ${url}`)
  return res.status(502).send('Could not load PDF')
}))

app.get('/api/classes/:id/documents', requireAuth('attendance'), wrap(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT cd.*, to_char(cs.session_date,'YYYY-MM-DD') AS session_date
     FROM class_documents cd
     LEFT JOIN class_sessions cs ON cs.id = cd.session_id
     WHERE cd.class_id=$1 ORDER BY cd.created_at DESC`,
    [req.params.id]
  )
  res.json(rows)
}))

app.post('/api/classes/:id/documents', requireAuth('attendance'), uploadDoc.single('file'), wrap(async (req, res) => {
  const file = req.file
  if (!file) return res.status(400).json({ error: 'No file provided' })
  const cfg = cloudinary.config()
  if (!cfg.cloud_name || !cfg.api_key || !cfg.api_secret) {
    return res.status(503).json({ error: 'Cloudinary not configured' })
  }
  const { name = '', session_id } = req.body ?? {}
  // multer passes originalname as latin1; decode to utf-8 so non-ASCII filenames aren't garbled
  const decodedOriginal = (() => {
    try { return Buffer.from(file.originalname || 'file', 'latin1').toString('utf8') } catch { return file.originalname || 'file' }
  })()
  const docName = (name || decodedOriginal).trim().slice(0, 300)

  // Extract and sanitise the original extension so downloads open correctly
  const origName = decodedOriginal
  const dotIdx   = origName.lastIndexOf('.')
  const origExt  = dotIdx > 0 ? origName.slice(dotIdx).toLowerCase() : ''
  const origBase = dotIdx > 0 ? origName.slice(0, dotIdx) : origName
  const safeBase = origBase.replace(/[^\w-]/g, '_').slice(0, 80) || 'file'
  const publicId = `acbcc-class-docs/${Date.now()}_${safeBase}`

  // Images → resource_type 'image' (Cloudinary CDN serves them natively).
  // Everything else (PDFs, docx, pptx, etc.) → resource_type 'raw' so Cloudinary
  // serves the file as-is without image-delivery restrictions (avoids 401 errors).
  // Always include the original extension in the public_id for raw uploads so the
  // download URL has the correct extension.
  const isImage = file.mimetype.startsWith('image/')
  const resourceType = isImage ? 'image' : 'raw'
  const cloudPublicId = isImage ? publicId : publicId + origExt

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, public_id: cloudPublicId, access_mode: 'public' },
      (err, r) => err ? reject(err) : resolve(r)
    )
    stream.end(file.buffer)
  })
  const sid = session_id ? parseInt(session_id) : null
  const { rows: [doc] } = await pool.query(
    'INSERT INTO class_documents(class_id,name,url,file_type,size_bytes,session_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
    [req.params.id, docName, result.secure_url, file.mimetype, file.size, sid]
  )
  res.json({ id: doc.id, name: doc.name, url: doc.url, file_type: doc.file_type, size_bytes: doc.size_bytes, created_at: doc.created_at, session_id: doc.session_id, session_date: null })
}))

app.post('/api/classes/:id/documents/link', requireAuth('attendance'), wrap(async (req, res) => {
  const { name, url, session_id } = req.body ?? {}
  if (!url?.trim()) return res.status(400).json({ error: 'URL is required' })
  const docName = (name || url).trim().slice(0, 300)
  const sid = session_id ? parseInt(session_id) : null
  const { rows: [doc] } = await pool.query(
    'INSERT INTO class_documents(class_id,name,url,file_type,size_bytes,session_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
    [req.params.id, docName, url.trim(), 'video/youtube', 0, sid]
  )
  res.json({ id: doc.id, name: doc.name, url: doc.url, file_type: doc.file_type, size_bytes: 0, created_at: doc.created_at, session_id: doc.session_id, session_date: null })
}))

app.delete('/api/classes/:id/documents/:docId', requireAuth('attendance'), wrap(async (req, res) => {
  const { rowCount } = await pool.query(
    'DELETE FROM class_documents WHERE id=$1 AND class_id=$2',
    [req.params.docId, req.params.id]
  )
  if (rowCount === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
}))

// ── Class Sessions ─────────────────────────────────────────────────────────────
app.get('/api/classes/:id/sessions', requireAuth('attendance'), wrap(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT cs.id, to_char(cs.session_date,'YYYY-MM-DD') AS session_date, cs.topic, cs.notes, cs.session_lead_name, cs.status,
      COALESCE(json_agg(
        json_build_object(
          'id', ca.id, 'person_name', ca.person_name, 'phone', ca.phone,
          'attendee_notes', ca.attendee_notes, 'checked_in_at', ca.checked_in_at
        ) ORDER BY ca.checked_in_at
      ) FILTER (WHERE ca.id IS NOT NULL), '[]') AS attendees
    FROM class_sessions cs
    LEFT JOIN class_attendance ca ON ca.session_id = cs.id
    WHERE cs.class_id = $1
    GROUP BY cs.id, cs.session_date, cs.topic, cs.notes, cs.session_lead_name, cs.status
    ORDER BY cs.session_date DESC`,
    [req.params.id]
  )
  res.json(rows)
}))

app.post('/api/classes/:id/sessions', requireAuth('attendance'), wrap(async (req, res) => {
  const { topic = '', notes = '', date, session_lead_name = '', status = '' } = req.body ?? {}
  const sessionDate = date || new Date().toISOString().slice(0, 10)
  const { rows: [session] } = await pool.query(
    `INSERT INTO class_sessions(class_id,session_date,topic,notes,session_lead_name,status) VALUES($1,$2,$3,$4,$5,$6)
     ON CONFLICT (class_id,session_date) DO UPDATE
       SET topic=EXCLUDED.topic, notes=EXCLUDED.notes, session_lead_name=EXCLUDED.session_lead_name, status=EXCLUDED.status
     RETURNING id, to_char(session_date,'YYYY-MM-DD') AS session_date, topic, notes, session_lead_name, status`,
    [req.params.id, sessionDate, topic, notes, session_lead_name, status]
  )
  res.json(session)
}))

app.put('/api/classes/:classId/sessions/:sid', requireAuth('attendance'), wrap(async (req, res) => {
  const { topic = '', notes = '', session_lead_name = '', session_date, status = '' } = req.body ?? {}
  const base = [topic, notes, session_lead_name, status]
  const { rows, rowCount } = session_date
    ? await pool.query(
        `UPDATE class_sessions SET topic=$1, notes=$2, session_lead_name=$3, status=$4, session_date=$5
         WHERE id=$6 AND class_id=$7
         RETURNING id, to_char(session_date,'YYYY-MM-DD') AS session_date, topic, notes, session_lead_name, status`,
        [...base, session_date, req.params.sid, req.params.classId]
      )
    : await pool.query(
        `UPDATE class_sessions SET topic=$1, notes=$2, session_lead_name=$3, status=$4
         WHERE id=$5 AND class_id=$6
         RETURNING id, to_char(session_date,'YYYY-MM-DD') AS session_date, topic, notes, session_lead_name, status`,
        [...base, req.params.sid, req.params.classId]
      )
  if (rowCount === 0) return res.status(404).json({ error: 'Session not found' })
  res.json(rows[0])
}))

app.delete('/api/classes/:classId/sessions/:sid', requireAuth('attendance'), wrap(async (req, res) => {
  const { rowCount } = await pool.query(
    `DELETE FROM class_sessions WHERE id=$1 AND class_id=$2`,
    [req.params.sid, req.params.classId]
  )
  if (rowCount === 0) return res.status(404).json({ error: 'Session not found' })
  res.json({ ok: true })
}))

// ── Class Attendance ───────────────────────────────────────────────────────────
app.get('/api/classes/:id/search', requireAuth('attendance'), wrap(async (req, res) => {
  const q = (req.query.q || '').trim()
  if (q.length < 1) return res.json([])
  const pattern = `%${q}%`
  const { rows: prev } = await pool.query(
    `SELECT DISTINCT ON (lower(trim(ca.person_name)))
      ca.person_name AS name, ca.phone, MAX(cs.session_date) AS last_seen
    FROM class_attendance ca
    JOIN class_sessions cs ON cs.id = ca.session_id
    WHERE cs.class_id=$1 AND (ca.person_name ILIKE $2 OR ca.phone ILIKE $2)
    GROUP BY ca.person_name, ca.phone
    ORDER BY lower(trim(ca.person_name)), last_seen DESC
    LIMIT 8`,
    [req.params.id, pattern]
  )
  const { rows: contacts } = await pool.query(
    'SELECT name, phone FROM contacts WHERE name ILIKE $1 OR phone ILIKE $1 LIMIT 8',
    [pattern]
  )
  const seen = new Set()
  const results = []
  for (const r of prev) {
    const key = r.name.toLowerCase().trim()
    if (!seen.has(key)) { seen.add(key); results.push({ name: r.name, phone: r.phone || '', lastSeen: r.last_seen, inSystem: true }) }
  }
  for (const r of contacts) {
    const key = r.name.toLowerCase().trim()
    if (!seen.has(key)) { seen.add(key); results.push({ name: r.name, phone: r.phone || '', lastSeen: null, inSystem: true }) }
  }
  res.json(results.slice(0, 10))
}))

app.post('/api/classes/:id/checkin', requireAuth('attendance'), wrap(async (req, res) => {
  const { person_name, phone = '', session_date } = req.body ?? {}
  if (!person_name?.trim()) return res.status(400).json({ error: 'Name is required' })
  const date = session_date || new Date().toISOString().slice(0, 10)
  const { rows: [session] } = await pool.query(
    `INSERT INTO class_sessions(class_id,session_date) VALUES($1,$2)
     ON CONFLICT (class_id,session_date) DO UPDATE SET class_id=EXCLUDED.class_id
     RETURNING id, to_char(session_date,'YYYY-MM-DD') AS session_date`,
    [req.params.id, date]
  )
  const { rows: existing } = await pool.query(
    `SELECT id FROM class_attendance WHERE session_id=$1 AND lower(trim(person_name))=lower(trim($2))`,
    [session.id, person_name]
  )
  if (existing.length > 0) return res.status(409).json({ error: 'Already checked in', date })
  const { rows: [record] } = await pool.query(
    'INSERT INTO class_attendance(session_id,person_name,phone) VALUES($1,$2,$3) RETURNING *',
    [session.id, person_name.trim(), phone.trim()]
  )
  // Keep roster in sync — person stays even if attendance is later removed
  await pool.query(
    `INSERT INTO class_roster(class_id,person_name) VALUES($1,$2) ON CONFLICT DO NOTHING`,
    [req.params.id, person_name.trim()]
  )
  res.json(record)
}))

app.put('/api/classes/:classId/attendance/:aid', requireAuth('attendance'), wrap(async (req, res) => {
  const { attendee_notes = '' } = req.body ?? {}
  const { rows, rowCount } = await pool.query(
    `UPDATE class_attendance SET attendee_notes=$1 WHERE id=$2
     AND session_id IN (SELECT id FROM class_sessions WHERE class_id=$3)
     RETURNING *`,
    [attendee_notes, req.params.aid, req.params.classId]
  )
  if (rowCount === 0) return res.status(404).json({ error: 'Not found' })
  res.json(rows[0])
}))

app.delete('/api/classes/:classId/attendance/:aid', requireAuth('attendance'), wrap(async (req, res) => {
  // Fetch name before deleting so we can preserve it in the roster
  const { rows: [attendee] } = await pool.query(
    `SELECT ca.person_name FROM class_attendance ca
     JOIN class_sessions cs ON ca.session_id=cs.id
     WHERE ca.id=$1 AND cs.class_id=$2`,
    [req.params.aid, req.params.classId]
  )
  const { rowCount } = await pool.query(
    `DELETE FROM class_attendance WHERE id=$1
     AND session_id IN (SELECT id FROM class_sessions WHERE class_id=$2)`,
    [req.params.aid, req.params.classId]
  )
  if (rowCount === 0) return res.status(404).json({ error: 'Not found' })
  // Ensure the person stays in the roster even though their check-in was removed
  if (attendee) {
    await pool.query(
      `INSERT INTO class_roster(class_id,person_name) VALUES($1,$2) ON CONFLICT DO NOTHING`,
      [req.params.classId, attendee.person_name]
    )
  }
  res.json({ success: true })
}))

app.get('/api/classes/:id/roster', requireAuth('attendance'), wrap(async (req, res) => {
  // Return the union of explicitly-added roster members and all historical attendance names
  const { rows } = await pool.query(`
    SELECT DISTINCT person_name FROM (
      SELECT person_name FROM class_roster WHERE class_id=$1
      UNION
      SELECT ca.person_name
      FROM class_attendance ca
      JOIN class_sessions cs ON ca.session_id=cs.id
      WHERE cs.class_id=$1
    ) t ORDER BY person_name
  `, [req.params.id])
  res.json(rows.map(r => r.person_name))
}))

app.post('/api/classes/:id/roster', requireAuth('attendance'), wrap(async (req, res) => {
  const { names = [] } = req.body ?? {}
  const list = (Array.isArray(names) ? names : [names]).map(n => n?.trim()).filter(Boolean)
  for (const name of list) {
    await pool.query(
      `INSERT INTO class_roster(class_id,person_name) VALUES($1,$2) ON CONFLICT DO NOTHING`,
      [req.params.id, name]
    )
  }
  res.json({ success: true })
}))

app.delete('/api/classes/:id/roster/:name', requireAuth('attendance'), wrap(async (req, res) => {
  const { id } = req.params
  const name = req.params.name
  await pool.query(
    `DELETE FROM class_attendance
     WHERE lower(trim(person_name))=lower(trim($1))
     AND session_id IN (SELECT id FROM class_sessions WHERE class_id=$2)`,
    [name, id]
  )
  await pool.query(
    'DELETE FROM class_roster WHERE class_id=$1 AND lower(trim(person_name))=lower(trim($2))',
    [id, name]
  )
  res.json({ success: true })
}))

app.post('/api/classes/:id/notify-lead', requireAuth('attendance'), wrap(async (req, res) => {
  const { person_name, phone = '' } = req.body ?? {}
  if (!person_name?.trim()) return res.status(400).json({ error: 'Name is required' })
  const { rows } = await pool.query('SELECT name, lead_email FROM classes WHERE id=$1', [req.params.id])
  if (rows.length === 0) return res.status(404).json({ error: 'Class not found' })
  const cls = rows[0]
  if (!cls.lead_email) return res.status(422).json({ error: 'Class leader has no email on file' })
  let mailer
  try { mailer = createMailer() } catch (err) {
    return res.status(503).json({ error: err.message })
  }
  await mailer.sendMail({
    from: process.env.EMAIL_FROM || `ACBCC Attendance <${process.env.EMAIL_USER}>`,
    to: cls.lead_email,
    subject: `[Attendance] ${person_name} is not in the system — ${cls.name}`,
    html: `<p><strong>${person_name}</strong>${phone ? ` (${phone})` : ''} tried to check in to <strong>${cls.name}</strong> but was not found in the system.</p><p>Please verify their identity or add them to the class roster.</p>`,
    text: `${person_name}${phone ? ` (${phone})` : ''} tried to check in to ${cls.name} but was not found. Please verify or add them.`,
  })
  res.json({ success: true })
}))

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: err.message || 'Internal server error' })
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
