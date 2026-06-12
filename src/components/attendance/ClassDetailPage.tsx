import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PdfViewerModal from '../PdfViewerModal'
import {
  ArrowLeft,
  CheckCircle2,
  Search,
  Save,
  X,
  Mail,
  UserX,
  MapPin,
  Clock,
  Calendar,
  RefreshCw,
  Eye,
  EyeOff,
  BarChart2,
  Edit2,
  Users,
  Key,
  Plus,
  Archive,
  ArchiveRestore,
  Trash2,
  Upload,
  FileText,
  File,
  FileImage,
  Download,
  Loader2,
  Youtube,
  Link,
  Play,
  ExternalLink,
  UserPlus,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────
type ClassInfo = {
  id: number
  name: string
  lead_name: string
  lead_email: string
  description: string
  location: string
  meeting_day: string
  meeting_time: string
  end_time: string
  recurrence: string
  start_date: string | null
  end_date: string | null
  archived?: boolean
}
type Attendee = {
  id: number
  person_name: string
  phone: string
  attendee_notes: string
  checked_in_at: string
}
type Session = {
  id: number
  session_date: string
  topic: string
  notes: string
  session_lead_name: string
  status: string
  attendees: Attendee[]
}
type SearchResult = {
  name: string
  phone: string
  lastSeen: string | null
  inSystem: boolean
}
type ClassDoc = {
  id: number
  name: string
  url: string
  file_type: string
  size_bytes: number
  created_at: string
  session_id: number | null
  session_date: string | null
}

const TODAY = new Date().toISOString().slice(0, 10)
const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ── Lead Password Modal ────────────────────────────────────────────────────────
function LeadPasswordModal({
  classId,
  onSuccess,
  onClose,
  authFetch,
}: {
  classId: string
  onSuccess: () => void
  onClose: () => void
  authFetch: (u: string, i?: RequestInit) => Promise<Response>
}) {
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!pw) return
    setLoading(true)
    setError('')
    const r = await authFetch(`/api/classes/${classId}/lead-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    })
    const d = await r.json()
    setLoading(false)
    if (!r.ok) {
      setError(d.error || 'Error')
      return
    }
    if (d.ok) onSuccess()
    else setError('Incorrect password')
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4'
      onClick={onClose}
    >
      <div
        className='bg-white rounded-lg shadow-2xl w-full max-w-sm p-6 relative'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'
        >
          <X className='w-4 h-4' />
        </button>
        <div className='flex items-center gap-2 mb-4'>
          <Key className='w-5 h-5 text-indigo-600' />
          <h3 className='font-bold text-gray-800'>Leader Access</h3>
        </div>
        <form onSubmit={submit} className='flex flex-col gap-3'>
          <div className='relative'>
            <input
              ref={ref}
              type={show ? 'text' : 'password'}
              value={pw}
              onChange={(e) => {
                setPw(e.target.value)
                setError('')
              }}
              placeholder='Enter leader password'
              className='w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm outline-none focus:border-indigo-400 transition'
            />
            <button
              type='button'
              onClick={() => setShow((s) => !s)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'
            >
              {show ? (
                <EyeOff className='w-4 h-4' />
              ) : (
                <Eye className='w-4 h-4' />
              )}
            </button>
          </div>
          {error && <p className='text-red-500 text-xs'>{error}</p>}
          <button
            type='submit'
            disabled={loading || !pw}
            className='py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition disabled:opacity-50'
          >
            {loading ? 'Verifying…' : 'Enter leader mode'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Notify Modal ───────────────────────────────────────────────────────────────
function NotifyModal({
  name,
  classId,
  onClose,
  authFetch,
}: {
  name: string
  classId: string
  onClose: () => void
  authFetch: (u: string, i?: RequestInit) => Promise<Response>
}) {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function send() {
    setBusy(true)
    setError('')
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
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4'
      onClick={onClose}
    >
      <div
        className='bg-white rounded-lg shadow-2xl w-full max-w-sm p-6 relative'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'
        >
          <X className='w-4 h-4' />
        </button>
        <div className='flex items-center gap-2 mb-3'>
          <UserX className='w-5 h-5 text-orange-500' />
          <h3 className='font-bold text-gray-800'>Not in the system</h3>
        </div>
        <p className='text-sm text-gray-600 mb-4'>
          <strong>{name}</strong> wasn't found. Notify your leader or tell them
          in person.
        </p>
        {sent ? (
          <div className='flex items-center gap-2 text-green-600 text-sm font-medium'>
            <CheckCircle2 className='w-4 h-4' /> Leader notified by email!
          </div>
        ) : (
          <>
            <button
              onClick={send}
              disabled={busy}
              className='w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition disabled:opacity-50 mb-3'
            >
              <Mail className='w-4 h-4' />
              {busy ? 'Sending…' : 'Email class leader'}
            </button>
            {error && <p className='text-red-500 text-xs mb-2'>{error}</p>}
          </>
        )}
        <div className='text-center text-sm bg-amber-50 border border-amber-200 rounded-lg px-4 py-3'>
          <strong className='text-amber-700'>
            Tell the class leader in person
          </strong>
          <br />
          <span className='text-amber-600 text-xs'>
            so they can add you to the roster.
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Kiosk Check-in Panel ───────────────────────────────────────────────────────
function KioskCheckinPanel({
  classId,
  isLeadMode,
  onCheckedIn,
  authFetch,
  cls,
}: {
  classId: string
  isLeadMode: boolean
  onCheckedIn?: (name: string) => void
  authFetch: (u: string, i?: RequestInit) => Promise<Response>
  cls?: ClassInfo
}) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [flash, setFlash] = useState<{ msg: string; ok: boolean } | null>(null)
  const [notifyFor, setNotifyFor] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [allSessions, setAllSessions] = useState<Session[]>([])
  const [selectedDate, setSelectedDate] = useState(TODAY)
  const [checkins, setCheckins] = useState<Attendee[]>([])

  const loadSessions = useCallback(async () => {
    const r = await authFetch(`/api/classes/${classId}/sessions`)
    const s = await r.json()
    setAllSessions(Array.isArray(s) ? s : [])
  }, [classId, authFetch])

  useEffect(() => {
    loadSessions()
    setTimeout(() => inputRef.current?.focus(), 80)
  }, [loadSessions])

  // All valid session dates: scheduled dates (past/today) + any off-schedule session dates
  // Sorted ascending (oldest first); nearest to today is last
  const availableDates = React.useMemo(() => {
    const scheduled = cls
      ? generateSessionDates(cls).filter((d) => d <= TODAY)
      : []
    const fromSessions = allSessions
      .map((s) => s.session_date)
      .filter((d) => d <= TODAY)
    return [...new Set([...scheduled, ...fromSessions])].sort((a, b) =>
      a.localeCompare(b),
    )
  }, [cls, allSessions])

  // Default to the date nearest to today (last in ascending list)
  useEffect(() => {
    if (availableDates.length > 0 && !availableDates.includes(selectedDate)) {
      setSelectedDate(availableDates[availableDates.length - 1])
    }
  }, [availableDates]) // eslint-disable-line react-hooks/exhaustive-deps

  // Recompute checkins list whenever selected date or sessions data changes
  useEffect(() => {
    const s = allSessions.find((s) => s.session_date === selectedDate)
    setCheckins(s?.attendees || [])
  }, [selectedDate, allSessions])

  useEffect(() => {
    if (!q.trim()) {
      setResults([])
      return
    }
    const t = setTimeout(async () => {
      setSearching(true)
      const r = await authFetch(
        `/api/classes/${classId}/search?q=${encodeURIComponent(q)}`,
      )
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
      body: JSON.stringify({
        person_name: name,
        phone,
        session_date: selectedDate,
      }),
    })
    const d = await r.json()
    if (!r.ok) {
      const isAlready = d.error === 'Already checked in'
      const dateLabel =
        selectedDate === TODAY ? 'today' : `on ${fmtDate(selectedDate)}`
      const msg = isAlready
        ? `${name} is already checked in ${dateLabel}.`
        : d.error || 'Error'
      setFlash({ msg, ok: false })
      setTimeout(() => setFlash(null), 3000)
      return
    }
    setCheckins((prev) => [...prev, d])
    setAllSessions((prev) => {
      const idx = prev.findIndex((s) => s.session_date === selectedDate)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = {
          ...updated[idx],
          attendees: [...updated[idx].attendees, d],
        }
        return updated
      }
      return prev
    })
    setQ('')
    setResults([])
    if (isLeadMode) {
      setFlash({ msg: `${name} checked in!`, ok: true })
      setTimeout(() => setFlash(null), 3000)
    } else {
      onCheckedIn?.(name)
    }
  }

  async function doRemove(aid: number) {
    const r = await authFetch(`/api/classes/${classId}/attendance/${aid}`, {
      method: 'DELETE',
    })
    if (r.ok) setCheckins((prev) => prev.filter((a) => a.id !== aid))
  }

  const noResults = q.trim().length > 0 && !searching && results.length === 0

  return (
    <div>
      {/* Session date selector */}
      <div className='mb-4'>
        <label className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5'>
          <Calendar className='w-3.5 h-3.5' /> Session Date
        </label>
        {availableDates.length > 0 ? (
          <select
            value={selectedDate}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            className='w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-400 transition bg-white'
          >
            {[...availableDates].reverse().map((date, idx) => (
              <option key={date} value={date}>
                {idx === 0
                  ? `★ ${date === TODAY ? 'Today' : fmtDate(date)} (most recent)`
                  : fmtDate(date)}
              </option>
            ))}
          </select>
        ) : (
          <input
            type='date'
            value={selectedDate}
            max={TODAY}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            className='w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-400 transition bg-white'
          />
        )}
      </div>

      <div className='relative mb-3'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && q.trim() && results.length === 0)
              doCheckin(q.trim())
          }}
          placeholder='Enter your name or phone number…'
          className='w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition bg-white'
          autoComplete='off'
        />
      </div>

      {flash && (
        <div
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg mb-3 ${flash.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}
        >
          {flash.ok && <CheckCircle2 className='w-4 h-4' />}
          {flash.msg}
        </div>
      )}

      {searching && (
        <p className='text-xs text-gray-400 mb-2 px-1'>Searching…</p>
      )}

      {results.length > 0 && (
        <div className='flex flex-col gap-1.5 mb-3'>
          {results.map((r) => (
            <button
              key={r.name}
              onClick={() => doCheckin(r.name, r.phone)}
              className='flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-left transition'
            >
              <div>
                <div className='font-semibold text-blue-800 text-sm'>
                  {r.name}
                </div>
                {r.phone && (
                  <div className='text-xs text-blue-400'>{r.phone}</div>
                )}
                {r.lastSeen && (
                  <div className='text-xs text-gray-400'>
                    Last seen {fmtDate(r.lastSeen)}
                  </div>
                )}
              </div>
              <CheckCircle2 className='w-5 h-5 text-blue-300 flex-shrink-0' />
            </button>
          ))}
        </div>
      )}

      {noResults && (
        <div className='bg-orange-50 border border-orange-200 rounded-lg px-4 py-4 mb-3'>
          <div className='flex items-center gap-2 text-orange-700 font-semibold text-sm mb-3'>
            <UserX className='w-4 h-4' />"{q}" not found
          </div>
          <div className='flex flex-col gap-2'>
            <button
              onClick={() => doCheckin(q.trim())}
              className='w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition'
            >
              Check in as "{q}" (new visitor)
            </button>
            <button
              onClick={() => setNotifyFor(q.trim())}
              className='w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 border-orange-300 text-orange-700 hover:bg-orange-100 text-sm font-semibold transition'
            >
              <Mail className='w-3.5 h-3.5' /> Notify class leader
            </button>
          </div>
        </div>
      )}

      {q.trim() && results.length > 0 && (
        <button
          onClick={() => doCheckin(q.trim())}
          className='w-full py-2 rounded-lg border-2 border-dashed border-blue-200 text-blue-500 hover:bg-blue-50 text-sm font-medium transition mb-3'
        >
          Or check in as "{q}" directly
        </button>
      )}

      <div className='mt-5'>
        <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
          {selectedDate === TODAY ? 'Today' : fmtDate(selectedDate)} (
          {checkins.length})
        </h3>
        {checkins.length === 0 ? (
          <p className='text-sm text-gray-400'>No check-ins yet.</p>
        ) : (
          <div className='flex flex-col gap-1.5'>
            {checkins.map((a) => (
              <div
                key={a.id}
                className='flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-100 rounded-lg shadow-sm'
              >
                <CheckCircle2 className='w-4 h-4 text-green-500 flex-shrink-0' />
                <div className='flex-1 min-w-0'>
                  <div className='text-sm font-medium text-gray-800 truncate'>
                    {a.person_name}
                  </div>
                  {a.phone && (
                    <div className='text-xs text-gray-400'>{a.phone}</div>
                  )}
                </div>
                <div className='text-xs text-gray-400 flex-shrink-0'>
                  {new Date(a.checked_in_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
                {isLeadMode && (
                  <button
                    onClick={() => doRemove(a.id)}
                    className='text-gray-300 hover:text-red-500 transition flex-shrink-0'
                    title='Remove check-in'
                  >
                    <X className='w-3.5 h-3.5' />
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
function RosterPanel({
  classId,
  sessions,
  stableNames,
  onMemberAdded,
  onRefresh,
  authFetch,
}: {
  classId: string
  sessions: Session[]
  stableNames: string[]
  onMemberAdded: (name: string) => void
  onRefresh: () => void
  authFetch: (u: string, i?: RequestInit) => Promise<Response>
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [checkInNow, setCheckInNow] = useState(false)
  const [saving, setSaving] = useState(false)
  const [flash, setFlash] = useState('')
  const [removingName, setRemovingName] = useState<string | null>(null)

  async function doRemoveMember(name: string) {
    setRemovingName(name)
    await authFetch(`/api/classes/${classId}/roster/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    })
    setRemovingName(null)
    onRefresh()
  }
  const [nameResults, setNameResults] = useState<SearchResult[]>([])
  const [nameSearching, setNameSearching] = useState(false)
  const [nameDropdownOpen, setNameDropdownOpen] = useState(false)

  const [contactName,        setContactName]        = useState('')
  const [contactPhone,       setContactPhone]       = useState('')
  const [contactEmail,       setContactEmail]       = useState('')
  const [contactNotes,       setContactNotes]       = useState('')
  const [contactIsStudent,   setContactIsStudent]   = useState(false)
  const [contactSchoolLevel, setContactSchoolLevel] = useState('')
  const [contactSchoolYear,  setContactSchoolYear]  = useState('')
  const [savingContact, setSavingContact] = useState(false)
  const [contactFlash, setContactFlash] = useState<{
    msg: string
    ok: boolean
  } | null>(null)

  async function addContact() {
    if (!contactName.trim()) return
    setSavingContact(true)
    const r = await authFetch('/api/congregation/quick-add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: contactName.trim(),
        phone: contactPhone.trim(),
        email: contactEmail.trim(),
        notes: contactNotes.trim(),
        isStudent: contactIsStudent,
        schoolLevel: contactIsStudent ? contactSchoolLevel : '',
        schoolYear:  contactIsStudent ? contactSchoolYear  : '',
      }),
    })
    const d = await r.json()
    setSavingContact(false)
    if (r.ok) {
      setContactName(''); setContactPhone(''); setContactEmail('')
      setContactNotes(''); setContactIsStudent(false)
      setContactSchoolLevel(''); setContactSchoolYear('')
      setContactFlash({ msg: `${d.name || contactName} added to congregation.`, ok: true })
    } else {
      setContactFlash({ msg: d.error || 'Failed to add contact', ok: false })
    }
    setTimeout(() => setContactFlash(null), 3000)
  }

  useEffect(() => {
    if (!newName.trim()) {
      setNameResults([])
      setNameDropdownOpen(false)
      return
    }
    const t = setTimeout(async () => {
      setNameSearching(true)
      const r = await authFetch(
        `/api/classes/${classId}/search?q=${encodeURIComponent(newName)}`,
      )
      const d = await r.json()
      setNameResults(Array.isArray(d) ? d : [])
      setNameSearching(false)
      setNameDropdownOpen(true)
    }, 280)
    return () => clearTimeout(t)
  }, [newName, classId, authFetch])

  // Build session-derived member map
  const memberMap = new Map<
    string,
    { name: string; phone: string; count: number; lastSeen: string }
  >()
  for (const s of sessions) {
    for (const a of s.attendees) {
      const key = a.person_name.toLowerCase().trim()
      const ex = memberMap.get(key)
      memberMap.set(key, {
        name: a.person_name,
        phone: a.phone || (ex?.phone ?? ''),
        count: (ex?.count ?? 0) + 1,
        lastSeen:
          !ex || s.session_date > ex.lastSeen ? s.session_date : ex.lastSeen,
      })
    }
  }

  // Merge: session members + stable names (signed up but no check-ins yet)
  const allMembers = [
    ...memberMap.values(),
    ...stableNames
      .filter(n => !memberMap.has(n.toLowerCase().trim()))
      .map(n => ({ name: n, phone: '', count: 0, lastSeen: '' })),
  ].sort((a, b) => a.name.localeCompare(b.name))

  async function addMember() {
    if (!newName.trim()) return
    setSaving(true)
    if (checkInNow) {
      const r = await authFetch(`/api/classes/${classId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person_name: newName.trim(),
          phone: newPhone.trim(),
        }),
      })
      const d = await r.json()
      if (!r.ok && d.error !== 'Already checked in today') {
        setFlash(d.error || 'Error')
        setSaving(false)
        return
      }
    }
    onMemberAdded(newName.trim())
    setSaving(false)
    setFlash(
      `${newName.trim()} ${checkInNow ? 'checked in and added' : 'added'} to roster!`,
    )
    setNewName('')
    setNewPhone('')
    setShowAdd(false)
    setTimeout(() => setFlash(''), 3000)
    onRefresh()
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-semibold text-gray-700 text-sm uppercase tracking-wider'>
          Already Signed Up ({allMembers.length})
        </h3>
        <button
          onClick={() => setShowAdd((s) => !s)}
          className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition'
        >
          <Plus className='w-3.5 h-3.5' /> Quick Signup
        </button>
      </div>

      {flash && (
        <div className='flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2.5 rounded-lg text-sm font-medium mb-3'>
          <CheckCircle2 className='w-4 h-4' /> {flash}
        </div>
      )}

      {showAdd && (
        <div className='bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4 flex flex-col gap-3'>
          <h4 className='font-semibold text-blue-800 text-sm'>
            New Signup
          </h4>
          <div className='relative'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value)
                  setNameDropdownOpen(true)
                }}
                onFocus={() => newName.trim() && setNameDropdownOpen(true)}
                onBlur={() => setTimeout(() => setNameDropdownOpen(false), 150)}
                placeholder='Full name or phone number *'
                className='w-full pl-10 pr-4 border-2 border-blue-200 rounded-lg py-2.5 text-sm outline-none focus:border-blue-400 bg-white'
                autoFocus
              />
              {nameSearching && (
                <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin' />
              )}
            </div>
            {nameDropdownOpen && nameResults.length > 0 && (
              <div className='absolute z-20 w-full mt-1 bg-white border border-blue-200 rounded-lg shadow-lg overflow-hidden'>
                {nameResults.map((r) => (
                  <button
                    key={r.name}
                    type='button'
                    onMouseDown={() => {
                      setNewName(r.name)
                      setNewPhone(r.phone || '')
                      setNameResults([])
                      setNameDropdownOpen(false)
                    }}
                    className='w-full flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 text-left border-b border-gray-100 last:border-0'
                  >
                    <div>
                      <div className='font-semibold text-gray-800 text-sm'>{r.name}</div>
                      {r.phone && <div className='text-xs text-gray-400'>{r.phone}</div>}
                      {r.lastSeen && <div className='text-xs text-gray-400'>Last seen {fmtDate(r.lastSeen)}</div>}
                    </div>
                    <CheckCircle2 className='w-4 h-4 text-blue-300 flex-shrink-0' />
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder='Phone (optional)'
            className='w-full border-2 border-blue-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-white'
          />
          <label className='flex items-center gap-2 text-sm text-blue-800 cursor-pointer'>
            <input
              type='checkbox'
              checked={checkInNow}
              onChange={(e) => setCheckInNow(e.target.checked)}
              className='w-4 h-4 rounded accent-blue-600'
            />
            Check in for today's session
          </label>
          <div className='flex gap-2'>
            <button
              onClick={addMember}
              disabled={saving || !newName.trim()}
              className='flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition disabled:opacity-50'
            >
              {saving ? 'Saving…' : 'Add'}
            </button>
            <button
              onClick={() => {
                setShowAdd(false)
                setNewName('')
                setNewPhone('')
                setNameResults([])
                setNameDropdownOpen(false)
              }}
              className='px-4 py-2 rounded-lg border border-blue-200 text-blue-600 text-sm hover:bg-white transition'
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {allMembers.length === 0 ? (
        <p className='text-sm text-gray-400 py-6 text-center'>
          No members yet. Use New Signup to add someone.
        </p>
      ) : (
        <div className='flex flex-col gap-1.5'>
          {allMembers.map((m) => (
            <div
              key={m.name}
              className='flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-3 shadow-sm'
            >
              <div>
                <div className='font-medium text-gray-800 text-sm'>
                  {m.name}
                </div>
                {m.phone && (
                  <div className='text-xs text-gray-400'>{m.phone}</div>
                )}
                <div className='text-xs text-gray-400'>
                  {m.count > 0
                    ? `${m.count} session${m.count !== 1 ? 's' : ''} · last ${fmtDate(m.lastSeen)}`
                    : 'Signed up · no sessions yet'}
                </div>
              </div>
              <button
                onClick={() => doRemoveMember(m.name)}
                disabled={removingName === m.name}
                className='text-red-400 hover:text-red-600 transition flex-shrink-0 ml-2'
                title='Remove from roster'
              >
                {removingName === m.name ? (
                  <Loader2 className='w-3.5 h-3.5 animate-spin' />
                ) : (
                  <Trash2 className='w-3.5 h-3.5' />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quick Add to Contact Record */}
      <div className='mt-6 border-t border-gray-100 pt-5'>
        <h3 className='font-semibold text-gray-700 text-sm uppercase tracking-wider flex items-center gap-2 mb-3'>
          <UserPlus className='w-4 h-4 text-indigo-500' /> Quick Add to Contacts
        </h3>
        {contactFlash && (
          <div
            className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg mb-3 ${contactFlash.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}
          >
            {contactFlash.ok && <CheckCircle2 className='w-3.5 h-3.5' />}
            {contactFlash.msg}
          </div>
        )}
        <div className='flex gap-2 mb-2'>
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder='Full name *'
            className='flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white'
          />
          <input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder='Phone'
            className='flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white'
          />
          <input
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder='Email'
            className='flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white'
          />
        </div>
        <textarea
          value={contactNotes}
          onChange={(e) => setContactNotes(e.target.value)}
          placeholder='Notes (optional)'
          rows={2}
          className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white resize-none mb-2'
        />
        <div className='flex items-center gap-2 mb-2'>
          <input
            id='roster-is-student'
            type='checkbox'
            checked={contactIsStudent}
            onChange={(e) => setContactIsStudent(e.target.checked)}
            className='w-4 h-4 rounded border-gray-300 accent-indigo-600 cursor-pointer'
          />
          <label htmlFor='roster-is-student' className='text-sm font-medium text-gray-700 cursor-pointer select-none'>
            Student
          </label>
        </div>
        {contactIsStudent && (
          <div className='flex gap-2 mb-2 pl-3 border-l-2 border-indigo-100'>
            <select
              value={contactSchoolLevel}
              onChange={(e) => setContactSchoolLevel(e.target.value)}
              className='flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white'
            >
              <option value=''>— Grade/Level —</option>
              {[...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`), ...Array.from({ length: 6 }, (_, i) => `College ${i + 1}`), 'Other'].map(lvl => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
            <select
              value={contactSchoolYear}
              onChange={(e) => setContactSchoolYear(e.target.value)}
              className='flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white'
            >
              <option value=''>— School Year —</option>
              {(() => {
                const now = new Date(); const y = now.getFullYear(); const base = now.getMonth() + 1 >= 8 ? y : y - 1
                return Array.from({ length: 6 }, (_, i) => { const s = base - 2 + i; return `${s}-${s + 1}` })
              })().map(yr => <option key={yr} value={yr}>{yr}</option>)}
            </select>
          </div>
        )}
        <button
          onClick={addContact}
          disabled={savingContact || !contactName.trim()}
          className='flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition disabled:opacity-50'
        >
          {savingContact ? (
            <Loader2 className='w-3.5 h-3.5 animate-spin' />
          ) : (
            <UserPlus className='w-3.5 h-3.5' />
          )}
          {savingContact ? 'Adding…' : 'Quick Add'}
        </button>
      </div>
    </div>
  )
}

