import { useState, useEffect, useRef } from 'react'
import { Loader2, Plus, Pencil, Trash2, X, Check, Search, Mail, Phone, Upload, Send, Users, Download } from 'lucide-react'
import { RequireAuth, useAuth } from '../../context/AuthContext'

type Member = {
  id: string
  name: string
  phone: string
  email: string
  photoUrl: string
  notes: string
  isStudent: boolean
  schoolLevel: string
  schoolYear: string
  fellowshipGroups: string[]
}

const SCHOOL_LEVELS = [
  ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`),
  ...Array.from({ length: 6 },  (_, i) => `College ${i + 1}`),
  'Other',
]

function currentSchoolYear() {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  return m >= 8 ? `${y}-${y + 1}` : `${y - 1}-${y}`
}

function schoolYearOptions() {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  const base = m >= 8 ? y : y - 1
  return Array.from({ length: 6 }, (_, i) => {
    const start = base - 2 + i
    return `${start}-${start + 1}`
  })
}

type ReminderResult = {
  sent:    { name: string; email: string }[]
  skipped: { name: string; reason: string }[]
  errors:  { name: string; email: string; error: string }[]
  message?: string
}

function get12Months() {
  const now = new Date()
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    return { year: d.getFullYear(), month: d.getMonth(),
      label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }
  })
}

// ── Fellowship Group Tag Input ────────────────────────────────────────────────

function GroupTagInput({ groups, onChange, allGroups }: {
  groups: string[]
  onChange: (g: string[]) => void
  allGroups: string[]
}) {
  const [input, setInput] = useState('')
  const [open,  setOpen]  = useState(false)

  const suggestions = allGroups.filter(
    g => g.toLowerCase().includes(input.toLowerCase()) && !groups.includes(g)
  )

  function add(g: string) {
    const t = g.trim()
    if (t && !groups.includes(t)) onChange([...groups, t])
    setInput('')
    setOpen(false)
  }

  function remove(g: string) {
    onChange(groups.filter(x => x !== g))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); if (input.trim()) add(input) }
    if (e.key === 'Backspace' && !input && groups.length > 0) remove(groups[groups.length - 1])
  }

  return (
    <div className="relative">
      {groups.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {groups.map(g => (
            <span key={g} className="flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1">
              {g}
              <button type="button" onClick={() => remove(g)} className="hover:text-indigo-900 transition ml-0.5 p-0.5 -mr-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={input}
        onChange={e => { setInput(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder="Type group name, press Enter to add…"
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {suggestions.map(g => (
            <button
              key={g}
              type="button"
              onMouseDown={() => add(g)}
              className="w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-indigo-50 active:bg-indigo-100 transition"
            >
              {g}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Member Form Modal ─────────────────────────────────────────────────────────

function MemberModal({ member, onSave, onClose, allGroups }: {
  member?: Member
  onSave: (data: Omit<Member, 'id'>) => Promise<void>
  onClose: () => void
  allGroups: string[]
}) {
  const { authFetch } = useAuth()
  const [name,        setName]        = useState(member?.name        ?? '')
  const [phone,       setPhone]       = useState(member?.phone       ?? '')
  const [email,       setEmail]       = useState(member?.email       ?? '')
  const [photoUrl,    setPhotoUrl]    = useState(member?.photoUrl    ?? '')
  const [notes,       setNotes]       = useState(member?.notes       ?? '')
  const [isStudent,       setIsStudent]       = useState(member?.isStudent       ?? false)
  const [schoolLevel,     setSchoolLevel]     = useState(member?.schoolLevel     ?? '')
  const [schoolYear,      setSchoolYear]      = useState(member?.schoolYear      || currentSchoolYear())
  const [fellowshipGroups, setFellowshipGroups] = useState<string[]>(member?.fellowshipGroups ?? [])
  const [uploading, setUploading] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('photo', file)
      const res  = await authFetch('/api/congregation/upload-photo', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPhotoUrl(data.url)
    } catch (err: any) {
      setError(err.message ?? 'Photo upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError(null)
    try {
      await onSave({ name, phone, email, photoUrl, notes, isStudent, schoolLevel: isStudent ? schoolLevel : '', schoolYear: isStudent ? schoolYear : '', fellowshipGroups })
      onClose()
    } catch (err: any) {
      setError(err.message ?? 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 px-4 py-6 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative my-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-gray-800 mb-5">{member ? 'Edit Member' : 'Add Member'}</h2>

        {/* Photo */}
        <div className="flex flex-col items-center gap-2 mb-5">
          <div
            className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center cursor-pointer hover:border-blue-400 transition relative"
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : photoUrl ? (
              <img src={photoUrl} alt="Photo" className="w-full h-full object-cover" />
            ) : (
              <Upload className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-xs text-blue-500 hover:text-blue-700 font-medium transition"
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : 'Upload photo'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full name"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Phone</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes about this member…"
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition resize-none" />
          </div>

          {/* Student checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="is-student"
              type="checkbox"
              checked={isStudent}
              onChange={e => setIsStudent(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer"
            />
            <label htmlFor="is-student" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
              Student
            </label>
          </div>

          {/* Fellowship Groups */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Fellowship Group(s)</label>
            <GroupTagInput groups={fellowshipGroups} onChange={setFellowshipGroups} allGroups={allGroups} />
          </div>

          {/* School level + year — only shown when Student is checked */}
          {isStudent && (
            <div className="flex flex-col gap-3 pl-3 border-l-2 border-blue-100">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">School Level</label>
                <select
                  value={schoolLevel}
                  onChange={e => setSchoolLevel(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white transition"
                >
                  <option value="">— Select level —</option>
                  {SCHOOL_LEVELS.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">School Year</label>
                <select
                  value={schoolYear}
                  onChange={e => setSchoolYear(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white transition"
                >
                  {schoolYearOptions().map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-xs mt-3 font-medium">{error}</p>}

        <div className="flex gap-2 mt-5">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Check className="w-4 h-4" /> Save</>}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Member Card ───────────────────────────────────────────────────────────────

function MemberCard({ member, onEdit, onDelete }: {
  member: Member
  onEdit: () => void
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const initials = member.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const groups    = member.fellowshipGroups ?? []
  const hasMore   = !!member.notes || (member.isStudent && !!member.schoolYear) || groups.length > 2
  const previewGroups = expanded ? groups : groups.slice(0, 2)

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex gap-3">
      {/* Photo / initials */}
      <div className="shrink-0">
        {member.photoUrl ? (
          <img src={member.photoUrl} alt={member.name}
            className="w-14 h-14 rounded-full object-cover border border-gray-100" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
            {initials}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 text-sm truncate">{member.name}</div>
        {member.phone && (
          <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500 truncate">
            <Phone className="w-3 h-3 shrink-0" /> {member.phone}
          </div>
        )}
        {member.email && (
          <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500 truncate">
            <Mail className="w-3 h-3 shrink-0" /> {member.email}
          </div>
        )}
        {!member.phone && !member.email && (
          <div className="text-xs text-gray-300 mt-0.5 italic">No contact info</div>
        )}

        {/* Always-visible badges: fellowship groups (first 2) + student level */}
        {(previewGroups.length > 0 || member.isStudent) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {previewGroups.map(g => (
              <span key={g} className="rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5">{g}</span>
            ))}
            {!expanded && groups.length > 2 && (
              <span className="text-[10px] text-gray-400">+{groups.length - 2} more</span>
            )}
            {member.isStudent && (
              <span className="rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold px-2 py-0.5">
                {member.schoolLevel || 'Student'}
              </span>
            )}
          </div>
        )}

        {/* Expanded section */}
        {expanded && (
          <div className="mt-2 flex flex-col gap-1.5">
            {member.isStudent && member.schoolYear && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span className="font-medium text-gray-400">School year:</span> {member.schoolYear}
              </div>
            )}
            {member.notes && (
              <div className="text-xs text-gray-400 italic">{member.notes}</div>
            )}
          </div>
        )}

        {/* More / less toggle */}
        {hasMore && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="mt-1.5 inline-flex items-center gap-0.5 text-xs font-semibold text-blue-400 hover:text-blue-600 active:text-blue-700 transition py-1 -my-1"
          >
            {expanded ? 'less ▲' : 'more ▼'}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 shrink-0">
        <button onClick={onEdit} className="p-1.5 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition" title="Edit">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition" title="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Send Reminders Panel ──────────────────────────────────────────────────────

function RemindersPanel() {
  const { authFetch } = useAuth()
  const months = get12Months()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [status,  setStatus]  = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [result,  setResult]  = useState<ReminderResult | null>(null)
  const [errMsg,  setErrMsg]  = useState('')

  async function sendReminders() {
    const { year, month } = months[selectedIdx]
    setStatus('sending')
    setResult(null)
    setErrMsg('')
    try {
      const res  = await authFetch('/api/reminders/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month }),
      })
      const text = await res.text()
      let data: ReminderResult & { error?: string }
      try { data = JSON.parse(text) } catch {
        throw new Error(`Server error (${res.status}) — ${text.slice(0, 120) || 'empty response'}`)
      }
      if (!res.ok) throw new Error(data.error ?? `Server error ${res.status}`)
      setResult(data)
      setStatus('done')
    } catch (err: any) {
      setErrMsg(err.message ?? 'Failed to send reminders')
      setStatus('error')
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Send className="w-4 h-4 text-blue-500" />
        <h2 className="text-sm font-bold text-gray-800">Send Monthly Reminders</h2>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Sends an email to every co-worker who has duties in the selected month, if they are in the congregation database.
      </p>

      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={selectedIdx}
          onChange={e => { setSelectedIdx(Number(e.target.value)); setResult(null) }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white"
        >
          {months.map((m, i) => <option key={i} value={i}>{m.label}</option>)}
        </select>

        <button
          onClick={sendReminders}
          disabled={status === 'sending'}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-50"
        >
          {status === 'sending'
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
            : <><Send className="w-4 h-4" /> Send Reminders</>}
        </button>
      </div>

      {status === 'error' && (
        <p className="mt-3 text-red-500 text-xs font-medium">{errMsg}</p>
      )}

      {result && (
        <div className="mt-4 flex flex-col gap-2 text-xs">
          {result.message && <p className="text-gray-500 italic">{result.message}</p>}

          {result.sent.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <span className="font-bold text-green-700">✓ Sent ({result.sent.length}):</span>{' '}
              <span className="text-green-700">{result.sent.map(s => s.name).join(', ')}</span>
            </div>
          )}
          {result.skipped.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <span className="font-bold text-amber-700">⚠ Skipped ({result.skipped.length}):</span>{' '}
              <span className="text-amber-700">{result.skipped.map(s => `${s.name} (${s.reason})`).join(', ')}</span>
            </div>
          )}
          {result.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <span className="font-bold text-red-700">✗ Errors ({result.errors.length}):</span>{' '}
              <span className="text-red-700">{result.errors.map(e => `${e.name}: ${e.error}`).join(', ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

function CongregationContent() {
  const { authFetch } = useAuth()
  const [members,          setMembers]          = useState<Member[]>([])
  const [loading,          setLoading]          = useState(true)
  const [search,           setSearch]           = useState('')
  const [modal,            setModal]            = useState<'add' | Member | null>(null)
  const [deleting,         setDeleting]         = useState<string | null>(null)
  const [filterGroup,      setFilterGroup]      = useState('')
  const [filterStudent,    setFilterStudent]    = useState<'all' | 'students' | 'non-students'>('all')
  const [filterSchoolLevel, setFilterSchoolLevel] = useState('')

  useEffect(() => {
    authFetch('/api/congregation')
      .then(r => r.json())
      .then(data => { setMembers(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave(data: Omit<Member, 'id'>) {
    if (typeof modal === 'object' && modal !== null) {
      const res = await authFetch(`/api/congregation/${modal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const updated = await res.json()
      if (!res.ok) throw new Error(updated.error)
      setMembers(prev => prev.map(m => m.id === modal.id ? updated : m))
    } else {
      const res = await authFetch('/api/congregation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const created = await res.json()
      if (!res.ok) throw new Error(created.error)
      setMembers(prev => [...prev, created])
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this member from the database?')) return
    setDeleting(id)
    try {
      await authFetch(`/api/congregation/${id}`, { method: 'DELETE' })
      setMembers(prev => prev.filter(m => m.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  // ── Derived data (computed before any handler that needs them) ────────────────

  const allGroups = [...new Set(members.flatMap(m => m.fellowshipGroups ?? []))].sort()

  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    if (q && !(
      m.name.toLowerCase().includes(q)
      || m.email.toLowerCase().includes(q)
      || m.phone.includes(q)
      || (m.notes ?? '').toLowerCase().includes(q)
      || (m.schoolLevel ?? '').toLowerCase().includes(q)
      || (m.fellowshipGroups ?? []).some(g => g.toLowerCase().includes(q))
    )) return false
    if (filterGroup && !(m.fellowshipGroups ?? []).includes(filterGroup)) return false
    if (filterStudent === 'students'     && !m.isStudent) return false
    if (filterStudent === 'non-students' &&  m.isStudent) return false
    if (filterSchoolLevel && m.schoolLevel !== filterSchoolLevel) return false
    return true
  })

  const hasFilters = !!search || !!filterGroup || filterStudent !== 'all' || !!filterSchoolLevel
  const studentLevelsInView = [...new Set(
    members.filter(m => m.isStudent && m.schoolLevel).map(m => m.schoolLevel)
  )].sort()

  function handleExportCsv() {
    const esc = (v: string) => { const s = String(v ?? ''); return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
    const header = ['Name','Phone','Email','Fellowship Groups','Student','School Level','School Year','Notes']
    const lines = [
      header.join(','),
      ...filtered.map(m => [
        esc(m.name), esc(m.phone), esc(m.email),
        esc((m.fellowshipGroups ?? []).join('; ')),
        m.isStudent ? 'Yes' : 'No',
        esc(m.schoolLevel), esc(m.schoolYear), esc(m.notes),
      ].join(',')),
    ].join('\r\n')
    const blob = new Blob([lines], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading…
      </div>
    )
  }

  return (
    <>
      {/* Search + Add */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 bg-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition shrink-0"
        >
          <Download className="w-4 h-4" />
          Export CSV{hasFilters ? ` (${filtered.length})` : ''}
        </button>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={filterGroup}
          onChange={e => setFilterGroup(e.target.value)}
          className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white outline-none focus:border-blue-400 transition text-gray-600"
        >
          <option value="">All Groups</option>
          {allGroups.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <select
          value={filterStudent}
          onChange={e => { setFilterStudent(e.target.value as typeof filterStudent); setFilterSchoolLevel('') }}
          className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white outline-none focus:border-blue-400 transition text-gray-600"
        >
          <option value="all">All Members</option>
          <option value="students">Students Only</option>
          <option value="non-students">Non-Students</option>
        </select>

        {filterStudent === 'students' && studentLevelsInView.length > 0 && (
          <select
            value={filterSchoolLevel}
            onChange={e => setFilterSchoolLevel(e.target.value)}
            className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white outline-none focus:border-blue-400 transition text-gray-600"
          >
            <option value="">All Levels</option>
            {studentLevelsInView.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        )}

        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setFilterGroup(''); setFilterStudent('all'); setFilterSchoolLevel('') }}
            className="text-xs text-red-400 hover:text-red-600 font-medium transition px-1"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Member count */}
      <p className="text-xs text-gray-400 mb-3">
        {filtered.length} of {members.length} member{members.length !== 1 ? 's' : ''}
        {hasFilters && filtered.length < members.length && (
          <span className="ml-1 text-blue-400 font-medium">(filtered)</span>
        )}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{members.length === 0 ? 'No members yet. Add your first member.' : 'No members match your search.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
          {filtered.map(m => (
            <div key={m.id} className={deleting === m.id ? 'opacity-40 pointer-events-none' : ''}>
              <MemberCard
                member={m}
                onEdit={() => setModal(m)}
                onDelete={() => handleDelete(m.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Send Reminders */}
      <RemindersPanel />

      {/* Modal */}
      {modal !== null && (
        <MemberModal
          member={modal === 'add' ? undefined : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
          allGroups={allGroups}
        />
      )}
    </>
  )
}

export default function CongregationPage() {
  return (
    <RequireAuth role="admin">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Congregation Database</h1>
          <p className="text-gray-500 text-sm mt-1">
            Admin only · member contact info and monthly duty reminders
          </p>
        </div>
        <CongregationContent />
      </div>
    </RequireAuth>
  )
}
