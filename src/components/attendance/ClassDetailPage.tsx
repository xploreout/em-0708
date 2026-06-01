import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  ArrowLeft, CheckCircle2, Search, Save, X, Mail, UserX,
  MapPin, Clock, Calendar, RefreshCw, Eye, EyeOff,
  ClipboardList, BarChart2, Edit2, Users, Key, LogOut,
  Plus, ChevronDown, ChevronRight,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────
type ClassInfo = {
  id: number; name: string; lead_name: string; lead_email: string; description: string
  location: string; meeting_day: string; meeting_time: string
  recurrence: string; end_date: string | null
}
type Attendee  = { id: number; person_name: string; phone: string; attendee_notes: string; checked_in_at: string }
type Session   = { id: number; session_date: string; topic: string; notes: string; attendees: Attendee[] }
type SearchResult = { name: string; phone: string; lastSeen: string | null; inSystem: boolean }

const TODAY = new Date().toISOString().slice(0, 10)
const DAYS  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Confirm Overlay (2 s) ──────────────────────────────────────────────────────
function ConfirmOverlay({ name }: { name: string }) {
  return (
    <div className="fixed inset-0 z-50 bg-green-500 flex flex-col items-center justify-center select-none">
      <CheckCircle2 className="w-24 h-24 text-white mb-5 animate-bounce" />
      <h1 className="text-4xl font-bold text-white mb-2">{name}</h1>
      <p className="text-white text-xl opacity-90">Checked in!</p>
    </div>
  )
}

// ── Class Info Display (4 s) ───────────────────────────────────────────────────
function ClassInfoDisplay({ cls, todaySession }: { cls: ClassInfo; todaySession: Session | null }) {
  const [secs, setSecs] = useState(4)
  useEffect(() => {
    const t = setInterval(() => setSecs(s => s - 1), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-blue-600 flex flex-col items-center justify-center px-6 text-white select-none">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-5">
          <ClipboardList className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-3">{cls.name}</h1>
        {todaySession?.topic && (
          <p className="text-xl text-blue-100 mb-4">Today: <em>{todaySession.topic}</em></p>
        )}
        <div className="flex flex-col gap-2 items-center text-blue-100 text-base mb-6">
          {cls.meeting_day && cls.meeting_time && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {cls.meeting_day}s · {cls.meeting_time}
            </div>
          )}
          {cls.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {cls.location}
            </div>
          )}
          {cls.lead_name && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Leader: {cls.lead_name}
            </div>
          )}
        </div>
        <p className="text-blue-200 text-sm">Returning in {secs}s…</p>
      </div>
    </div>
  )
}

// ── Lead Password Modal ────────────────────────────────────────────────────────
function LeadPasswordModal({ classId, onSuccess, onClose, authFetch }:
  { classId: string; onSuccess: () => void; onClose: () => void
    authFetch: (u: string, i?: RequestInit) => Promise<Response> }
) {
  const [pw, setPw]         = useState('')
  const [show, setShow]     = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { ref.current?.focus() }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!pw) return
    setLoading(true); setError('')
    const r = await authFetch(`/api/classes/${classId}/lead-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    })
    const d = await r.json()
    setLoading(false)
    if (!r.ok) { setError(d.error || 'Error'); return }
    if (d.ok) onSuccess()
    else setError('Incorrect password')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-gray-800">Leader Access</h3>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="relative">
            <input
              ref={ref}
              type={show ? 'text' : 'password'}
              value={pw}
              onChange={e => { setPw(e.target.value); setError('') }}
              placeholder="Enter leader password"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none focus:border-indigo-400 transition"
            />
            <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading || !pw}
            className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition disabled:opacity-50"
          >
            {loading ? 'Verifying…' : 'Enter leader mode'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Notify Modal ───────────────────────────────────────────────────────────────
function NotifyModal({ name, classId, onClose, authFetch }:
  { name: string; classId: string; onClose: () => void
    authFetch: (u: string, i?: RequestInit) => Promise<Response> }
) {
  const [sent, setSent]   = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy]   = useState(false)

  async function send() {
    setBusy(true); setError('')
    const r = await authFetch(`/api/classes/${classId}/notify-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person_name: name }),
    })
    const d = await r.json()
    setBusy(false)
    if (r.ok) setSent(true)
    else setError(d.error || 'Failed to send')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        <div className="flex items-center gap-2 mb-3">
          <UserX className="w-5 h-5 text-orange-500" />
          <h3 className="font-bold text-gray-800">Not in the system</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          <strong>{name}</strong> wasn't found. Notify your leader or tell them in person.
        </p>
        {sent ? (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" /> Leader notified by email!
          </div>
        ) : (
          <>
            <button
              onClick={send}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition disabled:opacity-50 mb-3"
            >
              <Mail className="w-4 h-4" />
              {busy ? 'Sending…' : 'Email class leader'}
            </button>
            {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
          </>
        )}
        <div className="text-center text-sm bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <strong className="text-amber-700">Tell the class leader in person</strong>
          <br /><span className="text-amber-600 text-xs">so they can add you to the roster.</span>
        </div>
      </div>
    </div>
  )
}

