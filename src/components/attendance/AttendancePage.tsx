import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { Role } from '../../context/AuthContext'
import {
  Search, CheckCircle2, LogOut, Mail, UserX,
  ChevronRight, ChevronDown, Clock, MapPin, Users,
  Key, Eye, EyeOff, X, Plus, Edit2, Trash2, Archive,
  ArchiveRestore, Save, Calendar, ClipboardList,
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
  id: number; name: string; lead_name: string; lead_email: string
  description: string; location: string
  meeting_day: string; meeting_time: string
  recurrence: string; end_date: string | null; archived?: boolean
}

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Class Form Modal (admin create / edit) ─────────────────────────────────────
function ClassFormModal({ cls, authFetch, onSaved, onClose }: {
  cls: ClassInfo | null
  authFetch: (u: string, i?: RequestInit) => Promise<Response>
  onSaved: (c: ClassInfo) => void
  onClose: () => void
}) {
  const isNew = cls === null
  const [form, setForm] = useState({
    name: cls?.name || '', lead_name: cls?.lead_name || '', lead_email: cls?.lead_email || '',
    description: cls?.description || '', location: cls?.location || '',
    meeting_day: cls?.meeting_day || '', meeting_time: cls?.meeting_time || '',
    recurrence: cls?.recurrence || 'none', end_date: cls?.end_date || '', lead_password: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    const body: Record<string, unknown> = {
      name: form.name.trim(), lead_name: form.lead_name.trim(), lead_email: form.lead_email.trim(),
      description: form.description.trim(), location: form.location.trim(),
      meeting_day: form.meeting_day, meeting_time: form.meeting_time,
      recurrence: form.recurrence,
      end_date: form.recurrence !== 'none' ? form.end_date || null : null,
    }
    if (form.lead_password) body.lead_password = form.lead_password
    const r = await authFetch(isNew ? '/api/classes' : `/api/classes/${cls!.id}`,
      { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const d = await r.json(); setSaving(false)
    if (!r.ok) { setError(d.error || 'Error saving'); return }
    onSaved(d)
  }

  const inp = 'w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition bg-white'
  const lbl = 'text-xs font-bold text-gray-600 uppercase tracking-widest mb-1.5 block'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 py-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-6 sm:p-8 relative my-4" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        <h3 className="font-bold text-indigo-700 text-lg mb-5">{isNew ? 'New Class' : 'Edit Class'}</h3>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div><label className={lbl}>Class Name *</label><input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className={inp} required autoFocus /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={lbl}>Leader Name</label><input value={form.lead_name} onChange={e => setForm(f => ({...f, lead_name: e.target.value}))} placeholder="e.g. Pastor John" className={inp} /></div>
            <div><label className={lbl}>Leader Email</label><input value={form.lead_email} onChange={e => setForm(f => ({...f, lead_email: e.target.value}))} type="email" className={inp} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={lbl}>Description</label><textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={2} className={`${inp} resize-none`} /></div>
            <div><label className={lbl}>Location</label><input value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} placeholder="e.g. Room 201" className={inp} /></div>
          </div>
          <div className="border-t border-indigo-100 pt-4">
            <div className="flex items-center gap-2 mb-3"><Calendar className="w-3.5 h-3.5 text-indigo-500" /><span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Schedule</span></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className={lbl}>Day</label><select value={form.meeting_day} onChange={e => setForm(f => ({...f, meeting_day: e.target.value}))} className={inp}><option value="">— no day —</option>{DAYS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
              <div><label className={lbl}>Time</label><input type="time" value={form.meeting_time} onChange={e => setForm(f => ({...f, meeting_time: e.target.value}))} className={inp} /></div>
              <div><label className={lbl}>Recurring</label><div className="flex gap-1.5 h-[42px]">{(['none','weekly','monthly'] as const).map(r => (<button key={r} type="button" onClick={() => setForm(f => ({...f, recurrence: r}))} className={`flex-1 rounded-lg text-xs font-semibold border-2 transition capitalize ${form.recurrence === r ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>{r === 'none' ? 'None' : r}</button>))}</div></div>
            </div>
            <div className={`mt-4 grid gap-4 ${form.recurrence !== 'none' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 max-w-xs'}`}>
              <div><label className={lbl}>Begin Date</label><input type="date" value={form.end_date} onChange={e => setForm(f => ({...f, end_date: e.target.value}))} className={inp} /></div>
              {form.recurrence !== 'none' && (<div><label className={lbl}>End Date</label><input type="date" value={form.end_date} onChange={e => setForm(f => ({...f, end_date: e.target.value}))} className={inp} /></div>)}
            </div>
          </div>
          <div className="border-t border-indigo-100 pt-4"><label className={lbl}>Lead Password (leave blank to keep)</label><input type="password" value={form.lead_password} onChange={e => setForm(f => ({...f, lead_password: e.target.value}))} placeholder="Set or change leader password…" className={inp} autoComplete="new-password" /></div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={saving || !form.name.trim()} className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition disabled:opacity-50">
            <Save className="w-4 h-4" />{saving ? 'Saving…' : isNew ? 'Create Class' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Confirm Delete Modal ───────────────────────────────────────────────────────
function ConfirmDeleteModal({ name, onConfirm, onClose }: { name: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        <div className="flex items-center gap-2 mb-3"><Trash2 className="w-5 h-5 text-red-500" /><h3 className="font-bold text-gray-800">Delete Class</h3></div>
        <p className="text-sm text-gray-600 mb-5">Delete <strong>"{name}"</strong>? This will permanently remove all sessions and attendance records.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition">Delete</button>
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function AttendancePage() {
  const { authFetch, logout, role } = useAuth()
  const navigate = useNavigate()
  const isAdmin = role === 'admin'

  // Check-in state
  const [query, setQuery]           = useState('')
  const [results, setResults]       = useState<ClassMatch[]>([])
  const [searching, setSearching]   = useState(false)
  const [allClasses, setAllClasses] = useState<ClassInfo[]>([])
  const [classFilter, setClassFilter] = useState('')
  const [showBrowse, setShowBrowse] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [flash, setFlash]           = useState('')
  const [notifyDone, setNotifyDone] = useState<Set<number>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  // Lead section state
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('')
  const [leadPw, setLeadPw]         = useState('')
  const [showPw, setShowPw]         = useState(false)
  const [leadError, setLeadError]   = useState('')
  const [leadLoading, setLeadLoading] = useState(false)

  // Admin modal state
  const [showClassForm, setShowClassForm]   = useState(false)
  const [editingClass, setEditingClass]     = useState<ClassInfo | null>(null)
  const [deletingClass, setDeletingClass]   = useState<ClassInfo | null>(null)

  const showFlash = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(''), 4000) }

  async function loadClasses() {
    const r = await authFetch('/api/classes')
    const d = await r.json()
    if (Array.isArray(d)) setAllClasses(d)
  }

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80)
    loadClasses()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person_name: personName, phone }),
    })
    const d = await r.json()
    if (!r.ok) { showFlash(d.error === 'Already checked in today' ? `${personName} is already checked in.` : (d.error || 'Check-in failed')); return }
    setResults(prev => prev.map(m => m.classId === classId ? { ...m, checkedInToday: true } : m))
    showFlash(`${personName} checked in — ${className}`)
  }

  async function notifyLead(classId: number, personName: string) {
    const r = await authFetch(`/api/classes/${classId}/notify-lead`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person_name: personName }),
    })
    if (r.ok) { setNotifyDone(prev => new Set([...prev, classId])); showFlash('Class leader notified!') }
    else { const d = await r.json(); showFlash(d.error || 'Could not send notification') }
  }

  // Lead section: access class
  async function handleLeadAccess(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedClassId) return
    if (isAdmin) {
      navigate(`/attendance/class/${selectedClassId}`, { state: { leadUnlocked: true, defaultTab: 'edit' } })
      return
    }
    setLeadLoading(true); setLeadError('')
    const r = await authFetch(`/api/classes/${selectedClassId}/lead-verify`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: leadPw }),
    })
    const d = await r.json(); setLeadLoading(false)
    if (!r.ok) { setLeadError(d.error || 'Error'); return }
    if (d.ok) navigate(`/attendance/class/${selectedClassId}`, { state: { leadUnlocked: true, defaultTab: 'edit' } })
    else setLeadError('Incorrect password')
  }

  // Admin class actions
  async function handleArchiveClass(cls: ClassInfo) {
    const r = await authFetch(`/api/classes/${cls.id}/archive`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived: !cls.archived }),
    })
    if (r.ok) {
      const updated: ClassInfo = await r.json()
      setAllClasses(prev => prev.map(c => c.id === updated.id ? updated : c))
      showFlash(`"${cls.name}" ${updated.archived ? 'archived' : 'restored'}.`)
    } else showFlash('Action failed')
  }

  async function handleDeleteClass() {
    if (!deletingClass) return
    const r = await authFetch(`/api/classes/${deletingClass.id}`, { method: 'DELETE' })
    if (r.ok) { setAllClasses(prev => prev.filter(c => c.id !== deletingClass.id)); showFlash(`"${deletingClass.name}" deleted.`) }
    else showFlash('Delete failed')
    setDeletingClass(null)
  }

  function handleClassSaved(c: ClassInfo) {
    setAllClasses(prev => {
      const idx = prev.findIndex(x => x.id === c.id)
      if (idx >= 0) return prev.map(x => x.id === c.id ? c : x)
      return [...prev, c].sort((a, b) => a.name.localeCompare(b.name))
    })
    showFlash(editingClass ? `"${c.name}" updated.` : `"${c.name}" created.`)
    setShowClassForm(false); setEditingClass(null)
  }

  const activeClasses   = allClasses.filter(c => !c.archived)
  const archivedClasses = allClasses.filter(c => c.archived)
  const noResults = query.trim().length >= 2 && !searching && results.length === 0
  const filteredClasses = activeClasses.filter(c => c.name.toLowerCase().includes(classFilter.toLowerCase()))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h1 className="text-base font-bold text-gray-900">Class</h1>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button onClick={() => { setEditingClass(null); setShowClassForm(true) }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition">
                <Plus className="w-3.5 h-3.5" /><span className="hidden sm:inline">New Class</span>
              </button>
            )}
            <button onClick={logout}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition px-2 py-1.5">
              <LogOut className="w-3.5 h-3.5" /><span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {flash && (
          <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-2.5 rounded-lg mb-4">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {flash}
          </div>
        )}

        {/* Two-section layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* ── Section 1: Attendance Check-in ──────────────────────────── */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-indigo-600 px-5 py-3.5 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-white" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Class Check-in</h2>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-500 mb-3">Enter name or phone number to check in.</p>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Name or phone…" autoComplete="off"
                  className="w-full pl-10 pr-8 py-3 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-400 transition bg-white" />
                {query && (
                  <button onClick={() => { setQuery(''); setResults([]) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                )}
              </div>
              {searching && <p className="text-xs text-gray-400 mb-2">Searching…</p>}

              {/* Results */}
              {results.length > 0 && (
                <div className="flex flex-col gap-2 mb-3">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    Found in {results.length} class{results.length !== 1 ? 'es' : ''}
                  </p>
                  {results.map(m => (
                    <div key={m.classId} className={`rounded-lg px-4 py-3 border-2 ${m.checkedInToday ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-white'}`}>
                      <div className="font-bold text-gray-900 text-sm">{m.className}</div>
                      {m.leadName && <div className="text-xs text-gray-500">Leader: {m.leadName}</div>}
                      <div className="flex flex-wrap gap-3 mt-1 mb-2.5">
                        {m.meetingDay && m.meetingTime && <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{m.meetingDay}s · {m.meetingTime}</span>}
                        {m.location && <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{m.location}</span>}
                        <span className="text-xs text-gray-400">{m.sessionCount} session{m.sessionCount !== 1 ? 's' : ''}{m.lastSeen ? ` · last ${fmtDate(m.lastSeen)}` : ''}</span>
                      </div>
                      {m.checkedInToday ? (
                        <div className="flex items-center gap-2 text-green-700 text-sm font-semibold"><CheckCircle2 className="w-4 h-4" /> Checked in today</div>
                      ) : (
                        <button onClick={() => doCheckin(m.classId, m.personName, m.phone, m.className)}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition">
                          <CheckCircle2 className="w-4 h-4" /> Check in as {m.personName}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Not found */}
              {noResults && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2.5 mb-3">
                    <UserX className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <p className="text-sm text-orange-700"><strong>"{query}"</strong> not found in any class.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {activeClasses.map(c => (
                      <div key={c.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                        <div className="font-semibold text-gray-900 text-sm mb-1">{c.name}</div>
                        {c.lead_name && <div className="text-xs text-gray-400 mb-2">Leader: {c.lead_name}</div>}
                        <div className="flex gap-2">
                          <button onClick={() => doCheckin(c.id, query.trim(), '', c.name)}
                            className="flex-1 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition">
                            Check in as visitor
                          </button>
                          {notifyDone.has(c.id) ? (
                            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-xs font-semibold">
                              <CheckCircle2 className="w-3 h-3 text-green-500" /> Notified
                            </div>
                          ) : (
                            <button onClick={() => notifyLead(c.id, query.trim())}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold transition">
                              <Mail className="w-3 h-3" /> Notify
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Browse all classes */}
              {!noResults && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <button onClick={() => setShowBrowse(s => !s)}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium w-full">
                    {showBrowse ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    Browse classes <span className="text-xs text-gray-400">({activeClasses.length})</span>
                  </button>
                  {showBrowse && (
                    <div className="mt-3">
                      {activeClasses.length > 4 && (
                        <div className="relative mb-2">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input value={classFilter} onChange={e => setClassFilter(e.target.value)} placeholder="Filter…"
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-indigo-300 bg-white" />
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        {filteredClasses.map(c => (
                          <div key={c.id} className="flex items-center bg-white border border-gray-100 hover:border-indigo-200 rounded-lg transition group">
                            <button onClick={() => navigate(`/attendance/class/${c.id}`)}
                              className="flex-1 flex items-center justify-between px-3 py-2.5 text-left min-w-0">
                              <div className="min-w-0">
                                <div className="font-semibold text-gray-800 text-sm group-hover:text-indigo-700 truncate">{c.name}</div>
                                {c.lead_name && <div className="text-xs text-gray-400 truncate">Leader: {c.lead_name}</div>}
                              </div>
                              {!isAdmin && <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 flex-shrink-0 ml-2" />}
                            </button>
                            {isAdmin && (
                              <div className="flex items-center gap-0.5 px-2 flex-shrink-0">
                                <button onClick={() => { setEditingClass(c); setShowClassForm(true) }} title="Edit" className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"><Edit2 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleArchiveClass(c)} title="Archive" className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition"><Archive className="w-3.5 h-3.5" /></button>
                                <button onClick={() => setDeletingClass(c)} title="Delete" className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {isAdmin && archivedClasses.length > 0 && (
                        <div className="mt-3 border-t border-gray-100 pt-3">
                          <button onClick={() => setShowArchived(s => !s)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 font-medium mb-2">
                            <Archive className="w-3.5 h-3.5" /> {archivedClasses.length} archived {showArchived ? '▲' : '▼'}
                          </button>
                          {showArchived && (
                            <div className="flex flex-col gap-1">
                              {archivedClasses.map(c => (
                                <div key={c.id} className="flex items-center bg-gray-50 border border-dashed border-gray-200 rounded-lg">
                                  <div className="flex-1 px-3 py-2 min-w-0">
                                    <div className="font-semibold text-gray-400 text-sm truncate">{c.name}</div>
                                  </div>
                                  <div className="flex gap-0.5 px-2">
                                    <button onClick={() => handleArchiveClass(c)} title="Restore" className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition"><ArchiveRestore className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => setDeletingClass(c)} title="Delete" className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Section 2: Class Lead / Coworker ────────────────────────── */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-amber-500 px-5 py-3.5 flex items-center gap-2">
              <Key className="w-4 h-4 text-white" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Class Update</h2>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-500 mb-4">
                Select your class{isAdmin ? '.' : ' and enter the leader password to view and update class details.'}
              </p>

              <form onSubmit={handleLeadAccess} className="flex flex-col gap-3">
                {/* Class selector */}
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-1.5 block">Select Class</label>
                  <select value={selectedClassId}
                    onChange={e => { setSelectedClassId(e.target.value ? Number(e.target.value) : ''); setLeadError('') }}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-amber-400 transition bg-white">
                    <option value="">— choose a class —</option>
                    {activeClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Password — hidden for admin */}
                {!isAdmin && (
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-1.5 block">Leader Password</label>
                    <div className="relative">
                      <input type={showPw ? 'text' : 'password'} value={leadPw}
                        onChange={e => { setLeadPw(e.target.value); setLeadError('') }}
                        placeholder="Enter leader password"
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm outline-none focus:border-amber-400 transition" />
                      <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {leadError && <p className="text-red-500 text-xs font-medium">{leadError}</p>}

                <button type="submit"
                  disabled={leadLoading || !selectedClassId || (!isAdmin && !leadPw)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition disabled:opacity-50">
                  {leadLoading ? 'Verifying…' : <><Key className="w-4 h-4" /> Access Class Details</>}
                </button>
              </form>

              {/* Quick-access class list */}
              {activeClasses.length > 0 && (
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">All Classes</p>
                  <div className="flex flex-col gap-1">
                    {activeClasses.map(c => (
                      <div key={c.id} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-800 text-sm truncate">{c.name}</div>
                          <div className="flex gap-3 flex-wrap">
                            {c.lead_name && <span className="text-xs text-gray-400">Leader: {c.lead_name}</span>}
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
                        </div>
                        <button
                          onClick={() => {
                            setSelectedClassId(c.id)
                            const el = document.querySelector('select')
                            el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          }}
                          className="ml-3 text-xs text-amber-600 hover:text-amber-800 font-semibold flex-shrink-0"
                        >
                          Select
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Admin modals */}
      {showClassForm && (
        <ClassFormModal cls={editingClass} authFetch={authFetch} onSaved={handleClassSaved}
          onClose={() => { setShowClassForm(false); setEditingClass(null) }} />
      )}
      {deletingClass && (
        <ConfirmDeleteModal name={deletingClass.name} onConfirm={handleDeleteClass}
          onClose={() => setDeletingClass(null)} />
      )}
    </div>
  )
}
