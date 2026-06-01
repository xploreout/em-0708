import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { Role } from '../../context/AuthContext'
import {
  Search, CheckCircle2, LogOut, Mail, UserX,
  ChevronRight, ChevronDown, Clock, MapPin, Users,
  Key, Eye, EyeOff, X,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────
type ClassMatch = {
  classId: number; className: string
  leadName: string; leadEmail: string
  location: string; meetingDay: string; meetingTime: string
  personName: string; phone: string
  sessionCount: number; lastSeen: string | null
  checkedInToday: boolean
}
type ClassInfo = {
  id: number; name: string; lead_name: string; location: string
  meeting_day: string; meeting_time: string
}

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Lead Class Modal ───────────────────────────────────────────────────────────
function LeadClassModal({ classes, authFetch, role, onClose }: {
  classes: ClassInfo[]
  authFetch: (u: string, i?: RequestInit) => Promise<Response>
  role: Role | null
  onClose: () => void
}) {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState<number | ''>('')
  const [pw, setPw]         = useState('')
  const [show, setShow]     = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId) return
    if (role === 'admin') {
      navigate(`/attendance/class/${selectedId}`, { state: { leadUnlocked: true } })
      return
    }
    setLoading(true); setError('')
    const r = await authFetch(`/api/classes/${selectedId}/lead-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    })
    const d = await r.json()
    setLoading(false)
    if (!r.ok) { setError(d.error || 'Error'); return }
    if (d.ok) navigate(`/attendance/class/${selectedId}`, { state: { leadUnlocked: true } })
    else setError('Incorrect password')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-gray-800">Leader Access</h3>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Select Your Class</label>
            <select
              value={selectedId}
              onChange={e => { setSelectedId(e.target.value ? Number(e.target.value) : ''); setError('') }}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition"
              autoFocus
            >
              <option value="">— choose a class —</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {role !== 'admin' && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Leader Password</label>
              <div className="relative">
                <input
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
            </div>
          )}
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading || !selectedId || (role !== 'admin' && !pw)}
            className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition disabled:opacity-50"
          >
            {loading ? 'Verifying…' : 'Enter leader mode'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function AttendancePage() {
  const { authFetch, logout, role } = useAuth()
  const navigate = useNavigate()

  const [query, setQuery]           = useState('')
  const [results, setResults]       = useState<ClassMatch[]>([])
  const [searching, setSearching]   = useState(false)
  const [allClasses, setAllClasses] = useState<ClassInfo[]>([])
  const [classFilter, setClassFilter] = useState('')
  const [showBrowse, setShowBrowse] = useState(false)
  const [banner, setBanner]         = useState<{ name: string; className: string } | null>(null)
  const [flash, setFlash]           = useState('')
  const [notifyDone, setNotifyDone] = useState<Set<number>>(new Set())
  const [showLeadModal, setShowLeadModal] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const showFlash = (msg: string) => {
    setFlash(msg)
    setTimeout(() => setFlash(''), 4000)
  }

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80)
    authFetch('/api/classes')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setAllClasses(d) })
  }, [authFetch])

  // Debounced person search
  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      const r = await authFetch(`/api/attendance/search?q=${encodeURIComponent(query)}`)
      const d = await r.json()
      setResults(Array.isArray(d) ? d : [])
      setSearching(false)
    }, 300)
    return () => clearTimeout(t)
  }, [query, authFetch])

  async function doCheckin(classId: number, personName: string, phone = '', className = '') {
    const r = await authFetch(`/api/classes/${classId}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person_name: personName, phone }),
    })
    const d = await r.json()
    if (!r.ok) {
      showFlash(d.error === 'Already checked in today'
        ? `${personName} is already checked in for that class today.`
        : (d.error || 'Check-in failed'))
      return
    }
    setResults(prev => prev.map(m =>
      m.classId === classId ? { ...m, checkedInToday: true } : m
    ))
    setBanner({ name: personName, className })
    setTimeout(() => setBanner(null), 2000)
  }

  async function notifyLead(classId: number, personName: string) {
    const r = await authFetch(`/api/classes/${classId}/notify-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person_name: personName }),
    })
    if (r.ok) {
      setNotifyDone(prev => new Set([...prev, classId]))
      showFlash('Class leader notified!')
    } else {
      const d = await r.json()
      showFlash(d.error || 'Could not send notification')
    }
  }

  const noResults = query.trim().length >= 2 && !searching && results.length === 0
  const filteredClasses = allClasses.filter(c =>
    c.name.toLowerCase().includes(classFilter.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Check-in banner */}
      {banner && (
        <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="bg-green-500 text-white rounded-2xl px-6 py-3.5 flex items-center gap-3 shadow-xl">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="font-bold">{banner.name}</span>
            {banner.className && (
              <span className="opacity-90 text-sm">checked in{' '}
                <span className="font-semibold opacity-100">— {banner.className}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-800">Attendance Check-in</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLeadModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-bold transition"
            >
              <Key className="w-3.5 h-3.5" /> Lead
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Flash message */}
        {flash && (
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-2.5 rounded-xl mb-4">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {flash}
          </div>
        )}

        {/* Search */}
        <p className="text-sm text-gray-500 mb-3 text-center">Enter your name or phone number to check in.</p>
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Name or phone number…"
            autoComplete="off"
            className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-base outline-none focus:border-blue-400 transition bg-white shadow-sm"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
        {searching && <p className="text-xs text-gray-400 mb-3 px-1">Searching…</p>}

        {/* Results — found in classes */}
        {results.length > 0 && (
          <div className="flex flex-col gap-2 mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold px-1 mb-1">
              Found in {results.length === 1 ? 'a class' : `${results.length} classes`}
            </p>
            {results.map(m => (
              <div
                key={m.classId}
                className={`bg-white rounded-2xl px-4 py-4 shadow-sm border-2 ${m.checkedInToday ? 'border-green-200' : 'border-gray-100'}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 text-base">{m.className}</div>
                    {m.leadName && <div className="text-xs text-gray-500 mt-0.5">Leader: {m.leadName}</div>}
                    <div className="flex flex-wrap gap-3 mt-1.5">
                      {m.meetingDay && m.meetingTime && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />{m.meetingDay}s · {m.meetingTime}
                        </span>
                      )}
                      {m.location && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="w-3 h-3" />{m.location}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {m.sessionCount} session{m.sessionCount !== 1 ? 's' : ''}
                      {m.lastSeen ? ` · last ${fmtDate(m.lastSeen)}` : ''}
                    </div>
                  </div>
                  {m.checkedInToday && (
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Today
                    </div>
                  )}
                </div>

                {m.checkedInToday ? (
                  <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Checked in to {m.className}
                  </div>
                ) : (
                  <button
                    onClick={() => doCheckin(m.classId, m.personName, m.phone, m.className)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Check in as {m.personName}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Not found state */}
        {noResults && (
          <div className="mb-4">
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-3">
              <UserX className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <p className="text-sm text-orange-700">
                <strong>"{query}"</strong> is not registered in any class.
              </p>
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold px-1 mb-2">
              Select a class to check in or notify the leader:
            </p>
            <div className="flex flex-col gap-2">
              {allClasses.map(c => (
                <div key={c.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
                  <div className="font-semibold text-gray-800 text-sm mb-1">{c.name}</div>
                  {c.lead_name && <div className="text-xs text-gray-400 mb-2">Leader: {c.lead_name}</div>}
                  {(c.meeting_day || c.location) && (
                    <div className="flex gap-3 mb-2">
                      {c.meeting_day && c.meeting_time && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{c.meeting_day}s · {c.meeting_time}
                        </span>
                      )}
                      {c.location && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{c.location}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => doCheckin(c.id, query.trim(), '', c.name)}
                      className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition"
                    >
                      Check in as visitor
                    </button>
                    {notifyDone.has(c.id) ? (
                      <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 text-gray-500 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Notified
                      </div>
                    ) : (
                      <button
                        onClick={() => notifyLead(c.id, query.trim())}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold transition"
                      >
                        <Mail className="w-3.5 h-3.5" /> Notify leader
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lead modal */}
        {showLeadModal && (
          <LeadClassModal
            classes={allClasses}
            authFetch={authFetch}
            role={role}
            onClose={() => setShowLeadModal(false)}
          />
        )}

        {/* Browse all classes (for direct navigation / leaders) */}
        {!noResults && (
          <div className="mt-6 border-t border-gray-200 pt-5">
            <button
              onClick={() => setShowBrowse(s => !s)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition font-medium w-full"
            >
              {showBrowse ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              Browse all classes
            </button>

            {showBrowse && (
              <div className="mt-3">
                {allClasses.length > 4 && (
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      value={classFilter}
                      onChange={e => setClassFilter(e.target.value)}
                      placeholder="Filter classes…"
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-400 transition bg-white"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  {filteredClasses.map(c => (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/attendance/class/${c.id}`)}
                      className="flex items-center justify-between bg-white border border-gray-100 hover:border-blue-200 rounded-xl px-4 py-3 text-left transition group"
                    >
                      <div>
                        <div className="font-semibold text-gray-800 text-sm group-hover:text-blue-700">
                          {c.name}
                        </div>
                        {c.lead_name && (
                          <div className="text-xs text-gray-400">Leader: {c.lead_name}</div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
