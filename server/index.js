import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const PASSWORDS_FILE = join(__dirname, 'passwords.json')
const SCHEDULE_FILE  = join(__dirname, 'schedule.json')
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES = '8h'
const ROLES = ['calendar', 'praiseTeam', 'worship', 'admin']

if (!JWT_SECRET || JWT_SECRET === 'replace-with-a-long-random-secret-string') {
  console.warn('⚠ WARNING: JWT_SECRET not set. Update server/.env before deploying.')
}

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

const getPasswords = () => JSON.parse(readFileSync(PASSWORDS_FILE, 'utf-8'))
const savePasswords = (p) => writeFileSync(PASSWORDS_FILE, JSON.stringify(p, null, 2))

function getSchedule() {
  if (!existsSync(SCHEDULE_FILE)) return {}
  const raw = JSON.parse(readFileSync(SCHEDULE_FILE, 'utf-8'))
  // Migrate old single-object format → array
  const out = {}
  for (const [k, v] of Object.entries(raw)) {
    out[k] = Array.isArray(v) ? v : [v]
  }
  return out
}
const saveSchedule = (s) => writeFileSync(SCHEDULE_FILE, JSON.stringify(s, null, 2))

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

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

initPasswords()

// POST /api/login
app.post('/api/login', (req, res) => {
  const { role, password } = req.body ?? {}
  if (!role || !password || !ROLES.includes(role)) {
    return res.status(400).json({ error: 'Invalid request' })
  }
  const hash = getPasswords()[role]
  if (!hash || !bcrypt.compareSync(password, hash)) {
    return res.status(401).json({ error: 'Incorrect password' })
  }
  const token = jwt.sign({ role }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
  res.json({ token, role })
})

// GET /api/me
app.get('/api/me', requireAuth(), (req, res) => {
  res.json({ role: req.user.role })
})

// POST /api/admin/change-password  (admin only)
app.post('/api/admin/change-password', requireAuth('admin'), (req, res) => {
  const { role, newPassword } = req.body ?? {}
  if (!role || !newPassword || !ROLES.includes(role)) {
    return res.status(400).json({ error: 'Invalid request' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }
  const passwords = getPasswords()
  passwords[role] = bcrypt.hashSync(newPassword, 10)
  savePasswords(passwords)
  res.json({ success: true })
})

// GET /api/schedule  — any authenticated user
app.get('/api/schedule', requireAuth(), (_req, res) => {
  res.json(getSchedule())
})

// PUT /api/schedule/:date  { entries: [{ eventName, personOnDuty }] }
app.put('/api/schedule/:date', requireAuth(), (req, res) => {
  const { date } = req.params
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date format' })
  }
  const { entries } = req.body ?? {}
  if (!Array.isArray(entries)) {
    return res.status(400).json({ error: 'entries must be an array' })
  }
  const schedule = getSchedule()
  const filtered = entries.filter(e => e?.eventName || e?.personOnDuty)
  if (filtered.length === 0) {
    delete schedule[date]
  } else {
    schedule[date] = filtered
  }
  saveSchedule(schedule)
  res.json({ success: true })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`✓ Auth server → http://localhost:${PORT}`))
