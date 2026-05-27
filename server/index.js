import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { v2 as cloudinary } from 'cloudinary'
import nodemailer from 'nodemailer'
import multer from 'multer'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const PASSWORDS_FILE    = join(__dirname, 'passwords.json')
const SCHEDULE_FILE     = join(__dirname, 'schedule.json')
const CONGREGATION_FILE = join(__dirname, 'congregation.json')
const JWT_SECRET  = process.env.JWT_SECRET
const JWT_EXPIRES = '8h'
const ROLES = ['calendar', 'praiseTeam', 'worship', 'admin']

const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']

if (!JWT_SECRET || JWT_SECRET === 'replace-with-a-long-random-secret-string') {
  console.warn('⚠ WARNING: JWT_SECRET not set. Update server/.env before deploying.')
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
function initPasswords() {
  if (existsSync(PASSWORDS_FILE)) return
  const defaults = {
    calendar:   bcrypt.hashSync(process.env.PASSWORD_CALENDAR    || 'calendar123', 10),
    praiseTeam: bcrypt.hashSync(process.env.PASSWORD_PRAISE_TEAM || 'praise123',   10),
    worship:    bcrypt.hashSync(process.env.PASSWORD_WORSHIP      || 'worship123',  10),
    admin:      bcrypt.hashSync(process.env.PASSWORD_ADMIN        || 'admin123',    10),
  }
  writeFileSync(PASSWORDS_FILE, JSON.stringify(defaults, null, 2))
  console.log('✓ passwords.json initialized from .env defaults')
}

const getPasswords   = () => JSON.parse(readFileSync(PASSWORDS_FILE, 'utf-8'))
const savePasswords  = (p) => writeFileSync(PASSWORDS_FILE, JSON.stringify(p, null, 2))

function getSchedule() {
  if (!existsSync(SCHEDULE_FILE)) return {}
  const raw = JSON.parse(readFileSync(SCHEDULE_FILE, 'utf-8'))
  const out = {}
  for (const [k, v] of Object.entries(raw)) {
    const entries = Array.isArray(v) ? v : [v]
    out[k] = entries.map(e => {
      // Migrate old { eventName, personOnDuty } → { eventName, persons: [{name, task}] }
      if ('personOnDuty' in e && !('persons' in e)) {
        const persons = (e.personOnDuty || '').split(',')
          .map(p => p.trim()).filter(Boolean)
          .map(name => ({ name, task: '' }))
        return { eventName: e.eventName || '', persons }
      }
      if (!e.persons) return { eventName: e.eventName || '', persons: [] }
      return e
    })
  }
  return out
}
const saveSchedule = (s) => writeFileSync(SCHEDULE_FILE, JSON.stringify(s, null, 2))

function getCongregation() {
  if (!existsSync(CONGREGATION_FILE)) return []
  return JSON.parse(readFileSync(CONGREGATION_FILE, 'utf-8'))
}
const saveCongregation = (m) => writeFileSync(CONGREGATION_FILE, JSON.stringify(m, null, 2))

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

// ── App ───────────────────────────────────────────────────────────────────────
const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

initPasswords()

// ── Auth ──────────────────────────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { role, password } = req.body ?? {}
  if (!role || !password || !ROLES.includes(role)) return res.status(400).json({ error: 'Invalid request' })
  const hash = getPasswords()[role]
  if (!hash || !bcrypt.compareSync(password, hash)) return res.status(401).json({ error: 'Incorrect password' })
  const token = jwt.sign({ role }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
  res.json({ token, role })
})

app.get('/api/me', requireAuth(), (req, res) => res.json({ role: req.user.role }))

app.post('/api/admin/change-password', requireAuth('admin'), (req, res) => {
  const { role, newPassword } = req.body ?? {}
  if (!role || !newPassword || !ROLES.includes(role)) return res.status(400).json({ error: 'Invalid request' })
  if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
  const passwords = getPasswords()
  passwords[role] = bcrypt.hashSync(newPassword, 10)
  savePasswords(passwords)
  res.json({ success: true })
})

// ── Schedule ──────────────────────────────────────────────────────────────────
app.get('/api/schedule', requireAuth(), (_req, res) => res.json(getSchedule()))

app.put('/api/schedule/:date', requireAuth(), (req, res) => {
  const { date } = req.params
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: 'Invalid date format' })
  const { entries } = req.body ?? {}
  if (!Array.isArray(entries)) return res.status(400).json({ error: 'entries must be an array' })
  const schedule = getSchedule()
  const filtered = entries.filter(e => e?.eventName || e?.personOnDuty)
  if (filtered.length === 0) delete schedule[date]
  else schedule[date] = filtered
  saveSchedule(schedule)
  res.json({ success: true })
})

// ── Congregation CRUD ─────────────────────────────────────────────────────────

// Names-only endpoint — any authenticated user (for autocomplete in schedule)
app.get('/api/congregation/names', requireAuth(), (_req, res) => {
  res.json(getCongregation().map(m => ({ id: m.id, name: m.name })))
})