// ── Session Schedule Panel ────────────────────────────────────────────────────
const DAY_IDX = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

function generateSessionDates(cls: ClassInfo): string[] {
  if (!cls.start_date || !cls.end_date || cls.recurrence === 'none') return []
  const end = new Date(cls.end_date + 'T00:00:00')
  let cur = new Date(cls.start_date + 'T00:00:00')
  // Align weekly recurrence to the class meeting_day
  if (cls.recurrence === 'weekly' && cls.meeting_day) {
    const target = DAY_IDX.indexOf(cls.meeting_day)
    if (target >= 0) {
      const diff = (target - cur.getDay() + 7) % 7
      cur.setDate(cur.getDate() + diff)
    }
  }
  const dates: string[] = []
  let guard = 0
  while (cur <= end && guard++ < 500) {
    dates.push(cur.toISOString().slice(0, 10))
    if (cls.recurrence === 'weekly') cur.setDate(cur.getDate() + 7)
    else cur.setMonth(cur.getMonth() + 1)
  }
  return dates
}

function SessionSchedulePanel({
  cls,
  sessions,
  classId,
  authFetch,
  onRefresh,
  skippedDates = new Set(),
  onSkipDate,
}: {
  cls: ClassInfo
  sessions: Session[]
  classId: string
  authFetch: (u: string, i?: RequestInit) => Promise<Response>
  onRefresh: () => void
  skippedDates?: Set<string>
  onSkipDate?: (date: string) => void
}) {
  const genDates = generateSessionDates(cls)

  // Build rows: actual sessions at their real session_date, plus empty slots for
  // generated dates that have no session. This means rows survive navigation because
  // they are derived from DB data, not from transient component state.
  const genDateSet = new Set(genDates)
  const sessionDates = new Set(sessions.map((s) => s.session_date))
  const rows: Array<{
    key: string
    date: string
    session: Session | undefined
  }> = [
    ...sessions.map((s) => ({
      key: s.session_date,
      date: s.session_date,
      session: s,
    })),
    ...genDates
      .filter((d) => !sessionDates.has(d))
      .map((d) => ({ key: d, date: d, session: undefined })),
  ].sort((a, b) => a.date.localeCompare(b.date))

  // State keyed by the row's effective date (session_date for real sessions, generated date for empty slots)
  const initLeaders = () =>
    Object.fromEntries(
      rows.map((r) => [r.date, r.session?.session_lead_name || '']),
    )
  const initTopics = () =>
    Object.fromEntries(rows.map((r) => [r.date, r.session?.topic || '']))

  const [leaders, setLeaders] = useState<Record<string, string>>(initLeaders)
  const [origLeaders] = useState<Record<string, string>>(initLeaders)
  const [topics, setTopics] = useState<Record<string, string>>(initTopics)
  const [origTopics] = useState<Record<string, string>>(initTopics)
  const [editedDates, setEditedDates] = useState<Record<string, string>>({})
  const [savingDate, setSavingDate] = useState<string | null>(null)
  const [savedDate, setSavedDate] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Refs so event handlers always see latest state without stale-closure issues
  const editedDatesRef = useRef<Record<string, string>>({})
  editedDatesRef.current = editedDates

  async function deleteSession(session: Session) {
    if (
      !confirm(
        `Delete session on ${fmtDate(session.session_date)}? This removes all attendance records for this session.`,
      )
    )
      return
    setDeletingId(session.id)
    await authFetch(`/api/classes/${classId}/sessions/${session.id}`, {
      method: 'DELETE',
    })
    setDeletingId(null)
    onRefresh()
  }

  if (rows.length === 0) return null

  async function save(rowDate: string, newDateOverride?: string) {
    if (savingDate) return
    const leader = leaders[rowDate] ?? ''
    const topic = topics[rowDate] ?? ''
    const newDate = newDateOverride ?? editedDatesRef.current[rowDate]
    const existing = sessions.find((s) => s.session_date === rowDate)
    setSavingDate(rowDate)
    if (existing) {
      await authFetch(`/api/classes/${classId}/sessions/${existing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          notes: existing.notes,
          session_lead_name: leader,
          status: existing.status,
          ...(newDate && newDate !== rowDate ? { session_date: newDate } : {}),
        }),
      })
    } else {
      await authFetch(`/api/classes/${classId}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newDate || rowDate,
          topic,
          notes: '',
          session_lead_name: leader,
          status: '',
        }),
      })
    }
    setEditedDates((p) => {
      const n = { ...p }
      delete n[rowDate]
      return n
    })
    setSavingDate(null)
    setSavedDate(rowDate)
    setTimeout(() => setSavedDate((d) => (d === rowDate ? null : d)), 1500)
    onRefresh()
  }

  function handleBlur(rowDate: string, domValue?: string) {
    const leaderChanged =
      (leaders[rowDate] ?? '') !== (origLeaders[rowDate] ?? '')
    const topicChanged = (topics[rowDate] ?? '') !== (origTopics[rowDate] ?? '')
    const pending = domValue ?? editedDatesRef.current[rowDate]
    const dateChanged = !!pending && pending !== rowDate
    if (dateChanged) {
      editedDatesRef.current = { ...editedDatesRef.current, [rowDate]: pending }
      setEditedDates((p) => ({ ...p, [rowDate]: pending }))
      save(rowDate, pending)
    } else if (leaderChanged || topicChanged) {
      save(rowDate)
    }
  }

  const today = TODAY
  const rowIsGenerated = (d: string) => genDateSet.has(d)

  return (
    <section>
      <h3 className='font-semibold text-gray-700 mb-1 text-sm uppercase tracking-wider flex items-center gap-2'>
        <Users className='w-4 h-4' /> Session Leaders Schedule
      </h3>
      <p className='text-xs text-gray-400 mb-3'>
        Click any field to edit. Auto-saves when you move away.
      </p>

      <div className='rounded-lg border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm border-collapse'>
            <thead>
              <tr className='bg-gray-100 border-b border-gray-200'>
                <th className='px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-8'>
                  #
                </th>
                <th className='px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  Date
                </th>
                <th className='px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  Session Leader
                </th>
                <th className='px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  Session Topic
                </th>
                <th className='px-3 py-2 w-8'></th>
              </tr>
            </thead>
            <tbody>
              {rows.filter(r => !skippedDates.has(r.date)).map(({ key, date, session }, idx) => {
                const activeDate = editedDates[date] || date
                const isPast = activeDate < today
                const isToday = activeDate === today
                const isSaving = savingDate === date
                const isSaved = savedDate === date
                const isOffSched = !!session && !rowIsGenerated(date)

                return (
                  <tr
                    key={key}
                    className={`border-b border-gray-100 last:border-0 ${
                      isToday
                        ? 'bg-blue-50'
                        : isPast
                          ? 'bg-gray-50/60'
                          : 'bg-white'
                    }`}
                  >
                    <td className='px-3 py-2 text-xs text-gray-400 font-medium'>
                      {isOffSched ? (
                        <span
                          title='Off-schedule session'
                          className='text-orange-400'
                        >
                          *
                        </span>
                      ) : (
                        idx + 1
                      )}
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='date'
                        value={editedDates[date] ?? date}
                        onChange={(e) =>
                          setEditedDates((p) => ({
                            ...p,
                            [date]: e.target.value,
                          }))
                        }
                        onBlur={(e) =>
                          handleBlur(date, e.currentTarget.value || undefined)
                        }
                        className={`border rounded-lg px-3 py-2 text-xs outline-none transition w-36 ${
                          isToday
                            ? 'border-blue-300 focus:border-blue-500 bg-white'
                            : 'border-gray-200 focus:border-blue-400 bg-white'
                        }`}
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <div className='flex items-center gap-1.5'>
                        <input
                          value={leaders[date] ?? ''}
                          onChange={(e) =>
                            setLeaders((p) => ({
                              ...p,
                              [date]: e.target.value,
                            }))
                          }
                          onBlur={() => handleBlur(date)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur()
                          }}
                          placeholder='Enter leader name…'
                          className={`flex-1 min-w-0 border rounded-lg px-2.5 py-1.5 text-sm outline-none transition ${
                            isToday
                              ? 'border-blue-300 focus:border-blue-500 bg-white'
                              : 'border-gray-200 focus:border-blue-400 bg-white'
                          }`}
                        />
                        {isSaving && (
                          <Loader2 className='w-3.5 h-3.5 text-blue-400 animate-spin flex-shrink-0' />
                        )}
                        {isSaved && (
                          <CheckCircle2 className='w-3.5 h-3.5 text-green-500 flex-shrink-0' />
                        )}
                      </div>
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        value={topics[date] ?? ''}
                        onChange={(e) =>
                          setTopics((p) => ({ ...p, [date]: e.target.value }))
                        }
                        onBlur={() => handleBlur(date)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.currentTarget.blur()
                        }}
                        placeholder='Enter session topic…'
                        className={`w-full border rounded-lg px-2.5 py-1.5 text-sm outline-none transition ${
                          isToday
                            ? 'border-blue-300 focus:border-blue-500 bg-white'
                            : 'border-gray-200 focus:border-blue-400 bg-white'
                        }`}
                      />
                    </td>
                    <td className='px-2 py-2'>
                      <button
                        onClick={() =>
                          session
                            ? deleteSession(session)
                            : onSkipDate?.(date)
                        }
                        disabled={!!session && deletingId === session.id}
                        className='text-red-400 hover:text-red-600 transition disabled:opacity-40'
                        title='Delete session'
                      >
                        {session && deletingId === session.id ? (
                          <Loader2 className='w-3.5 h-3.5 animate-spin' />
                        ) : (
                          <Trash2 className='w-3.5 h-3.5' />
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

// ── Leader Edit Panel ──────────────────────────────────────────────────────────
function EditPanel({
  cls,
  classId,
  sessions,
  onClassSaved,
  onDeleted,
  onRefresh,
  authFetch,
}: {
  cls: ClassInfo
  classId: string
  sessions: Session[]
  onClassSaved: (c: ClassInfo) => void
  onDeleted?: () => void
  onRefresh: () => void
  authFetch: (u: string, i?: RequestInit) => Promise<Response>
}) {
  const { role } = useAuth()
  const isAdmin = role === 'admin'
  const [skippedDates, setSkippedDates] = useState<Set<string>>(new Set())
  const [form, setForm] = useState({
    ...cls,
    start_date: cls.start_date || '',
    end_date: cls.end_date || '',
    end_time: cls.end_time || '',
  })
  const [initForm] = useState({
    ...cls,
    start_date: cls.start_date || '',
    end_date: cls.end_date || '',
    end_time: cls.end_time || '',
  })
  const [savingClass, setSavingClass] = useState(false)

  // Per-session lead names for all sessions
  const [sessionLeads, setSessionLeads] = useState<Record<number, string>>(
    Object.fromEntries(sessions.map((s) => [s.id, s.session_lead_name || ''])),
  )
  const [savingLeadId, setSavingLeadId] = useState<number | null>(null)
  const [deletingSessionId, setDeletingSessionId] = useState<number | null>(
    null,
  )

  async function deleteSession(sessionId: number, sessionDate: string) {
    if (
      !confirm(
        `Delete session on ${fmtDate(sessionDate)}? This removes all attendance records for this session.`,
      )
    )
      return
    setDeletingSessionId(sessionId)
    await authFetch(`/api/classes/${classId}/sessions/${sessionId}`, {
      method: 'DELETE',
    })
    setDeletingSessionId(null)
    onRefresh()
  }

  const [flash, setFlash] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [dangerBusy, setDangerBusy] = useState(false)
  const showFlash = (msg: string) => {
    setFlash(msg)
    setTimeout(() => setFlash(''), 2500)
  }

  async function archiveClass() {
    setDangerBusy(true)
    const r = await authFetch(`/api/classes/${classId}/archive`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived: !cls.archived }),
    })
    setDangerBusy(false)
    if (r.ok) {
      const updated: ClassInfo = await r.json()
      onClassSaved(updated)
      showFlash(`Class ${updated.archived ? 'archived' : 'restored'}.`)
    } else {
      showFlash('Action failed')
    }
  }

  async function deleteClass() {
    setDangerBusy(true)
    const r = await authFetch(`/api/classes/${classId}`, { method: 'DELETE' })
    setDangerBusy(false)
    if (r.ok) onDeleted?.()
    else showFlash('Delete failed')
  }

  async function handleSave() {
    if (!form.name.trim()) {
      showFlash('Class name is required')
      return
    }
    setSavingClass(true)
    const r1 = await authFetch(`/api/classes/${classId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        lead_name: form.lead_name,
        lead_email: form.lead_email,
        description: form.description,
        location: form.location,
        meeting_day: form.meeting_day,
        meeting_time: form.meeting_time,
        end_time: form.end_time,
        recurrence: form.recurrence,
        start_date: form.start_date || null,
        end_date: form.recurrence !== 'none' ? form.end_date || null : null,
      }),
    })
    setSavingClass(false)
    if (r1.ok) {
      onClassSaved(await r1.json())
      showFlash('Saved!')
    } else {
      showFlash('Save failed')
    }
  }

  function handleCancel() {
    setForm({ ...initForm })
  }

  async function saveSessionLead(session: Session) {
    setSavingLeadId(session.id)
    await authFetch(`/api/classes/${classId}/sessions/${session.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: session.topic,
        notes: session.notes,
        session_lead_name: sessionLeads[session.id] ?? '',
      }),
    })
    setSavingLeadId(null)
    showFlash('Session leader saved!')
  }

  const inp =
    'w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 font-medium outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition bg-white'
  const lbl =
    'text-xs font-bold text-gray-600 uppercase tracking-widest mb-1.5 block'
  const sectionH =
    'font-bold text-indigo-700 mb-3 text-sm uppercase tracking-wider flex items-center gap-2'

  return (
    <div className='flex flex-col gap-6'>
      {flash && (
        <div className='flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2.5 rounded-lg text-sm font-medium'>
          <CheckCircle2 className='w-4 h-4' /> {flash}
        </div>
      )}

      {/* Class Info */}
      <div>
        <div className='flex flex-col gap-3'>
          <div>
            <label className={lbl}>Class Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inp}
              required
            />
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div>
              <label className={lbl}>Leader Name</label>
              <input
                value={form.lead_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lead_name: e.target.value }))
                }
                placeholder='e.g. Pastor John'
                className={inp}
              />
            </div>
            <div>
              <label className={lbl}>Leader Email</label>
              <input
                value={form.lead_email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lead_email: e.target.value }))
                }
                type='email'
                className={inp}
              />
            </div>
          </div>
          <div>
            <label className={lbl}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={2}
              className={`${inp} resize-none`}
            />
          </div>
        </div>

        <div className='flex flex-col gap-3 mt-4'>
          <div className='flex gap-3'>
            <select
              value={form.meeting_day}
              onChange={(e) =>
                setForm((f) => ({ ...f, meeting_day: e.target.value }))
              }
              className={`${inp} flex-1`}
            >
              <option value=''>— no day —</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <div
              className={`${inp} flex-1 flex items-center gap-1 !py-0 !px-2`}
            >
              <input
                type='time'
                value={form.meeting_time}
                onChange={(e) =>
                  setForm((f) => ({ ...f, meeting_time: e.target.value }))
                }
                className='w-[88px] outline-none bg-transparent py-2.5 text-sm'
              />
              <span className='text-gray-400 text-xs flex-shrink-0'>–</span>
              <input
                type='time'
                value={form.end_time}
                onChange={(e) =>
                  setForm((f) => ({ ...f, end_time: e.target.value }))
                }
                className='w-[88px] outline-none bg-transparent py-2.5 text-sm'
              />
            </div>
            <input
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              placeholder='Location'
              className={`${inp} flex-1`}
            />
          </div>
          <div className='flex gap-5'>
            {(['none', 'weekly', 'monthly'] as const).map((r) => (
              <label key={r} className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='radio'
                  name='recurrence'
                  value={r}
                  checked={form.recurrence === r}
                  onChange={() => setForm((f) => ({ ...f, recurrence: r }))}
                  className='accent-blue-600 w-4 h-4'
                />
                <span className='text-sm text-gray-700 capitalize'>
                  {r === 'none' ? 'One Time' : r}
                </span>
              </label>
            ))}
          </div>
          <div className='flex items-center gap-2'>
            <input
              type='date'
              value={form.start_date || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, start_date: e.target.value || '' }))
              }
              className={`${inp} flex-1`}
            />
            {form.recurrence !== 'none' && (
              <>
                <span className='text-sm text-gray-400 flex-shrink-0'>to</span>
                <input
                  type='date'
                  value={form.end_date || ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, end_date: e.target.value || '' }))
                  }
                  className={`${inp} flex-1`}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Session Leaders — spreadsheet for recurring classes, simple list otherwise */}
      {form.recurrence !== 'none' && form.start_date && form.end_date ? (
        <SessionSchedulePanel
          cls={{
            ...cls,
            recurrence: form.recurrence,
            start_date: form.start_date,
            end_date: form.end_date,
            meeting_day: form.meeting_day,
          }}
          sessions={sessions}
          classId={classId}
          authFetch={authFetch}
          onRefresh={onRefresh}
          skippedDates={skippedDates}
          onSkipDate={(date) => setSkippedDates(prev => new Set([...prev, date]))}
        />
      ) : (
        sessions.length > 0 && (
          <section>
            <h3 className={`${sectionH}`}>
              <Users className='w-4 h-4' /> Session Leaders
            </h3>
            <div className='flex flex-col gap-2'>
              {[...sessions]
                .sort((a, b) => a.session_date.localeCompare(b.session_date))
                .map((s) => (
                  <div
                    key={s.id}
                    className='flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5'
                  >
                    <div className='w-28 flex-shrink-0'>
                      <div className='text-xs font-semibold text-gray-700'>
                        {fmtDate(s.session_date)}
                      </div>
                      {s.topic && (
                        <div className='text-xs text-gray-400 truncate'>
                          {s.topic}
                        </div>
                      )}
                    </div>
                    <input
                      value={sessionLeads[s.id] ?? ''}
                      onChange={(e) =>
                        setSessionLeads((p) => ({
                          ...p,
                          [s.id]: e.target.value,
                        }))
                      }
                      placeholder='Session leader name…'
                      className='flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-400 transition bg-white'
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveSessionLead(s)
                      }}
                    />
                    <button
                      onClick={() => saveSessionLead(s)}
                      disabled={savingLeadId === s.id}
                      className='flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition disabled:opacity-50 flex-shrink-0'
                    >
                      {savingLeadId === s.id ? (
                        'Saving…'
                      ) : (
                        <Save className='w-3 h-3' />
                      )}
                    </button>
                    <button
                      onClick={() => deleteSession(s.id, s.session_date)}
                      disabled={deletingSessionId === s.id}
                      className='text-red-400 hover:text-red-600 transition disabled:opacity-40 flex-shrink-0'
                      title='Delete session'
                    >
                      {deletingSessionId === s.id ? (
                        <Loader2 className='w-3.5 h-3.5 animate-spin' />
                      ) : (
                        <Trash2 className='w-3.5 h-3.5' />
                      )}
                    </button>
                  </div>
                ))}
            </div>
          </section>
        )
      )}

      {/* Save / Cancel */}
      <div className='flex gap-2'>
        <button
          onClick={handleSave}
          disabled={savingClass}
          className='flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition disabled:opacity-50'
        >
          <Save className='w-4 h-4' />
          {savingClass ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={handleCancel}
          disabled={savingClass}
          className='px-5 py-2.5 rounded-lg border-2 border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition disabled:opacity-50'
        >
          Cancel
        </button>
      </div>

      {/* Admin danger zone */}
      {isAdmin && (
        <section className='border-t-2 border-dashed border-red-200 pt-5'>
          <h3 className='font-semibold text-red-500 mb-3 text-sm uppercase tracking-wider'>
            Admin Actions
          </h3>
          <div className='flex flex-col gap-2'>
            <button
              type='button'
              onClick={archiveClass}
              disabled={dangerBusy}
              className='flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-amber-300 text-amber-700 hover:bg-amber-50 font-semibold text-sm transition disabled:opacity-50'
            >
              {cls.archived ? (
                <>
                  <ArchiveRestore className='w-4 h-4' /> Restore Class
                </>
              ) : (
                <>
                  <Archive className='w-4 h-4' /> Archive Class
                </>
              )}
            </button>

            {!confirmDelete ? (
              <button
                type='button'
                onClick={() => setConfirmDelete(true)}
                className='flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-red-300 text-red-600 hover:bg-red-50 font-semibold text-sm transition'
              >
                <Trash2 className='w-4 h-4' /> Delete Class
              </button>
            ) : (
              <div className='bg-red-50 border-2 border-red-300 rounded-lg p-4'>
                <p className='text-sm text-red-700 font-medium mb-3 text-center'>
                  Delete <strong>"{cls.name}"</strong>? All sessions and
                  attendance will be permanently removed.
                </p>
                <div className='flex gap-2'>
                  <button
                    type='button'
                    onClick={() => setConfirmDelete(false)}
                    className='flex-1 py-2 rounded-lg border border-red-200 text-red-500 text-sm font-semibold hover:bg-white transition'
                  >
                    Cancel
                  </button>
                  <button
                    type='button'
                    onClick={deleteClass}
                    disabled={dangerBusy}
                    className='flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition disabled:opacity-50'
                  >
                    {dangerBusy ? 'Deleting…' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

// ── Summary Panel ──────────────────────────────────────────────────────────────
function SummaryPanel({
  cls,
  sessions: sessionsProp,
  stableNames,
  classId,
  authFetch,
  onRefresh,
}: {
  cls: ClassInfo
  sessions: Session[]
  stableNames: string[]
  classId: string
  authFetch: (u: string, i?: RequestInit) => Promise<Response>
  onRefresh: () => void
}) {
  // Local copy for optimistic updates
  const [sessions, setSessions] = useState(sessionsProp)
  useEffect(() => {
    setSessions(sessionsProp)
  }, [sessionsProp])

  const [busyKey, setBusyKey] = useState<string | null>(null)

  const sorted = [...sessions].sort((a, b) =>
    a.session_date.localeCompare(b.session_date),
  )

  const attended = new Map<string, Set<string>>()
  const attendeeIdMap = new Map<string, number>()
  for (const s of sorted)
    for (const a of s.attendees) {
      if (!attended.has(a.person_name)) attended.set(a.person_name, new Set())
      attended.get(a.person_name)!.add(s.session_date)
      attendeeIdMap.set(`${a.person_name}::${s.session_date}`, a.id)
    }

  async function removeCheckin(name: string, date: string) {
    const aid = attendeeIdMap.get(`${name}::${date}`)
    if (!aid) return
    const key = `${name}::${date}`
    setBusyKey(key)
    // Optimistic: remove attendee from local state immediately
    setSessions((prev) =>
      prev.map((s) =>
        s.session_date === date
          ? { ...s, attendees: s.attendees.filter((a) => a.id !== aid) }
          : s,
      ),
    )
    await authFetch(`/api/classes/${classId}/attendance/${aid}`, {
      method: 'DELETE',
    })
    setBusyKey(null)
    onRefresh()
  }

  async function addCheckin(name: string, date: string) {
    const key = `${name}::${date}`
    setBusyKey(key)
    const r = await authFetch(`/api/classes/${classId}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person_name: name, session_date: date }),
    })
    if (r.ok) {
      const newAttendee: Attendee = await r.json()
      setSessions((prev) => {
        const idx = prev.findIndex((s) => s.session_date === date)
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = {
            ...updated[idx],
            attendees: [...updated[idx].attendees, newAttendee],
          }
          return updated
        }
        // Date had no session yet — add a stub; onRefresh will fill it in properly
        return [
          ...prev,
          {
            id: -Date.now(),
            session_date: date,
            topic: '',
            notes: '',
            session_lead_name: '',
            status: '',
            attendees: [newAttendee],
          },
        ]
      })
      onRefresh()
    }
    setBusyKey(null)
  }

  // All columns: generated schedule dates merged with actual session dates
  const genDates =
    cls.recurrence !== 'none' && cls.start_date && cls.end_date
      ? generateSessionDates(cls)
      : []
  const sessionDateMap = new Map(sorted.map((s) => [s.session_date, s]))
  const allMatrixDates = [
    ...new Set([...genDates, ...sorted.map((s) => s.session_date)]),
  ].sort().filter((d) => d <= TODAY)

  const firstSession = sorted[0]?.session_date
  const lastSession = sorted[sorted.length - 1]?.session_date

  return (
    <div>
      {/* Class info card */}
      <div className='bg-white border border-gray-200 rounded-lg px-5 py-4 mb-5 flex flex-col gap-2'>
        <h2 className='text-base font-bold text-gray-800'>{cls.name}</h2>
        {cls.description && (
          <p className='text-sm text-gray-500'>{cls.description}</p>
        )}
        <div className='flex flex-wrap gap-x-5 gap-y-1.5 mt-1'>
          {cls.lead_name && (
            <span className='flex items-center gap-1.5 text-xs text-gray-500'>
              <Users className='w-3.5 h-3.5 text-gray-400' /> {cls.lead_name}
            </span>
          )}
          {cls.meeting_day && cls.meeting_time && (
            <span className='flex items-center gap-1.5 text-xs text-gray-500'>
              <Clock className='w-3.5 h-3.5 text-gray-400' /> {cls.meeting_day}s
              · {cls.meeting_time}
            </span>
          )}
          {cls.location && (
            <span className='flex items-center gap-1.5 text-xs text-gray-500'>
              <MapPin className='w-3.5 h-3.5 text-gray-400' /> {cls.location}
            </span>
          )}
          {cls.recurrence && cls.recurrence !== 'none' && (
            <span className='flex items-center gap-1.5 text-xs text-gray-500'>
              <RefreshCw className='w-3.5 h-3.5 text-gray-400' />
              {cls.recurrence.charAt(0).toUpperCase() + cls.recurrence.slice(1)}
              {cls.start_date && cls.end_date
                ? ` · ${fmtDate(cls.start_date)} – ${fmtDate(cls.end_date)}`
                : cls.end_date
                  ? ` until ${fmtDate(cls.end_date)}`
                  : ''}
            </span>
          )}
          {firstSession && (
            <span className='flex items-center gap-1.5 text-xs text-gray-500'>
              <Calendar className='w-3.5 h-3.5 text-gray-400' />
              {firstSession === lastSession
                ? `Started ${fmtDate(firstSession)}`
                : `${fmtDate(firstSession)} – ${fmtDate(lastSession!)}`}
            </span>
          )}
        </div>
      </div>

      {/* Attendance stats */}
      <div className='grid grid-cols-2 gap-3 mb-5'>
        {[
          {
            val: stableNames.length,
            label: 'Signed Up',
            bg: 'bg-green-50 border-green-100 text-green-700 text-green-500',
          },
          {
            val:
              sessions.length > 0
                ? Math.round(
                    sessions.reduce((s, ss) => s + ss.attendees.length, 0) /
                      sessions.length,
                  )
                : 0,
            label: 'Avg/Session',
            bg: 'bg-purple-50 border-purple-100 text-purple-700 text-purple-500',
          },
        ].map(({ val, label, bg }) => {
          const [bg1, bg2, t1, t2] = bg.split(' ')
          return (
            <div
              key={label}
              className={`${bg1} border ${bg2} rounded-lg px-3 py-3 text-center`}
            >
              <div className={`text-2xl font-bold ${t1}`}>{val}</div>
              <div className={`text-xs mt-0.5 ${t2}`}>{label}</div>
            </div>
          )
        })}
      </div>

      {allMatrixDates.length === 0 && stableNames.length === 0 ? (
        <p className='text-sm text-gray-400 text-center py-8'>
          No sessions yet.
        </p>
      ) : (
        <>
          <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'>
            Attendance Matrix
          </h3>
          <p className='text-xs text-gray-400 mb-2'>
            <span className='text-green-500 font-bold'>✓</span> checked in (click to remove) &nbsp;·&nbsp;
            <span className='text-gray-400 font-bold'>+</span> not checked in (click to add)
          </p>
          <div className='rounded-lg border border-gray-200 mb-6 overflow-auto max-h-[480px]'>
            <table className='text-xs min-w-full'>
              <thead className='sticky top-0 z-10'>
                <tr className='bg-gray-50 border-b border-gray-200'>
                  <th className='sticky left-0 z-20 bg-gray-50 text-left px-3 py-2 font-semibold text-gray-600 border-r border-gray-200 min-w-32'>
                    Name
                  </th>
                  {allMatrixDates.map((date) => {
                    const s = sessionDateMap.get(date)
                    return (
                      <th
                        key={date}
                        className='px-2 py-2 font-medium text-gray-500 text-center min-w-16 whitespace-nowrap'
                      >
                        <div>
                          {new Date(date + 'T00:00:00').toLocaleDateString(
                            'en-US',
                            { month: 'short', day: 'numeric' },
                          )}
                        </div>
                        {s?.topic && (
                          <div
                            className='text-gray-400 font-normal text-[10px] truncate max-w-[60px] mx-auto'
                            title={s.topic}
                          >
                            {s.topic}
                          </div>
                        )}
                      </th>
                    )
                  })}
                  <th className='px-2 py-2 font-semibold text-gray-600 text-center'>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {stableNames.map((name, i) => (
                  <tr
                    key={name}
                    className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className='sticky left-0 px-3 py-2 font-medium text-gray-800 border-r border-gray-200 bg-inherit'>
                      {name}
                    </td>
                    {allMatrixDates.map((date) => {
                      const key = `${name}::${date}`
                      const isChecked = attended.get(name)?.has(date)
                      const isBusy = busyKey === key
                      return (
                        <td key={date} className='px-2 py-2 text-center'>
                          {isBusy ? (
                            <Loader2 className='w-3 h-3 animate-spin inline text-gray-400' />
                          ) : isChecked ? (
                            <button
                              onClick={() => removeCheckin(name, date)}
                              title='Click to remove check-in'
                              className='text-green-500 font-bold hover:text-red-500 transition cursor-pointer'
                            >
                              ✓
                            </button>
                          ) : (
                            <button
                              onClick={() => addCheckin(name, date)}
                              title='Click to check in'
                              className='text-gray-300 hover:text-green-500 transition cursor-pointer font-bold'
                            >
                              +
                            </button>
                          )}
                        </td>
                      )
                    })}
                    <td className='px-2 py-2 text-center font-semibold text-gray-700'>
                      {attended.get(name)?.size ?? 0}
                    </td>
                  </tr>
                ))}
                {/* Total row per date */}
                <tr className='border-t-2 border-gray-300 bg-gray-100'>
                  <td className='sticky left-0 z-10 px-3 py-2 text-xs font-bold text-gray-700 border-r border-gray-200 bg-gray-100'>
                    Total
                  </td>
                  {allMatrixDates.map((date) => {
                    const s = sessionDateMap.get(date)
                    const count = s ? s.attendees.length : 0
                    return (
                      <td
                        key={date}
                        className='px-2 py-2 text-center text-xs font-bold text-gray-700'
                      >
                        {count > 0 ? (
                          count
                        ) : (
                          <span className='text-gray-300'>0</span>
                        )}
                      </td>
                    )
                  })}
                  <td className='px-2 py-2 text-center text-xs font-bold text-gray-700'>
                    {sessions.reduce((acc, s) => acc + s.attendees.length, 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

// ── Documents Panel ────────────────────────────────────────────────────────────
function ytVideoId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

function dlUrl(url: string) {
  return url.replace('/upload/', '/upload/fl_attachment/')
}

function formatBytes(b: number) {
  if (!b) return ''
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

function DocIcon({ type }: { type: string }) {
  if (type === 'video/youtube')
    return <Youtube className='w-4 h-4 text-red-500 flex-shrink-0' />
  if (type.startsWith('image/'))
    return <FileImage className='w-4 h-4 text-purple-500 flex-shrink-0' />
  if (type === 'application/pdf')
    return <FileText className='w-4 h-4 text-red-400 flex-shrink-0' />
  if (type.includes('word'))
    return <FileText className='w-4 h-4 text-blue-500 flex-shrink-0' />
  if (type.includes('powerpoint') || type.includes('presentation'))
    return <FileText className='w-4 h-4 text-orange-500 flex-shrink-0' />
  if (type.includes('excel') || type.includes('spreadsheet'))
    return <FileText className='w-4 h-4 text-green-600 flex-shrink-0' />
  return <File className='w-4 h-4 text-gray-400 flex-shrink-0' />
}

function DocumentsPanel({
  classId,
  authFetch,
  sessions = [],
}: {
  classId: string
  authFetch: (u: string, i?: RequestInit) => Promise<Response>
  sessions?: { id: number; session_date: string; topic: string }[]
}) {
  const { role } = useAuth()
  const [docs, setDocs] = useState<ClassDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'file' | 'yt'>('file')
  const [uploading, setUploading] = useState(false)
  const [flash, setFlash] = useState<{ msg: string; ok: boolean } | null>(null)
  const [docName, setDocName] = useState('')
  const [ytUrl, setYtUrl] = useState('')
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null,
  )
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [viewingPdf, setViewingPdf] = useState<{
    url: string
    name: string
    downloadUrl: string
  } | null>(null)
  const [expandedYt, setExpandedYt] = useState<Set<number>>(new Set())
  const fileRef = React.useRef<HTMLInputElement>(null)

  function toggleYt(id: number) {
    setExpandedYt((prev) => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  const showFlash = (msg: string, ok = true) => {
    setFlash({ msg, ok })
    setTimeout(() => setFlash(null), 3000)
  }

  useEffect(() => {
    authFetch(`/api/classes/${classId}/documents`)
      .then((r) => r.json())
      .then((d) => {
        setDocs(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [classId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    if (docName.trim()) fd.append('name', docName.trim())
    if (selectedSessionId) fd.append('session_id', String(selectedSessionId))
    try {
      const r = await authFetch(`/api/classes/${classId}/documents`, {
        method: 'POST',
        body: fd,
      })
      const d = await r.json()
      if (r.ok) {
        setDocs((prev) => [d, ...prev])
        setDocName('')
        showFlash('Uploaded!')
      } else showFlash(d.error || 'Upload failed', false)
    } catch {
      showFlash('Network error', false)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleYtAdd() {
    if (!ytUrl.trim()) return
    setUploading(true)
    try {
      const r = await authFetch(`/api/classes/${classId}/documents/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: docName.trim() || ytUrl.trim(),
          url: ytUrl.trim(),
          session_id: selectedSessionId,
        }),
      })
      const d = await r.json()
      if (r.ok) {
        setDocs((prev) => [d, ...prev])
        setDocName('')
        setYtUrl('')
        showFlash('Link added!')
      } else showFlash(d.error || 'Failed', false)
    } catch {
      showFlash('Network error', false)
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(docId: number) {
    setDeletingId(docId)
    const r = await authFetch(`/api/classes/${classId}/documents/${docId}`, {
      method: 'DELETE',
    })
    if (r.ok) {
      setDocs((prev) => prev.filter((d) => d.id !== docId))
      showFlash('Deleted.')
    }
    setDeletingId(null)
  }

  const inp =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition bg-white'

  return (
    <>
      {viewingPdf && (
        <PdfViewerModal
          url={viewingPdf.url}
          name={viewingPdf.name}
          downloadUrl={viewingPdf.downloadUrl}
          onClose={() => setViewingPdf(null)}
        />
      )}
      <div className='flex flex-col gap-3'>
        {flash && (
          <div
            className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg ${flash.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}
          >
            {flash.ok && <CheckCircle2 className='w-3.5 h-3.5' />}
            {flash.msg}
          </div>
        )}

        {/* Upload section */}
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-3'>
          {/* Tab toggle */}
          <div className='flex gap-1 mb-3 bg-white border border-gray-200 rounded-lg p-0.5 w-fit'>
            <button
              onClick={() => {
                setTab('file')
                fileRef.current?.click()
              }}
              disabled={uploading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition disabled:opacity-50 ${tab === 'file' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {uploading && tab === 'file' ? (
                <Loader2 className='w-3 h-3 animate-spin' />
              ) : (
                <Upload className='w-3 h-3' />
              )}{' '}
              File
            </button>
            <button
              onClick={() => setTab('yt')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${tab === 'yt' ? 'bg-red-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Youtube className='w-3 h-3' /> YouTube
            </button>
          </div>

          <div className='flex gap-2 mb-2'>
            {sessions.length > 0 && (
              <select
                value={selectedSessionId ?? ''}
                onChange={(e) =>
                  setSelectedSessionId(
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
                className={`${inp} w-auto`}
              >
                <option value=''>Class Document</option>
                {[...sessions]
                  .sort((a, b) => b.session_date.localeCompare(a.session_date))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {fmtDate(s.session_date)}
                      {s.topic ? ` — ${s.topic}` : ''}
                    </option>
                  ))}
              </select>
            )}
            <input
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder={
                tab === 'yt' ? 'Video title (optional)' : 'Title (optional)'
              }
              className={`${inp} flex-1`}
            />
          </div>

          {tab === 'file' ? (
            <>
              <input
                ref={fileRef}
                type='file'
                className='hidden'
                onChange={handleUpload}
                accept='.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,image/*'
              />
              {uploading ? (
                <p className='text-xs text-blue-500 text-center py-1 font-medium'>
                  Uploading…
                </p>
              ) : (
                <p className='text-xs text-gray-400 text-center'>
                  PDF, Word, PPT, Excel, images · max 20 MB
                </p>
              )}
            </>
          ) : (
            <>
              <input
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                placeholder='https://youtube.com/watch?v=…'
                className={`${inp} mb-2`}
              />
              <button
                onClick={handleYtAdd}
                disabled={uploading || !ytUrl.trim()}
                className='w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-xs transition disabled:opacity-50'
              >
                {uploading ? (
                  <>
                    <Loader2 className='w-3.5 h-3.5 animate-spin' /> Adding…
                  </>
                ) : (
                  <>
                    <Link className='w-3.5 h-3.5' /> Add YouTube Link
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Document list */}
        {loading ? (
          <p className='text-xs text-gray-400 py-3 text-center'>Loading…</p>
        ) : docs.length === 0 ? (
          <p className='text-xs text-gray-400 py-3 text-center'>
            No documents yet.
          </p>
        ) : (
          (() => {
            const renderDoc = (doc: ClassDoc) => {
              const isYt = doc.file_type === 'video/youtube'
              const isPdf = doc.file_type === 'application/pdf'
              const isImg = doc.file_type.startsWith('image/')
              const vid = isYt ? ytVideoId(doc.url) : null
              const ytExpanded = isYt && expandedYt.has(doc.id)
              return (
                <div
                  key={doc.id}
                  className='bg-white border border-gray-100 rounded-lg overflow-hidden'
                >
                  <div className='flex items-center gap-2 px-3 py-2'>
                    {vid ? (
                      <img
                        src={`https://img.youtube.com/vi/${vid}/default.jpg`}
                        alt=''
                        onClick={() => toggleYt(doc.id)}
                        className='w-10 h-7 object-cover rounded flex-shrink-0 cursor-pointer hover:opacity-80 transition'
                      />
                    ) : (
                      <DocIcon type={doc.file_type} />
                    )}
                    <div className='flex-1 min-w-0'>
                      <div className='text-sm font-medium text-gray-800 truncate leading-tight'>
                        {doc.name}
                      </div>
                      {doc.size_bytes > 0 && (
                        <span className='text-xs text-gray-400'>
                          {formatBytes(doc.size_bytes)}
                        </span>
                      )}
                    </div>
                    <div className='flex items-center gap-1 flex-shrink-0'>
                      {isYt && (
                        <>
                          <button
                            onClick={() => toggleYt(doc.id)}
                            className={`p-1.5 rounded transition ${ytExpanded ? 'text-red-500 bg-red-50' : 'text-red-400 hover:text-red-600'}`}
                            title={ytExpanded ? 'Hide player' : 'Play inline'}
                          >
                            <Play
                              className='w-3.5 h-3.5'
                              fill={ytExpanded ? 'currentColor' : 'none'}
                            />
                          </button>
                          <a
                            href={doc.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='p-1.5 text-gray-400 hover:text-red-500 transition'
                            title='Open on YouTube'
                          >
                            <ExternalLink className='w-3.5 h-3.5' />
                          </a>
                        </>
                      )}
                      {isPdf && (
                        <>
                          <button
                            onClick={() =>
                              setViewingPdf({
                                url: `/api/proxy-pdf?url=${encodeURIComponent(doc.url)}`,
                                name: doc.name,
                                downloadUrl: dlUrl(doc.url),
                              })
                            }
                            className='px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded transition'
                          >
                            View
                          </button>
                          <a
                            href={dlUrl(doc.url)}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='p-1.5 text-gray-400 hover:text-gray-600 transition'
                            title='Download'
                          >
                            <Download className='w-3.5 h-3.5' />
                          </a>
                        </>
                      )}
                      {(isImg || (!isYt && !isPdf)) && (
                        <a
                          href={isImg ? doc.url : dlUrl(doc.url)}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='p-1.5 text-gray-400 hover:text-blue-500 transition'
                          title={isImg ? 'View' : 'Download'}
                        >
                          <Download className='w-3.5 h-3.5' />
                        </a>
                      )}
                    </div>
                    {(role === 'admin' || role === 'attendance') && (
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                        className='p-1 text-red-400 hover:text-red-600 transition disabled:opacity-40 flex-shrink-0'
                      >
                        {deletingId === doc.id ? (
                          <Loader2 className='w-3.5 h-3.5 animate-spin' />
                        ) : (
                          <Trash2 className='w-3.5 h-3.5' />
                        )}
                      </button>
                    )}
                  </div>
                  {ytExpanded && vid && (
                    <div className='px-3 pb-3'>
                      <div className='aspect-video w-full rounded overflow-hidden bg-black'>
                        <iframe
                          src={`https://www.youtube.com/embed/${vid}?autoplay=1`}
                          className='w-full h-full'
                          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                          allowFullScreen
                          title={doc.name}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            const classDocs = docs.filter((d) => !d.session_id)

            // Session number based on chronological order (Session 1 = oldest)
            const sessionNumberMap = new Map<number, number>()
            ;[...sessions]
              .sort((a, b) => a.session_date.localeCompare(b.session_date))
              .forEach((s, i) => sessionNumberMap.set(s.id, i + 1))

            const sessionGroups = Object.values(
              docs
                .filter((d) => d.session_id)
                .reduce(
                  (acc, d) => {
                    const sid = d.session_id!
                    if (!acc[sid]) {
                      const sess = sessions.find((s) => s.id === sid)
                      acc[sid] = {
                        id: sid,
                        date: d.session_date || sess?.session_date || '',
                        topic: sess?.topic || '',
                        docs: [],
                      }
                    }
                    acc[sid].docs.push(d)
                    return acc
                  },
                  {} as Record<
                    number,
                    {
                      id: number
                      date: string
                      topic: string
                      docs: ClassDoc[]
                    }
                  >,
                ),
            ).sort((a, b) => a.date.localeCompare(b.date))

            return (
              <div className='flex flex-col gap-4'>
                {classDocs.length > 0 && (
                  <div>
                    <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5'>
                      Class Documents
                    </p>
                    <div className='flex flex-col gap-1'>
                      {classDocs.map(renderDoc)}
                    </div>
                  </div>
                )}
                {sessionGroups.map((sg) => {
                  const sessionNum = sessionNumberMap.get(sg.id)
                  return (
                    <div key={sg.id}>
                      <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5'>
                        {sessionNum != null ? `Session ${sessionNum} · ` : ''}
                        {fmtDate(sg.date)}
                        {sg.topic ? ` — ${sg.topic}` : ''}
                      </p>
                      <div className='flex flex-col gap-1'>
                        {sg.docs.map(renderDoc)}
                      </div>
                    </div>
                  )
                })}
                {classDocs.length === 0 && sessionGroups.length === 0 && (
                  <p className='text-xs text-gray-400 py-3 text-center'>
                    No documents yet.
                  </p>
                )}
              </div>
            )
          })()
        )}
      </div>
    </>
  )
}

// ── Main ClassDetailPage ───────────────────────────────────────────────────────
type LeadTab = 'roster' | 'edit' | 'summary' | 'docs'

export default function ClassDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { authFetch, role } = useAuth()

  const navState = (location.state || {}) as {
    leadUnlocked?: boolean
    defaultTab?: LeadTab
  }

  const [cls, setCls] = useState<ClassInfo | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  // Roster names are loaded from and persisted to the database.
  const [rosterStableNames, setRosterStableNames] = useState<string[]>([])

  function addToRoster(name: string) {
    const lower = name.toLowerCase().trim()
    setRosterStableNames(prev =>
      prev.some(n => n.toLowerCase().trim() === lower) ? prev : [...prev, name].sort()
    )
    authFetch(`/api/classes/${id}/roster`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ names: [name] }),
    }).catch(() => {})
  }

  const [showLeadModal, setShowLeadModal] = useState(false)
  const [leadUnlocked, setLeadUnlocked] = useState(
    navState.leadUnlocked || false,
  )
  const [leadTab, setLeadTab] = useState<LeadTab>(
    navState.defaultTab || 'roster',
  )

  const [kioskToast, setKioskToast] = useState('')

  const isLead = leadUnlocked || role === 'admin'

  const loadData = useCallback(async () => {
    const [clsRes, sessRes, rosterRes] = await Promise.all([
      authFetch(`/api/classes/${id}`),
      authFetch(`/api/classes/${id}/sessions`),
      authFetch(`/api/classes/${id}/roster`),
    ])
    setCls(await clsRes.json())
    const s = await sessRes.json()
    setSessions(Array.isArray(s) ? s : [])
    const r = await rosterRes.json()
    if (Array.isArray(r)) setRosterStableNames(r)
    setLoading(false)
  }, [id, authFetch])

  useEffect(() => {
    loadData()
  }, [loadData])

  function handleKioskCheckedIn(name: string) {
    setKioskToast(`${name} checked in!`)
    setTimeout(() => {
      setKioskToast('')
      navigate('/attendance', { replace: true })
    }, 1000)
  }

  const leadTabs: { id: LeadTab; label: string; Icon: React.ElementType }[] = [
    { id: 'roster', label: 'Roster', Icon: Users },
    { id: 'edit', label: 'Edit', Icon: Edit2 },
    { id: 'summary', label: 'Summary', Icon: BarChart2 },
    { id: 'docs', label: 'Docs', Icon: FileText },
  ]

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <p className='text-gray-400 text-sm'>Loading…</p>
      </div>
    )
  }

  if (!cls) {
    return (
      <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3'>
        <p className='text-gray-600'>Class not found.</p>
        <button
          onClick={() => navigate('/attendance')}
          className='text-blue-600 text-sm hover:underline'
        >
          Back to classes
        </button>
      </div>
    )
  }

  // ── Kiosk mode (non-lead) ─────────────────────────────────────────────────
  if (!isLead) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='bg-white border-b border-gray-200 px-4 py-3'>
          <div className='max-w-md mx-auto flex items-center justify-between'>
            <button
              onClick={() => navigate('/attendance')}
              className='flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition'
            >
              <ArrowLeft className='w-4 h-4' />
              Classes
            </button>

            <div className='text-center flex-1 px-4'>
              <h1 className='text-base font-bold text-gray-800 truncate'>
                {cls.name}
              </h1>
              {cls.meeting_day && cls.meeting_time && (
                <p className='text-xs text-gray-400'>
                  {cls.meeting_day}s · {cls.meeting_time}
                </p>
              )}
              {cls.location && (
                <p className='text-xs text-gray-400 flex items-center justify-center gap-1'>
                  <MapPin className='w-3 h-3' />
                  {cls.location}
                </p>
              )}
            </div>

            <button
              onClick={() => setShowLeadModal(true)}
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-bold transition'
            >
              <Key className='w-3.5 h-3.5' /> Lead
            </button>
          </div>
        </div>

        <div className='max-w-md mx-auto px-4 py-6'>
          {kioskToast && (
            <div className='flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-4 py-2.5 rounded-lg mb-4'>
              <CheckCircle2 className='w-4 h-4 flex-shrink-0' /> {kioskToast}
            </div>
          )}
          <KioskCheckinPanel
            classId={id}
            isLeadMode={false}
            onCheckedIn={handleKioskCheckedIn}
            authFetch={authFetch}
            cls={cls}
          />
        </div>

        {showLeadModal && (
          <LeadPasswordModal
            classId={id}
            onSuccess={() => {
              setLeadUnlocked(true)
              setShowLeadModal(false)
            }}
            onClose={() => setShowLeadModal(false)}
            authFetch={authFetch}
          />
        )}
      </div>
    )
  }

  // ── Lead mode ─────────────────────────────────────────────────────────────
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='bg-white border-b border-gray-200 px-4'>
        <div className='max-w-lg mx-auto'>
          <div className='flex items-center gap-3 py-3'>
            <button
              onClick={() => navigate('/attendance')}
              className='flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition flex-shrink-0'
            >
              <ArrowLeft className='w-4 h-4' /> Classes
            </button>
            <div className='flex-1 min-w-0'>
              <h1 className='text-base font-bold text-gray-800 truncate'>{cls.name}</h1>
              {cls.lead_name && (
                <p className='text-xs text-gray-500 truncate'>Leader: {cls.lead_name}</p>
              )}
            </div>
            <div className='inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0'>
              <Key className='w-3 h-3' /> Leader Mode
            </div>
          </div>
          <div className='flex gap-1 overflow-x-auto overflow-y-hidden'>
            {leadTabs.map(({ id: tid, label, Icon }) => (
              <button
                key={tid}
                onClick={() => setLeadTab(tid)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition rounded-t-lg -mb-px border ${
                  leadTab === tid
                    ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                    : 'bg-gray-100 border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
              >
                <Icon className='w-4 h-4' /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`mx-auto px-4 py-6 ${leadTab === 'edit' || leadTab === 'summary' ? 'max-w-3xl' : 'max-w-lg'}`}
      >
        {leadTab === 'roster' && (
          <RosterPanel
            classId={id}
            sessions={sessions}
            stableNames={rosterStableNames}
            onMemberAdded={addToRoster}
            onRefresh={loadData}
            authFetch={authFetch}
          />
        )}
        {leadTab === 'edit' && (
          <EditPanel
            cls={cls}
            classId={id}
            sessions={sessions}
            onClassSaved={(c) => {
              setCls(c)
              loadData()
            }}
            onDeleted={() => navigate('/attendance')}
            onRefresh={loadData}
            authFetch={authFetch}
          />
        )}
        {leadTab === 'summary' && (
          <SummaryPanel
            cls={cls}
            sessions={sessions}
            stableNames={rosterStableNames}
            classId={id}
            authFetch={authFetch}
            onRefresh={loadData}
          />
        )}
        {leadTab === 'docs' && (
          <DocumentsPanel
            classId={id}
            authFetch={authFetch}
            sessions={sessions}
          />
        )}
      </div>
    </div>
  )
}
