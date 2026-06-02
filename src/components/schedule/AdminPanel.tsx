import React, { useState, useEffect, useRef } from 'react'
import {
  Loader2, Plus, Pencil, Trash2, X, Check, Search,
  Upload, Send, Users, CalendarDays, BookUser, GraduationCap,
  Archive, ArchiveRestore, Save, Calendar,
  FileText, File, FileImage, Download, ChevronDown, ChevronRight, Youtube, Link,
} from 'lucide-react'
import { RequireAuth, useAuth } from '../../context/AuthContext'
import { CalendarContent } from './ScheduleCalendar'

type Member = {
  id: string
  name: string
  phone: string
  email: string
  photoUrl: string
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

// ── Phone helpers ─────────────────────────────────────────────────────────────

function formatPhone(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  // Strip leading country code 1 or +1
  if (digits.length > 10 && digits.startsWith('1')) digits = digits.slice(1)
  digits = digits.slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
}

function displayPhone(stored: string): string {
  return stored ? formatPhone(stored) : ''
}

// ── Member Form Modal ─────────────────────────────────────────────────────────

function MemberModal({ member, onSave, onClose }: {
  member?: Member
  onSave: (data: Omit<Member, 'id'>) => Promise<void>
  onClose: () => void
}) {
  const { authFetch } = useAuth()
  const [name,     setName]     = useState(member?.name     ?? '')
  const [phone,    setPhone]    = useState(member?.phone ? formatPhone(member.phone) : '')
  const [email,    setEmail]    = useState(member?.email    ?? '')
  const [photoUrl, setPhotoUrl] = useState(member?.photoUrl ?? '')
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
      await onSave({ name, phone: phone.replace(/-/g, ''), email, photoUrl })
      onClose()
    } catch (err: any) {
      setError(err.message ?? 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-gray-800 mb-5">{member ? 'Edit Member' : 'Add Member'}</h2>

        <div className="flex flex-col items-center gap-2 mb-5">
          <div
            className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center cursor-pointer hover:border-blue-400 transition"
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
          <button type="button" onClick={() => fileRef.current?.click()}
            className="text-xs text-blue-500 hover:text-blue-700 font-medium transition" disabled={uploading}>
            {uploading ? 'Uploading…' : 'Upload photo'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Full name"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Phone</label>
            <input type="tel" value={phone}
              onChange={e => setPhone(formatPhone(e.target.value))}
              placeholder="___-___-____"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition" />
          </div>
        </div>

        {error && <p className="text-red-500 text-xs mt-3 font-medium">{error}</p>}

        <div className="flex gap-2 mt-5">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Check className="w-4 h-4" /> Save</>}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Send Reminders Panel ──────────────────────────────────────────────────────

function RemindersPanel() {
  const { authFetch } = useAuth()
  const months = get12Months()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<ReminderResult | null>(null)
  const [errMsg, setErrMsg] = useState('')

  async function sendReminders() {
    const { year, month } = months[selectedIdx]
    setStatus('sending'); setResult(null); setErrMsg('')
    try {
      const res  = await authFetch('/api/reminders/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data); setStatus('done')
    } catch (err: any) {
      setErrMsg(err.message ?? 'Failed to send reminders'); setStatus('error')
    }
  }

  return (
    <div className="border-t border-gray-200 pt-5 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Send className="w-4 h-4 text-blue-500" />
        <h2 className="text-sm font-bold text-gray-800">Send Monthly Reminders</h2>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Emails every co-worker with duties in the selected month who is in the database.
      </p>
      <div className="flex flex-wrap gap-2 items-center">
        <select value={selectedIdx} onChange={e => { setSelectedIdx(Number(e.target.value)); setResult(null) }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white">
          {months.map((m, i) => <option key={i} value={i}>{m.label}</option>)}
        </select>
        <button onClick={sendReminders} disabled={status === 'sending'}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-50">
          {status === 'sending'
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
            : <><Send className="w-4 h-4" /> Send Reminders</>}
        </button>
      </div>
      {status === 'error' && <p className="mt-3 text-red-500 text-xs font-medium">{errMsg}</p>}
      {result && (
        <div className="mt-4 flex flex-col gap-2 text-xs">
          {result.message && <p className="text-gray-500 italic">{result.message}</p>}
          {result.sent.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              <span className="font-bold text-green-700">✓ Sent ({result.sent.length}):</span>{' '}
              <span className="text-green-700">{result.sent.map(s => s.name).join(', ')}</span>
            </div>
          )}
          {result.skipped.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <span className="font-bold text-amber-700">⚠ Skipped ({result.skipped.length}):</span>{' '}
              <span className="text-amber-700">{result.skipped.map(s => `${s.name} (${s.reason})`).join(', ')}</span>
            </div>
          )}
          {result.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <span className="font-bold text-red-700">✗ Errors ({result.errors.length}):</span>{' '}
              <span className="text-red-700">{result.errors.map(e => `${e.name}: ${e.error}`).join(', ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Contacts tab ─────────────────────────────────────────────────────────────

function ContactsPanel() {
  const { authFetch } = useAuth()
  const [members,    setMembers]    = useState<Member[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [modal,      setModal]      = useState<'add' | Member | null>(null)
  const [deleting,       setDeleting]       = useState<string | null>(null)
  const [deleteConfirm,  setDeleteConfirm]  = useState<{ id: string; name: string; count: number } | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function openPreview(url: string) {
    if (previewTimer.current) clearTimeout(previewTimer.current)
    setPreviewUrl(url)
    previewTimer.current = setTimeout(() => setPreviewUrl(null), 5000)
  }

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

  async function performDelete(id: string) {
    setDeleting(id)
    try {
      await authFetch(`/api/congregation/${id}`, { method: 'DELETE' })
      setMembers(prev => prev.filter(m => m.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      const res  = await authFetch(`/api/congregation/${id}/in-use`)
      const data = await res.json()
      if (data.count > 0) {
        setDeleteConfirm({ id, name: data.name, count: data.count })
        setDeleting(null)
        return
      }
    } catch {
      setDeleting(null)
      return
    }
    await performDelete(id)
  }

  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    const qDigits = q.replace(/\D/g, '')
    return m.name.toLowerCase().includes(q)
      || m.email.toLowerCase().includes(q)
      || (qDigits ? m.phone.includes(qDigits) : m.phone.includes(q))
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <Users className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-sm font-semibold text-gray-700 mr-2">Name Search</span>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-300 bg-white"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <span className="text-xs text-gray-400 shrink-0">{filtered.length} / {members.length}</span>
          <button
            onClick={() => setModal('add')}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">{members.length === 0 ? 'No members yet.' : 'No results.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                  <th className="px-4 py-2 font-semibold text-gray-600 text-xs uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 font-semibold text-gray-600 text-xs uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-2 font-semibold text-gray-600 text-xs uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2 font-semibold text-gray-600 text-xs uppercase tracking-wider">Photo</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id}
                    className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 transition ${deleting === m.id ? 'opacity-40 pointer-events-none' : ''}`}>
                    <td className="px-4 py-2.5 font-medium text-gray-900 whitespace-nowrap">{m.name}</td>
                    <td className="px-4 py-2.5 text-gray-500">{m.phone ? displayPhone(m.phone) : <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-2.5 text-gray-500">{m.email || <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-2.5">
                      {m.photoUrl
                        ? <img src={m.photoUrl} alt={m.name}
                            onClick={() => openPreview(m.photoUrl)}
                            className="w-8 h-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-blue-400 transition" />
                        : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => setModal(m)}
                          className="p-1.5 rounded text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(m.id)}
                          className="p-1.5 rounded text-red-300 hover:text-red-500 hover:bg-red-50 transition" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 pb-5">
          <RemindersPanel />
        </div>
      </div>

      {modal !== null && (
        <MemberModal
          member={modal === 'add' ? undefined : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4"
          onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-800 mb-2">Remove Contact?</h3>
            <p className="text-sm text-gray-600 mb-1">
              <strong>{deleteConfirm.name}</strong> appears in{' '}
              <strong>{deleteConfirm.count}</strong> schedule entr{deleteConfirm.count !== 1 ? 'ies' : 'y'}.
            </p>
            <p className="text-sm text-gray-400 mb-5">Removing from contacts will not affect existing schedules.</p>
            <div className="flex gap-2">
              <button
                onClick={() => { performDelete(deleteConfirm.id); setDeleteConfirm(null) }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition">
                Yes, Remove
              </button>
              <button onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {previewUrl && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center"
          onClick={() => { if (previewTimer.current) clearTimeout(previewTimer.current); setPreviewUrl(null) }}>
          <img src={previewUrl} alt="Preview"
            className="w-48 h-48 rounded-2xl object-cover shadow-2xl ring-4 ring-white" />
        </div>
      )}
    </div>
  )
}

// ── Classes Panel ─────────────────────────────────────────────────────────────

const CLASS_DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

type ClassInfo = {
  id: number; name: string; lead_name: string; lead_email: string
  description: string; location: string; meeting_day: string; meeting_time: string
  recurrence: string; start_date: string | null; end_date: string | null
  has_lead_password: boolean; archived: boolean
}

type ClassFormState = {
  name: string; lead_name: string; lead_email: string; description: string
  location: string; meeting_day: string; meeting_time: string
  recurrence: string; start_date: string; end_date: string; lead_password: string
}

function emptyForm(): ClassFormState {
  return { name:'', lead_name:'', lead_email:'', description:'', location:'', meeting_day:'', meeting_time:'', recurrence:'none', start_date:'', end_date:'', lead_password:'' }
}
function classToForm(c: ClassInfo): ClassFormState {
  return { name: c.name, lead_name: c.lead_name, lead_email: c.lead_email, description: c.description, location: c.location, meeting_day: c.meeting_day, meeting_time: c.meeting_time, recurrence: c.recurrence, start_date: c.start_date || '', end_date: c.end_date || '', lead_password: '' }
}

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Class Form Modal ──────────────────────────────────────────────────────────
function ClassFormModal({ title, form, setForm, onSubmit, onClose, saving, error }: {
  title: string
  form: ClassFormState
  setForm: React.Dispatch<React.SetStateAction<ClassFormState>>
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  saving: boolean
  error: string
}) {
  const inp = 'w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition bg-white'
  const lbl = 'text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block'

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/50 px-4 py-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 relative my-4" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        <h3 className="font-bold text-gray-800 text-lg mb-5">{title}</h3>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {/* Row 1: Name (full width) */}
          <div>
            <label className={lbl}>Class Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className={inp} required autoFocus />
          </div>

          {/* Row 2: Leader Name + Leader Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Leader Name</label>
              <input value={form.lead_name} onChange={e => setForm(f => ({...f, lead_name: e.target.value}))} placeholder="e.g. Pastor John" className={inp} />
            </div>
            <div>
              <label className={lbl}>Leader Email</label>
              <input value={form.lead_email} onChange={e => setForm(f => ({...f, lead_email: e.target.value}))} type="email" className={inp} />
            </div>
          </div>

          {/* Row 3: Description + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={2} className={`${inp} resize-none`} />
            </div>
            <div>
              <label className={lbl}>Location</label>
              <input value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} placeholder="e.g. Room 201" className={inp} />
            </div>
          </div>

          {/* Schedule section */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Schedule</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Day</label>
                <select value={form.meeting_day} onChange={e => setForm(f => ({...f, meeting_day: e.target.value}))} className={inp}>
                  <option value="">— no day —</option>
                  {CLASS_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Time</label>
                <input type="time" value={form.meeting_time} onChange={e => setForm(f => ({...f, meeting_time: e.target.value}))} className={inp} />
              </div>
              <div>
                <label className={lbl}>Recurring</label>
                <div className="flex gap-1.5 h-[42px]">
                  {(['none','weekly','monthly'] as const).map(r => (
                    <button key={r} type="button"
                      onClick={() => setForm(f => ({...f, recurrence: r}))}
                      className={`flex-1 rounded-xl text-xs font-semibold border-2 transition capitalize ${
                        form.recurrence === r ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >{r === 'none' ? 'None' : r}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className={`mt-4 grid gap-4 ${form.recurrence !== 'none' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 max-w-xs'}`}>
              <div>
                <label className={lbl}>{form.recurrence === 'none' ? 'Date' : 'Start Date'}</label>
                <input type="date" value={form.start_date} onChange={e => setForm(f => ({...f, start_date: e.target.value}))} className={inp} />
              </div>
              {form.recurrence !== 'none' && (
                <div>
                  <label className={lbl}>End Date</label>
                  <input type="date" value={form.end_date} onChange={e => setForm(f => ({...f, end_date: e.target.value}))} className={inp} />
                </div>
              )}
            </div>
          </div>

          {/* Lead password */}
          <div className="border-t border-gray-100 pt-4">
            <label className={lbl}>Lead Password (leave blank to keep)</label>
            <input type="password" value={form.lead_password} onChange={e => setForm(f => ({...f, lead_password: e.target.value}))} placeholder="Set or change leader password…" className={inp} autoComplete="new-password" />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button type="submit" disabled={saving || !form.name.trim()}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Per-class document manager (inline in AdminPanel) ─────────────────────────

type ClassDoc = { id: number; name: string; url: string; file_type: string; size_bytes: number }

function AdminDocIcon({ type }: { type: string }) {
  if (type === 'video/youtube') return <Youtube className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
  if (type.startsWith('image/')) return <FileImage className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
  if (type === 'application/pdf') return <FileText className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
  if (type.includes('word')) return <FileText className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
  if (type.includes('powerpoint') || type.includes('presentation')) return <FileText className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
  if (type.includes('excel') || type.includes('spreadsheet')) return <FileText className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
  return <File className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
}

function ytVideoId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

function dlUrl(url: string) {
  return url.replace('/upload/', '/upload/fl_attachment/')
}

function fmtBytes(b: number) {
  if (!b) return ''
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

function ClassDocManager({ classId, authFetch }: {
  classId: number
  authFetch: (u: string, i?: RequestInit) => Promise<Response>
}) {
  const [open, setOpen]           = useState(false)
  const [tab, setTab]             = useState<'file' | 'yt'>('file')
  const [docs, setDocs]           = useState<ClassDoc[]>([])
  const [loaded, setLoaded]       = useState(false)
  const [uploading, setUploading] = useState(false)
  const [flash, setFlash]         = useState('')
  const [docName, setDocName]     = useState('')
  const [ytUrl, setYtUrl]         = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const showFlash = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(''), 2500) }

  async function load() {
    if (loaded) return
    const r = await authFetch(`/api/classes/${classId}/documents`)
    const d = await r.json()
    setDocs(Array.isArray(d) ? d : [])
    setLoaded(true)
  }

  function toggle() { if (!open) load(); setOpen(o => !o) }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    if (docName.trim()) fd.append('name', docName.trim())
    const r = await authFetch(`/api/classes/${classId}/documents`, { method: 'POST', body: fd })
    const d = await r.json()
    setUploading(false)
    if (r.ok) { setDocs(prev => [d, ...prev]); setDocName(''); showFlash('Uploaded!') }
    else showFlash(d.error || 'Upload failed')
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleYtAdd() {
    if (!ytUrl.trim()) return
    setUploading(true)
    const r = await authFetch(`/api/classes/${classId}/documents/link`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: docName.trim() || ytUrl.trim(), url: ytUrl.trim() }),
    })
    const d = await r.json()
    setUploading(false)
    if (r.ok) { setDocs(prev => [d, ...prev]); setDocName(''); setYtUrl(''); showFlash('Link added!') }
    else showFlash(d.error || 'Failed')
  }

  async function handleDelete(docId: number) {
    setDeletingId(docId)
    const r = await authFetch(`/api/classes/${classId}/documents/${docId}`, { method: 'DELETE' })
    if (r.ok) { setDocs(prev => prev.filter(d => d.id !== docId)); showFlash('Deleted.') }
    setDeletingId(null)
  }

  return (
    <div className="mt-2 border-t border-gray-100 pt-2">
      <button onClick={toggle}
        className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 font-medium transition">
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        Documents {loaded ? `(${docs.length})` : ''}
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2">
          {flash && <p className="text-xs text-green-600 font-medium">{flash}</p>}

          {/* Tab toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5 w-fit">
            <button onClick={() => setTab('file')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition ${tab === 'file' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
              <Upload className="w-3 h-3" /> File
            </button>
            <button onClick={() => setTab('yt')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition ${tab === 'yt' ? 'bg-red-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
              <Youtube className="w-3 h-3" /> YouTube
            </button>
          </div>

          <input value={docName} onChange={e => setDocName(e.target.value)}
            placeholder={tab === 'yt' ? 'Video title (optional)' : 'Title (optional)'}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-300 w-full" />

          {tab === 'file' ? (
            <div className="flex gap-1.5">
              <input ref={fileRef} type="file" className="hidden" onChange={handleUpload}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,image/*" />
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition disabled:opacity-50">
                {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                Choose File
              </button>
            </div>
          ) : (
            <div className="flex gap-1.5">
              <input value={ytUrl} onChange={e => setYtUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=…"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-red-300" />
              <button onClick={handleYtAdd} disabled={uploading || !ytUrl.trim()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition disabled:opacity-50">
                {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Link className="w-3 h-3" />}
                Add
              </button>
            </div>
          )}

          {/* Doc list */}
          {!loaded ? (
            <p className="text-xs text-gray-400">Loading…</p>
          ) : docs.length === 0 ? (
            <p className="text-xs text-gray-400">No documents yet.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {docs.map(doc => {
                const isYt  = doc.file_type === 'video/youtube'
                const isPdf = doc.file_type === 'application/pdf'
                const isImg = doc.file_type.startsWith('image/')
                const vid   = isYt ? ytVideoId(doc.url) : null
                const href  = isYt || isPdf || isImg ? doc.url : dlUrl(doc.url)
                return (
                  <div key={doc.id} className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                    {vid
                      ? <img src={`https://img.youtube.com/vi/${vid}/default.jpg`} alt="" className="w-9 h-6 object-cover rounded flex-shrink-0" />
                      : <AdminDocIcon type={doc.file_type} />
                    }
                    <div className="flex-1 min-w-0">
                      <a href={href} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-medium text-gray-700 hover:text-blue-600 truncate block">
                        {doc.name}
                      </a>
                    </div>
                    {isPdf && (
                      <a href={dlUrl(doc.url)} target="_blank" rel="noopener noreferrer"
                        className="p-1 text-gray-300 hover:text-gray-500 transition flex-shrink-0" title="Download">
                        <Download className="w-3 h-3" />
                      </a>
                    )}
                    <button onClick={() => handleDelete(doc.id)} disabled={deletingId === doc.id}
                      className="p-1 text-gray-300 hover:text-red-500 transition disabled:opacity-40 flex-shrink-0">
                      {deletingId === doc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ClassesPanel() {
  const { authFetch } = useAuth()
  const [classes, setClasses]   = useState<ClassInfo[]>([])
  const [loading, setLoading]   = useState(true)
  const [flash, setFlash]       = useState('')

  // Archived section toggle
  const [showArchived, setShowArchived] = useState(false)

  // Create
  const [showCreate, setShowCreate]   = useState(false)
  const [createForm, setCreateForm]   = useState<ClassFormState>(emptyForm())
  const [createSaving, setCreateSaving] = useState(false)
  const [createError, setCreateError]   = useState('')

  // Edit
  const [editClass, setEditClass]   = useState<ClassInfo | null>(null)
  const [editForm, setEditForm]     = useState<ClassFormState>(emptyForm())
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError]   = useState('')

  // Delete confirm
  const [deletingClass, setDeletingClass] = useState<ClassInfo | null>(null)

  // Per-row busy state (archive/delete in flight)
  const [busyId, setBusyId] = useState<number | null>(null)

  // Password inline
  const [pwEdit, setPwEdit]     = useState<number | null>(null)
  const [pwValue, setPwValue]   = useState('')
  const [pwSaving, setPwSaving] = useState(false)

  const showFlash = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(''), 3000) }

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const r = await authFetch('/api/classes')
    const d = await r.json()
    setClasses(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!createForm.name.trim()) return
    setCreateSaving(true); setCreateError('')
    const body: Record<string, unknown> = {
      name: createForm.name.trim(), lead_name: createForm.lead_name.trim(),
      lead_email: createForm.lead_email.trim(), description: createForm.description.trim(),
      location: createForm.location.trim(), meeting_day: createForm.meeting_day,
      meeting_time: createForm.meeting_time, recurrence: createForm.recurrence,
      start_date: createForm.start_date || null,
      end_date: createForm.recurrence !== 'none' ? createForm.end_date || null : null,
    }
    if (createForm.lead_password) body.lead_password = createForm.lead_password
    const r = await authFetch('/api/classes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const d = await r.json()
    setCreateSaving(false)
    if (!r.ok) { setCreateError(d.error || 'Failed'); return }
    setClasses(prev => [...prev, d].sort((a, b) => a.name.localeCompare(b.name)))
    setCreateForm(emptyForm()); setShowCreate(false)
    showFlash(`"${d.name}" created.`)
  }

  function openEdit(c: ClassInfo) {
    setEditClass(c); setEditForm(classToForm(c)); setEditError('')
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editClass || !editForm.name.trim()) return
    setEditSaving(true); setEditError('')
    const body: Record<string, unknown> = {
      name: editForm.name.trim(), lead_name: editForm.lead_name.trim(),
      lead_email: editForm.lead_email.trim(), description: editForm.description.trim(),
      location: editForm.location.trim(), meeting_day: editForm.meeting_day,
      meeting_time: editForm.meeting_time, recurrence: editForm.recurrence,
      start_date: editForm.start_date || null,
      end_date: editForm.recurrence !== 'none' ? editForm.end_date || null : null,
    }
    if (editForm.lead_password) body.lead_password = editForm.lead_password
    const r = await authFetch(`/api/classes/${editClass.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const d = await r.json()
    setEditSaving(false)
    if (!r.ok) { setEditError(d.error || 'Failed'); return }
    setClasses(prev => prev.map(c => c.id === d.id ? d : c))
    setEditClass(null)
    showFlash(`"${d.name}" updated.`)
  }

  async function handleArchive(c: ClassInfo) {
    if (busyId === c.id) return
    setBusyId(c.id)
    // Optimistic update — move immediately, revert on failure
    setClasses(prev => prev.map(x => x.id === c.id ? { ...x, archived: !x.archived } : x))
    try {
      const r = await authFetch(`/api/classes/${c.id}/archive`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: !c.archived }),
      })
      const d = await r.json()
      if (r.ok) {
        setClasses(prev => prev.map(x => x.id === d.id ? d : x))
        showFlash(`"${c.name}" ${d.archived ? 'archived' : 'restored'}.`)
      } else {
        setClasses(prev => prev.map(x => x.id === c.id ? c : x)) // revert
        showFlash(d.error || 'Archive failed')
      }
    } catch {
      setClasses(prev => prev.map(x => x.id === c.id ? c : x)) // revert
      showFlash('Network error — could not reach server')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete() {
    if (!deletingClass) return
    setBusyId(deletingClass.id)
    try {
      const r = await authFetch(`/api/classes/${deletingClass.id}`, { method: 'DELETE' })
      if (r.ok) {
        setClasses(prev => prev.filter(c => c.id !== deletingClass.id))
        showFlash(`"${deletingClass.name}" deleted.`)
      } else {
        const d = await r.json().catch(() => ({}))
        showFlash((d as { error?: string }).error || 'Delete failed')
      }
    } catch {
      showFlash('Network error — could not reach server')
    } finally {
      setBusyId(null)
      setDeletingClass(null)
    }
  }

  async function savePassword(classId: number) {
    if (!pwValue.trim()) return
    setPwSaving(true)
    const r = await authFetch(`/api/classes/${classId}/lead-password`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwValue }),
    })
    setPwSaving(false)
    if (r.ok) {
      setClasses(prev => prev.map(c => c.id === classId ? { ...c, has_lead_password: true } : c))
      setPwEdit(null); setPwValue('')
      showFlash('Lead password saved!')
    }
  }

  const activeClasses   = classes.filter(c => !c.archived)
  const archivedClasses = classes.filter(c => c.archived)

  // Inline row renderer — avoids defining a component inside a component
  // table row renderer — returns a React.Fragment so we can add an expandable sub-row
  const renderTableRow = (c: ClassInfo, idx: number) => (
    <React.Fragment key={c.id}>
      <tr className={`border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} ${c.archived ? 'opacity-60' : ''} hover:bg-blue-50/30 transition-colors`}>
        {/* Class name + description */}
        <td className="px-4 py-3 align-top min-w-[180px]">
          <div className={`font-semibold text-sm ${c.archived ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
            {c.name}
          </div>
          {c.description && (
            <div className="text-xs text-gray-500 mt-0.5 leading-snug">{c.description}</div>
          )}
        </td>

        {/* Leader */}
        <td className="px-4 py-3 align-top min-w-[160px]">
          {c.lead_name
            ? <>
                <div className="text-sm font-medium text-gray-800">{c.lead_name}</div>
                {c.lead_email && <div className="text-xs text-gray-500 mt-0.5">{c.lead_email}</div>}
              </>
            : <span className="text-xs text-gray-300">—</span>
          }
        </td>

        {/* Schedule */}
        <td className="px-4 py-3 align-top whitespace-nowrap">
          {c.meeting_day && c.meeting_time
            ? <>
                <div className="text-sm text-gray-800 font-medium">{c.meeting_day}s</div>
                <div className="text-xs text-gray-500">{c.meeting_time}</div>
              </>
            : <span className="text-xs text-gray-300">—</span>
          }
        </td>

        {/* Dates */}
        <td className="px-4 py-3 align-top min-w-[140px]">
          {c.start_date || c.end_date ? (
            <div className="flex flex-col gap-0.5">
              {c.start_date && (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-gray-400 w-8 shrink-0">Start</span>
                  <span className="text-sm font-medium text-gray-800">{fmtDate(c.start_date)}</span>
                </div>
              )}
              {c.end_date && (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-gray-400 w-8 shrink-0">End</span>
                  <span className="text-sm text-gray-700">{fmtDate(c.end_date)}</span>
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-300">—</span>
          )}
        </td>

        {/* Location */}
        <td className="px-4 py-3 align-top min-w-[120px]">
          {c.location
            ? <div className="text-sm text-gray-800">{c.location}</div>
            : <span className="text-xs text-gray-300">—</span>
          }
        </td>

        {/* Lead password */}
        <td className="px-4 py-3 align-top whitespace-nowrap">
          {c.archived ? (
            <span className="text-xs text-gray-300">—</span>
          ) : (
            <div className="flex flex-col gap-1">
              {c.has_lead_password
                ? <span className="text-xs text-green-600 font-medium flex items-center gap-1"><Check className="w-3 h-3" /> Set</span>
                : <span className="text-xs text-gray-400">Not set</span>
              }
              <button
                onClick={() => { setPwEdit(pwEdit === c.id ? null : c.id); setPwValue('') }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition text-left"
              >
                {c.has_lead_password ? 'Change' : 'Set'}
              </button>
            </div>
          )}
        </td>

        {/* Actions */}
        <td className="px-4 py-3 align-top">
          <div className="flex items-center gap-0.5">
            {!c.archived && (
              <button onClick={() => openEdit(c)} title="Edit"
                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-100 transition">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => handleArchive(c)}
              disabled={busyId === c.id}
              title={c.archived ? 'Restore' : 'Archive'}
              className={`p-1.5 rounded-lg transition disabled:opacity-40 ${c.archived
                ? 'text-green-500 hover:text-green-700 hover:bg-green-100'
                : 'text-gray-400 hover:text-amber-600 hover:bg-amber-100'
              }`}
            >
              {busyId === c.id
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : c.archived
                  ? <ArchiveRestore className="w-3.5 h-3.5" />
                  : <Archive className="w-3.5 h-3.5" />
              }
            </button>
            <button onClick={() => setDeletingClass(c)} title="Delete"
              disabled={busyId === c.id}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-100 transition disabled:opacity-40">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>

      {/* Inline password editor */}
      {pwEdit === c.id && (
        <tr className="bg-blue-50 border-b border-blue-100">
          <td colSpan={7} className="px-4 py-3">
            <div className="flex gap-2 max-w-md">
              <input
                type="password" value={pwValue}
                onChange={e => setPwValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') savePassword(c.id) }}
                placeholder="New lead password" autoFocus
                className="flex-1 border-2 border-blue-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-400 bg-white"
              />
              <button onClick={() => savePassword(c.id)} disabled={pwSaving || !pwValue.trim()}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-50">
                {pwSaving ? '…' : 'Save'}
              </button>
              <button onClick={() => { setPwEdit(null); setPwValue('') }}
                className="px-2 py-1.5 text-gray-400 hover:text-gray-600 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
      )}

      {/* Documents sub-row */}
      <tr className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} ${c.archived ? 'opacity-60' : ''}`}>
        <td colSpan={6} className="px-4 pb-3 pt-0">
          <ClassDocManager classId={c.id} authFetch={authFetch} />
        </td>
      </tr>
    </React.Fragment>
  )

  // Plain function, NOT a React component — avoids remounting on every ClassesPanel render
  const classTable = (rows: ClassInfo[]) => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Leader</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Schedule</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dates</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lead PW</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c, i) => renderTableRow(c, i))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 pt-2">
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
          Classes ({activeClasses.length})
        </h2>
        <button
          onClick={() => { setCreateForm(emptyForm()); setCreateError(''); setShowCreate(true) }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" /> New Class
        </button>
      </div>

      {flash && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-4 py-2 rounded-xl mb-3">
          <Check className="w-4 h-4" /> {flash}
        </div>
      )}

      {/* Active classes table */}
      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>
      ) : activeClasses.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">No active classes. Create one above.</p>
      ) : (
        classTable(activeClasses)
      )}

      {/* Archived classes */}
      {!loading && archivedClasses.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowArchived(s => !s)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition mb-2"
          >
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-600">
                Archived Classes ({archivedClasses.length})
              </span>
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {showArchived ? '▲ Hide' : '▼ Show'}
            </span>
          </button>
          {showArchived && classTable(archivedClasses)}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <ClassFormModal
          title="New Class"
          form={createForm} setForm={setCreateForm}
          onSubmit={handleCreate} onClose={() => setShowCreate(false)}
          saving={createSaving} error={createError}
        />
      )}

      {/* Edit modal */}
      {editClass && (
        <ClassFormModal
          title={`Edit — ${editClass.name}`}
          form={editForm} setForm={setEditForm}
          onSubmit={handleEdit} onClose={() => setEditClass(null)}
          saving={editSaving} error={editError}
        />
      )}

      {/* Delete confirm */}
      {deletingClass && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4" onClick={() => setDeletingClass(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-gray-800">Delete Class</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Delete <strong>"{deletingClass.name}"</strong>? All sessions and attendance records will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingClass(null)}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Admin Panel ───────────────────────────────────────────────────────────────

function AdminContent() {
  const [tab, setTab] = useState<'calendar' | 'contacts' | 'classes'>('calendar')

  return (
    <div>
      {/* Top bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Admin</h1>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm font-semibold w-full">
          <button
            onClick={() => setTab('calendar')}
            className={`flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 transition-colors ${
              tab === 'calendar' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Calendar
          </button>
          <button
            onClick={() => setTab('contacts')}
            className={`flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 border-l border-gray-200 transition-colors ${
              tab === 'contacts' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BookUser className="w-4 h-4" />
            Contacts
          </button>
          <button
            onClick={() => setTab('classes')}
            className={`flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 border-l border-gray-200 transition-colors ${
              tab === 'classes' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Classes
          </button>
        </div>
      </div>

      {/* Tab content */}
      {tab === 'calendar' ? (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
          <CalendarContent />
        </div>
      ) : tab === 'contacts' ? (
        <ContactsPanel />
      ) : (
        <ClassesPanel />
      )}
    </div>
  )
}

export default function AdminPanel() {
  return (
    <RequireAuth role="admin">
      <AdminContent />
    </RequireAuth>
  )
}