app.get('/api/congregation', requireAuth('admin'), (_req, res) => {
  res.json(getCongregation())
})

app.post('/api/congregation', requireAuth('admin'), (req, res) => {
  const { name, phone, email, photoUrl } = req.body ?? {}
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })
  const members = getCongregation()
  const member  = {
    id: crypto.randomUUID(),
    name: name.trim(),
    phone: phone?.trim() ?? '',
    email: email?.trim() ?? '',
    photoUrl: photoUrl?.trim() ?? '',
  }
  members.push(member)
  saveCongregation(members)
  res.json(member)
})

app.put('/api/congregation/:id', requireAuth('admin'), (req, res) => {
  const { id } = req.params
  const { name, phone, email, photoUrl } = req.body ?? {}
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })
  const members = getCongregation()
  const idx = members.findIndex(m => m.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Member not found' })
  members[idx] = { ...members[idx], name: name.trim(), phone: phone?.trim() ?? '', email: email?.trim() ?? '', photoUrl: photoUrl?.trim() ?? '' }
  saveCongregation(members)
  res.json(members[idx])
})

app.delete('/api/congregation/:id', requireAuth('admin'), (req, res) => {
  const { id } = req.params
  const members  = getCongregation()
  const filtered = members.filter(m => m.id !== id)
  if (filtered.length === members.length) return res.status(404).json({ error: 'Member not found' })
  saveCongregation(filtered)
  res.json({ success: true })
})

// ── Photo upload → Cloudinary ─────────────────────────────────────────────────
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

// ── Send monthly reminders ────────────────────────────────────────────────────
app.post('/api/reminders/send', requireAuth('admin'), async (req, res) => {
  const { year, month } = req.body ?? {}
  if (year == null || month == null) return res.status(400).json({ error: 'year and month are required' })

  const schedule     = getSchedule()
  const congregation = getCongregation()

  // Collect duties per person for this month
  const dutyMap = {} // personName → [{ date, eventName }]
  for (const [dateStr, entries] of Object.entries(schedule)) {
    const d = new Date(dateStr + 'T00:00:00')
    if (d.getFullYear() !== year || d.getMonth() !== month) continue
    for (const entry of entries) {
      const persons = entry.persons ?? []
      for (const { name, task } of persons) {
        const person = name?.trim()
        if (!person) continue
        if (!dutyMap[person]) dutyMap[person] = []
        dutyMap[person].push({ date: d, eventName: entry.eventName || 'Duty', task: task || '' })
      }
    }
  }

  if (Object.keys(dutyMap).length === 0) {
    return res.json({ sent: [], skipped: [], errors: [], message: 'No duties found for this month' })
  }

  let mailer
  try { mailer = createMailer() } catch (err) {
    return res.status(503).json({ error: err.message })
  }

  const sent    = []
  const skipped = []
  const errors  = []

  for (const [personName, duties] of Object.entries(dutyMap)) {
    const pLower = personName.toLowerCase()
    const member = congregation.find(m => {
      const mLower = m.name.toLowerCase()
      return mLower === pLower || mLower.includes(pLower) || pLower.includes(mLower)
    })

    if (!member) { skipped.push({ name: personName, reason: 'not in database' }); continue }
    if (!member.email) { skipped.push({ name: personName, reason: 'no email on file' }); continue }

    const dutyRows = duties
      .sort((a, b) => a.date - b.date)
      .map(d => `<li style="margin:4px 0">${d.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} — <strong>${d.eventName}</strong>${d.task ? ` <span style="color:#6b7280">(${d.task})</span>` : ''}</li>`)
      .join('')

    const html = `
<div style="font-family:sans-serif;max-width:520px;margin:auto;color:#333">
  <h2 style="color:#1d4ed8">ACBCC English Ministry</h2>
  <p>Hi <strong>${member.name}</strong>,</p>
  <p>This is a friendly reminder that you have the following duties in <strong>${MONTH_NAMES[month]} ${year}</strong>:</p>
  <ul style="line-height:1.8">${dutyRows}</ul>
  <p>Thank you for your faithful service! If you have any questions or need to make changes, please contact the ministry coordinator.</p>
  <p style="color:#6b7280;font-size:0.85em;margin-top:24px">— ACBCC English Ministry Team</p>
</div>`

    try {
      await mailer.sendMail({
        from: process.env.EMAIL_FROM || `ACBCC EM <${process.env.EMAIL_USER}>`,
        to: member.email,
        subject: `Your ${MONTH_NAMES[month]} ${year} Schedule — ACBCC English Ministry`,
        html,
        text: `Hi ${member.name},\n\nReminder: you have duties in ${MONTH_NAMES[month]} ${year}:\n\n${duties.map(d => `• ${d.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} — ${d.eventName}`).join('\n')}\n\nThank you!\n— ACBCC English Ministry`,
      })
      sent.push({ name: member.name, email: member.email })
    } catch (err) {
      errors.push({ name: member.name, email: member.email, error: err.message })
    }
  }

  res.json({ sent, skipped, errors })
})

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`✓ Auth server → http://localhost:${PORT}`))