// ── Kiosk Check-in Panel ───────────────────────────────────────────────────────
function KioskCheckinPanel({ classId, isLeadMode, onCheckedIn, authFetch }:
  { classId: string; isLeadMode: boolean; onCheckedIn?: (name: string) => void
    authFetch: (u: string, i?: RequestInit) => Promise<Response> }
) {
  const [q, setQ]                 = useState('')
  const [results, setResults]     = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [todayList, setTodayList] = useState<Attendee[]>([])
  const [flash, setFlash]         = useState<{ msg: string; ok: boolean } | null>(null)
  const [notifyFor, setNotifyFor] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const loadToday = useCallback(async () => {
    const r = await authFetch(`/api/classes/${classId}/sessions`)
    const sessions: Session[] = await r.json()
    const today = sessions.find(s => s.session_date === TODAY)
    setTodayList(today?.attendees || [])
  }, [classId, authFetch])

  useEffect(() => {
    loadToday()
    setTimeout(() => inputRef.current?.focus(), 80)
  }, [loadToday])

  useEffect(() => {
    if (!q.trim()) { setResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      const r = await authFetch(`/api/classes/${classId}/search?q=${encodeURIComponent(q)}`)
      const d = await r.json()
      setResults(Array.isArray(d) ? d : [])
      setSearching(false)
    }, 280)
    return () => clearTimeout(t)
  }, [q, classId, authFetch])

  async function doCheckin(name: string, phone = '') {
    const r = await authFetch(`/api/classes/${classId}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person_name: name, phone }),
    })
    const d = await r.json()
    if (!r.ok) {
      const msg = d.error === 'Already checked in today' ? `${name} is already checked in.` : (d.error || 'Error')
      setFlash({ msg, ok: false })
      setTimeout(() => setFlash(null), 3000)
      return
    }
    setTodayList(prev => [...prev, d])
    setQ(''); setResults([])
    if (isLeadMode) {
      setFlash({ msg: `${name} checked in!`, ok: true })
      setTimeout(() => setFlash(null), 3000)
    } else {
      onCheckedIn?.(name)
    }
  }

  async function doRemove(aid: number) {
    const r = await authFetch(`/api/classes/${classId}/attendance/${aid}`, { method: 'DELETE' })
    if (r.ok) setTodayList(prev => prev.filter(a => a.id !== aid))
  }

  const noResults = q.trim().length > 0 && !searching && results.length === 0

  return (
    <div>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && q.trim() && results.length === 0) doCheckin(q.trim()) }}
          placeholder="Enter your name or phone number…"
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition bg-white"
          autoComplete="off"
        />
      </div>

      {flash && (
        <div className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl mb-3 ${flash.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {flash.ok && <CheckCircle2 className="w-4 h-4" />}
          {flash.msg}
        </div>
      )}

      {searching && <p className="text-xs text-gray-400 mb-2 px-1">Searching…</p>}

      {results.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-3">
          {results.map(r => (
            <button
              key={r.name}
              onClick={() => doCheckin(r.name, r.phone)}
              className="flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left transition"
            >
              <div>
                <div className="font-semibold text-blue-800 text-sm">{r.name}</div>
                {r.phone && <div className="text-xs text-blue-400">{r.phone}</div>}
                {r.lastSeen && <div className="text-xs text-gray-400">Last seen {fmtDate(r.lastSeen)}</div>}
              </div>
              <CheckCircle2 className="w-5 h-5 text-blue-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {noResults && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-4 mb-3">
          <div className="flex items-center gap-2 text-orange-700 font-semibold text-sm mb-3">
            <UserX className="w-4 h-4" />
            "{q}" not found
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => doCheckin(q.trim())}
              className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition"
            >
              Check in as "{q}" (new visitor)
            </button>
            <button
              onClick={() => setNotifyFor(q.trim())}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 border-orange-300 text-orange-700 hover:bg-orange-100 text-sm font-semibold transition"
            >
              <Mail className="w-3.5 h-3.5" /> Notify class leader
            </button>
          </div>
        </div>
      )}

      {q.trim() && results.length > 0 && (
        <button
          onClick={() => doCheckin(q.trim())}
          className="w-full py-2 rounded-xl border-2 border-dashed border-blue-200 text-blue-500 hover:bg-blue-50 text-sm font-medium transition mb-3"
        >
          Or check in as "{q}" directly
        </button>
      )}

      <div className="mt-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Today ({todayList.length})
        </h3>
        {todayList.length === 0 ? (
          <p className="text-sm text-gray-400">No check-ins yet.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {todayList.map(a => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{a.person_name}</div>
                  {a.phone && <div className="text-xs text-gray-400">{a.phone}</div>}
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(a.checked_in_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </div>
                {isLeadMode && (
                  <button
                    onClick={() => doRemove(a.id)}
                    className="text-gray-300 hover:text-red-500 transition flex-shrink-0"
                    title="Remove check-in"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {notifyFor && (
        <NotifyModal
          name={notifyFor}
          classId={classId}
          onClose={() => setNotifyFor(null)}
          authFetch={authFetch}
        />
      )}
    </div>
  )
}

// ── Leader Roster Panel ────────────────────────────────────────────────────────
function RosterPanel({ classId, sessions, onRefresh, authFetch }:
  { classId: string; sessions: Session[]
    onRefresh: () => void
    authFetch: (u: string, i?: RequestInit) => Promise<Response> }
) {
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [checkInNow, setCheckInNow] = useState(true)
  const [saving, setSaving] = useState(false)
  const [flash, setFlash] = useState('')

  // Build unique members from all sessions
  const memberMap = new Map<string, { name: string; phone: string; count: number; lastSeen: string }>()
  for (const s of sessions) {
    for (const a of s.attendees) {
      const key = a.person_name.toLowerCase().trim()
      const ex = memberMap.get(key)
      memberMap.set(key, {
        name: a.person_name,
        phone: a.phone || (ex?.phone ?? ''),
        count: (ex?.count ?? 0) + 1,
        lastSeen: (!ex || s.session_date > ex.lastSeen) ? s.session_date : ex.lastSeen,
      })
    }
  }
  const members = [...memberMap.values()].sort((a, b) => a.name.localeCompare(b.name))

  async function addMember() {
    if (!newName.trim()) return
    setSaving(true)
    if (checkInNow) {
      const r = await authFetch(`/api/classes/${classId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person_name: newName.trim(), phone: newPhone.trim() }),
      })
      const d = await r.json()
      if (!r.ok && d.error !== 'Already checked in today') {
        setFlash(d.error || 'Error'); setSaving(false); return
      }
    }
    setSaving(false)
    setFlash(`${newName.trim()} ${checkInNow ? 'checked in and added' : 'added'} to roster!`)
    setNewName(''); setNewPhone(''); setShowAdd(false)
    setTimeout(() => setFlash(''), 3000)
    onRefresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
          All Members ({members.length})
        </h3>
        <button
          onClick={() => setShowAdd(s => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
        >
          <Plus className="w-3.5 h-3.5" /> Add member
        </button>
      </div>

      {flash && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2.5 rounded-xl text-sm font-medium mb-3">
          <CheckCircle2 className="w-4 h-4" /> {flash}
        </div>
      )}

      {showAdd && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-4 flex flex-col gap-3">
          <h4 className="font-semibold text-blue-800 text-sm">Add New Member</h4>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Full name *"
            className="w-full border-2 border-blue-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-white"
            autoFocus
          />
          <input
            value={newPhone}
            onChange={e => setNewPhone(e.target.value)}
            placeholder="Phone (optional)"
            className="w-full border-2 border-blue-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-white"
          />
          <label className="flex items-center gap-2 text-sm text-blue-800 cursor-pointer">
            <input
              type="checkbox"
              checked={checkInNow}
              onChange={e => setCheckInNow(e.target.checked)}
              className="w-4 h-4 rounded accent-blue-600"
            />
            Check in for today's session
          </label>
          <div className="flex gap-2">
            <button
              onClick={addMember}
              disabled={saving || !newName.trim()}
              className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Add'}
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewName(''); setNewPhone('') }}
              className="px-4 py-2 rounded-xl border border-blue-200 text-blue-600 text-sm hover:bg-white transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {members.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">No members yet. Check-ins will appear here.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {members.map(m => (
            <div key={m.name} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
              <div>
                <div className="font-medium text-gray-800 text-sm">{m.name}</div>
                {m.phone && <div className="text-xs text-gray-400">{m.phone}</div>}
                <div className="text-xs text-gray-400">
                  {m.count} session{m.count !== 1 ? 's' : ''} · last {fmtDate(m.lastSeen)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Leader Edit Panel ──────────────────────────────────────────────────────────
function EditPanel({ cls, classId, sessions, onClassSaved, authFetch }:
  { cls: ClassInfo; classId: string; sessions: Session[]
    onClassSaved: (c: ClassInfo) => void
    authFetch: (u: string, i?: RequestInit) => Promise<Response> }
) {
  const [form, setForm] = useState({ ...cls })
  const [savingClass, setSavingClass] = useState(false)

  const todaySession = sessions.find(s => s.session_date === TODAY)
  const [topic, setTopic]           = useState(todaySession?.topic || '')
  const [sessionNotes, setSessionNotes] = useState(todaySession?.notes || '')
  const [savingSession, setSavingSession] = useState(false)

  const [attendeeNotes, setAttendeeNotes] = useState<Record<number, string>>(
    Object.fromEntries((todaySession?.attendees || []).map(a => [a.id, a.attendee_notes || '']))
  )

  const [flash, setFlash] = useState('')
  const showFlash = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(''), 2500) }

  async function saveClass(e: React.FormEvent) {
    e.preventDefault()
    setSavingClass(true)
    const r = await authFetch(`/api/classes/${classId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name, lead_name: form.lead_name, lead_email: form.lead_email,
        description: form.description, location: form.location,
        meeting_day: form.meeting_day, meeting_time: form.meeting_time,
        recurrence: form.recurrence,
        end_date: form.recurrence !== 'none' ? form.end_date || null : null,
      }),
    })
    setSavingClass(false)
    if (r.ok) {
      onClassSaved(await r.json())
      showFlash('Class info saved!')
    }
  }

  async function saveSession() {
    setSavingSession(true)
    await authFetch(`/api/classes/${classId}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, notes: sessionNotes, date: TODAY }),
    })
    setSavingSession(false)
    showFlash("Today's session saved!")
  }

  async function saveAttendeeNote(aid: number) {
    await authFetch(`/api/classes/${classId}/attendance/${aid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendee_notes: attendeeNotes[aid] ?? '' }),
    })
    showFlash('Note saved!')
  }

  const inp = 'w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition'
  const lbl = 'text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block'

  return (
    <div className="flex flex-col gap-6">
      {flash && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2.5 rounded-xl text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" /> {flash}
        </div>
      )}

      {/* Class Info */}
      <form onSubmit={saveClass}>
        <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wider">Class Info</h3>
        <div className="flex flex-col gap-3">
          <div><label className={lbl}>Class Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp} required /></div>
          <div><label className={lbl}>Leader Name</label><input value={form.lead_name} onChange={e => setForm(f => ({ ...f, lead_name: e.target.value }))} placeholder="e.g. Pastor John" className={inp} /></div>
          <div><label className={lbl}>Leader Email</label><input value={form.lead_email} onChange={e => setForm(f => ({ ...f, lead_email: e.target.value }))} type="email" className={inp} /></div>
          <div><label className={lbl}>Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className={`${inp} resize-none`} /></div>
        </div>

        {/* Schedule */}
        <h3 className="font-semibold text-gray-700 my-3 text-sm uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Schedule
        </h3>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Day</label>
              <select value={form.meeting_day} onChange={e => setForm(f => ({ ...f, meeting_day: e.target.value }))} className={inp}>
                <option value="">— no day —</option>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Time</label>
              <input
                type="time"
                value={form.meeting_time}
                onChange={e => setForm(f => ({ ...f, meeting_time: e.target.value }))}
                className={inp}
              />
            </div>
          </div>
          <div><label className={lbl}>Location</label><input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Room 201" className={inp} /></div>
          <div>
            <label className={lbl}>Recurring</label>
            <div className="flex gap-2">
              {(['none','weekly','monthly'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, recurrence: r }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition capitalize ${
                    form.recurrence === r ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {r === 'none' ? 'No recurrence' : r}
                </button>
              ))}
            </div>
          </div>
          {form.recurrence !== 'none' && (
            <div>
              <label className={lbl}>End Date</label>
              <input
                type="date"
                value={form.end_date || ''}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value || null }))}
                className={inp}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={savingClass}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {savingClass ? 'Saving…' : 'Save class info'}
        </button>
      </form>

      {/* Today's session */}
      <section>
        <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wider">
          Today's Session — {fmtDate(TODAY)}
        </h3>
        <div className="flex flex-col gap-3">
          <div><label className={lbl}>Topic</label><input value={topic} onChange={e => setTopic(e.target.value)} placeholder="What are you studying today?" className={inp} /></div>
          <div><label className={lbl}>Session Notes</label><textarea value={sessionNotes} onChange={e => setSessionNotes(e.target.value)} rows={3} placeholder="Notes for this session…" className={`${inp} resize-none`} /></div>
          <button onClick={saveSession} disabled={savingSession} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition disabled:opacity-50">
            <Save className="w-4 h-4" />{savingSession ? 'Saving…' : "Save today's session"}
          </button>
        </div>
      </section>

      {/* Attendee notes */}
      {todaySession && todaySession.attendees.length > 0 && (
        <section>
          <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wider">Attendee Notes — Today</h3>
          <div className="flex flex-col gap-3">
            {todaySession.attendees.map(a => (
              <div key={a.id} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <div className="font-medium text-gray-800 text-sm mb-1.5">{a.person_name}</div>
                <textarea
                  value={attendeeNotes[a.id] ?? ''}
                  onChange={e => setAttendeeNotes(p => ({ ...p, [a.id]: e.target.value }))}
                  rows={2}
                  placeholder="Notes about this person…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-400 resize-none bg-white"
                />
                <button onClick={() => saveAttendeeNote(a.id)} className="mt-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                  Save note
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ── Summary Panel ──────────────────────────────────────────────────────────────
function SummaryPanel({ sessions }: { sessions: Session[] }) {
  const sorted = [...sessions].sort((a, b) => a.session_date.localeCompare(b.session_date))
  const allNames = [...new Set(sorted.flatMap(s => s.attendees.map(a => a.person_name)))].sort()
  const attended = new Map<string, Set<string>>()
  for (const s of sorted)
    for (const a of s.attendees) {
      if (!attended.has(a.person_name)) attended.set(a.person_name, new Set())
      attended.get(a.person_name)!.add(s.session_date)
    }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { val: sessions.length,   label: 'Sessions',  bg: 'bg-blue-50 border-blue-100 text-blue-700 text-blue-500' },
          { val: allNames.length,   label: 'Members',   bg: 'bg-green-50 border-green-100 text-green-700 text-green-500' },
          { val: sessions.length > 0 ? Math.round(sessions.reduce((s, ss) => s + ss.attendees.length, 0) / sessions.length) : 0,
            label: 'Avg/Session', bg: 'bg-purple-50 border-purple-100 text-purple-700 text-purple-500' },
        ].map(({ val, label, bg }) => {
          const [bg1, bg2, t1, t2] = bg.split(' ')
          return (
            <div key={label} className={`${bg1} border ${bg2} rounded-xl px-3 py-3 text-center`}>
              <div className={`text-2xl font-bold ${t1}`}>{val}</div>
              <div className={`text-xs mt-0.5 ${t2}`}>{label}</div>
            </div>
          )
        })}
      </div>

      {sessions.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No sessions yet.</p>
      ) : (
        <>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Attendance Matrix</h3>
          <div className="overflow-x-auto rounded-xl border border-gray-200 mb-6">
            <table className="text-xs min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="sticky left-0 bg-gray-50 text-left px-3 py-2 font-semibold text-gray-600 border-r border-gray-200 min-w-32">Name</th>
                  {sorted.map(s => (
                    <th key={s.id} className="px-2 py-2 font-medium text-gray-500 text-center min-w-16 whitespace-nowrap">
                      <div>{new Date(s.session_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      {s.topic && <div className="text-gray-400 font-normal text-[10px] truncate max-w-[60px] mx-auto" title={s.topic}>{s.topic}</div>}
                    </th>
                  ))}
                  <th className="px-2 py-2 font-semibold text-gray-600 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {allNames.map((name, i) => (
                  <tr key={name} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="sticky left-0 px-3 py-2 font-medium text-gray-800 border-r border-gray-200 bg-inherit">{name}</td>
                    {sorted.map(s => (
                      <td key={s.id} className="px-2 py-2 text-center">
                        {attended.get(name)?.has(s.session_date)
                          ? <span className="text-green-500 font-bold">✓</span>
                          : <span className="text-gray-200">–</span>}
                      </td>
                    ))}
                    <td className="px-2 py-2 text-center font-semibold text-gray-700">{attended.get(name)?.size ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sessions</h3>
          <div className="flex flex-col gap-3">
            {[...sorted].reverse().map(s => (
              <details key={s.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 select-none list-none">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-800 text-sm">{fmtDate(s.session_date)}</span>
                    {s.topic && <span className="text-gray-500 text-sm">— {s.topic}</span>}
                  </div>
                  <span className="text-xs text-gray-400">{s.attendees.length} attended</span>
                </summary>
                <div className="px-4 pb-4 border-t border-gray-100">
                  {s.notes && <p className="text-xs text-gray-500 italic mt-2 mb-2 bg-gray-50 rounded-lg px-3 py-2">{s.notes}</p>}
                  <ul className="mt-2 flex flex-col gap-1">
                    {s.attendees.length === 0
                      ? <li className="text-xs text-gray-400">No attendees recorded.</li>
                      : s.attendees.map(a => (
                        <li key={a.id} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-gray-800 font-medium">{a.person_name}</span>
                            {a.phone && <span className="text-gray-400 text-xs ml-1">({a.phone})</span>}
                            {a.attendee_notes && <div className="text-xs text-gray-500 italic mt-0.5">{a.attendee_notes}</div>}
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              </details>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Main ClassDetailPage ───────────────────────────────────────────────────────
type LeadTab = 'checkin' | 'roster' | 'edit' | 'summary'
type KioskPhase = 'input' | 'confirmed' | 'classinfo'

export default function ClassDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate    = useNavigate()
  const location    = useLocation()
  const { authFetch, role } = useAuth()

  const navState = (location.state || {}) as { showClassInfo?: boolean; checkedInName?: string; leadUnlocked?: boolean }

  const [cls, setCls]         = useState<ClassInfo | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  const [showLeadModal, setShowLeadModal] = useState(false)
  const [leadUnlocked, setLeadUnlocked]   = useState(navState.leadUnlocked || false)
  const [leadTab, setLeadTab]             = useState<LeadTab>('checkin')

  const [phase, setPhase]               = useState<KioskPhase>('input')
  const [checkedInName, setCheckedInName] = useState(navState.checkedInName || '')

  const isLead = leadUnlocked || role === 'admin'

  const loadData = useCallback(async () => {
    const [clsRes, sessRes] = await Promise.all([
      authFetch(`/api/classes/${id}`),
      authFetch(`/api/classes/${id}/sessions`),
    ])
    setCls(await clsRes.json())
    const s = await sessRes.json()
    setSessions(Array.isArray(s) ? s : [])
    setLoading(false)
  }, [id, authFetch])

  useEffect(() => { loadData() }, [loadData])

  // If we arrived from AttendancePage after a check-in, jump straight to classinfo
  useEffect(() => {
    if (!loading && cls && navState.showClassInfo) {
      setPhase('classinfo')
    }
  }, [loading, cls]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-navigate back to /attendance after classinfo display
  useEffect(() => {
    if (phase !== 'classinfo') return
    const t = setTimeout(() => navigate('/attendance', { replace: true }), 4000)
    return () => clearTimeout(t)
  }, [phase, navigate])

  // Kiosk check-in done directly on this page → confirmed 2s → classinfo 4s
  function handleKioskCheckedIn(name: string) {
    setCheckedInName(name)
    setPhase('confirmed')
    setTimeout(() => setPhase('classinfo'), 2000)
  }

  const leadTabs: { id: LeadTab; label: string; Icon: React.ElementType }[] = [
    { id: 'checkin', label: 'Check-in', Icon: ClipboardList },
    { id: 'roster',  label: 'Roster',   Icon: Users },
    { id: 'edit',    label: 'Edit',     Icon: Edit2 },
    { id: 'summary', label: 'Summary',  Icon: BarChart2 },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    )
  }

  if (!cls) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <p className="text-gray-600">Class not found.</p>
        <button onClick={() => navigate('/attendance')} className="text-blue-600 text-sm hover:underline">Back to classes</button>
      </div>
    )
  }

  const todaySession = sessions.find(s => s.session_date === TODAY) ?? null

  // ── Kiosk mode (non-lead) ─────────────────────────────────────────────────
  if (!isLead) {
    return (
      <div className="min-h-screen bg-gray-50">
        {phase === 'confirmed' && <ConfirmOverlay name={checkedInName} />}
        {phase === 'classinfo' && <ClassInfoDisplay cls={cls} todaySession={todaySession} />}

        {phase === 'input' && (
          <>
            <div className="bg-white border-b border-gray-200 px-4 py-3">
              <div className="max-w-md mx-auto flex items-center justify-between">
                <button
                  onClick={() => navigate('/attendance')}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Classes
                </button>

                <div className="text-center flex-1 px-4">
                  <h1 className="text-base font-bold text-gray-800 truncate">{cls.name}</h1>
                  {cls.meeting_day && cls.meeting_time && (
                    <p className="text-xs text-gray-400">{cls.meeting_day}s · {cls.meeting_time}</p>
                  )}
                  {cls.location && (
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3" />{cls.location}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setShowLeadModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-bold transition"
                >
                  <Key className="w-3.5 h-3.5" /> Lead
                </button>
              </div>
            </div>

            <div className="max-w-md mx-auto px-4 py-6">
              <KioskCheckinPanel
                classId={id}
                isLeadMode={false}
                onCheckedIn={handleKioskCheckedIn}
                authFetch={authFetch}
              />
            </div>
          </>
        )}

        {showLeadModal && (
          <LeadPasswordModal
            classId={id}
            onSuccess={() => { setLeadUnlocked(true); setShowLeadModal(false) }}
            onClose={() => setShowLeadModal(false)}
            authFetch={authFetch}
          />
        )}
      </div>
    )
  }

  // ── Lead mode ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/attendance')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Classes
          </button>
          <div className="text-center flex-1 px-4">
            <h1 className="text-base font-bold text-gray-800 truncate">{cls.name}</h1>
            {cls.lead_name && <p className="text-xs text-gray-500">Leader: {cls.lead_name}</p>}
          </div>
          <button
            onClick={() => { setLeadUnlocked(false); setLeadTab('checkin') }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Exit
          </button>
        </div>
        <div className="max-w-lg mx-auto mt-2">
          <div className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
            <Key className="w-3 h-3" /> Leader Mode
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 px-4">
        <div className="max-w-lg mx-auto flex overflow-x-auto">
          {leadTabs.map(({ id: tid, label, Icon }) => (
            <button
              key={tid}
              onClick={() => setLeadTab(tid)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
                leadTab === tid ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {leadTab === 'checkin' && (
          <KioskCheckinPanel classId={id} isLeadMode authFetch={authFetch} />
        )}
        {leadTab === 'roster' && (
          <RosterPanel classId={id} sessions={sessions} onRefresh={loadData} authFetch={authFetch} />
        )}
        {leadTab === 'edit' && (
          <EditPanel cls={cls} classId={id} sessions={sessions} onClassSaved={c => { setCls(c); loadData() }} authFetch={authFetch} />
        )}
        {leadTab === 'summary' && (
          <SummaryPanel sessions={sessions} />
        )}
      </div>
    </div>
  )
}
