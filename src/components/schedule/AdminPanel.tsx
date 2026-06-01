import { useState, useEffect, useRef } from 'react'
import {
  Loader2, Plus, Pencil, Trash2, X, Check, Search,
  Upload, Send, Users, CalendarDays, BookUser, GraduationCap,
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

type ClassInfo = { id: number; name: string; lead_name: string; lead_email: string; description: string; has_lead_password: boolean }

function ClassesPanel() {
  const { authFetch } = useAuth()
  const [classes, setClasses]     = useState<ClassInfo[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({ name: '', lead_name: '', lead_email: '', description: '' })
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [pwEdit, setPwEdit]       = useState<number | null>(null)
  const [pwValue, setPwValue]     = useState('')
  const [pwSaving, setPwSaving]   = useState(false)
  const [pwFlash, setPwFlash]     = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const r = await authFetch('/api/classes')
    const d = await r.json()
    setClasses(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  async function create(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true); setError('')
    const r = await authFetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await r.json()
    setSaving(false)
    if (!r.ok) { setError(d.error || 'Failed'); return }
    setClasses(prev => [...prev, d].sort((a, b) => a.name.localeCompare(b.name)))
    setForm({ name: '', lead_name: '', lead_email: '', description: '' })
    setShowForm(false)
  }

  async function savePassword(classId: number) {
    if (!pwValue.trim()) return
    setPwSaving(true)
    const r = await authFetch(`/api/classes/${classId}/lead-password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwValue }),
    })
    setPwSaving(false)
    if (r.ok) {
      setClasses(prev => prev.map(c => c.id === classId ? { ...c, has_lead_password: true } : c))
      setPwEdit(null)
      setPwValue('')
      setPwFlash('Password saved!')
      setTimeout(() => setPwFlash(''), 3000)
    }
  }

  async function deleteClass(id: number) {
    if (!confirm('Delete this class and all its attendance records?')) return
    await authFetch(`/api/classes/${id}`, { method: 'DELETE' })
    setClasses(prev => prev.filter(c => c.id !== id))
  }

  const inp = 'w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-8">
      <div className="flex items-center justify-between mb-4 pt-2">
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Attendance Classes</h2>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" />
          New class
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-white border-2 border-blue-200 rounded-2xl p-5 mb-4 flex flex-col gap-3">
          <h3 className="font-semibold text-gray-800 text-sm">New Class</h3>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Class name *" className={inp} required />
          <input value={form.lead_name} onChange={e => setForm(f => ({ ...f, lead_name: e.target.value }))} placeholder="Leader name" className={inp} />
          <input value={form.lead_email} onChange={e => setForm(f => ({ ...f, lead_email: e.target.value }))} placeholder="Leader email" className={inp} />
          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" className={inp} />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition disabled:opacity-50">
              {saving ? 'Creating…' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      {pwFlash && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-4 py-2 rounded-xl mb-3">
          <Check className="w-4 h-4" /> {pwFlash}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>
      ) : classes.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">No classes yet. Create one above.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {classes.map(c => (
            <div key={c.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 text-sm">{c.name}</div>
                  {c.lead_name && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      Leader: {c.lead_name}{c.lead_email ? ` — ${c.lead_email}` : ''}
                    </div>
                  )}
                  {c.description && <div className="text-xs text-gray-400 mt-0.5">{c.description}</div>}

                  {/* Password row */}
                  <div className="flex items-center gap-2 mt-1.5">
                    {c.has_lead_password ? (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> Lead password set
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">No lead password</span>
                    )}
                    <button
                      onClick={() => { setPwEdit(pwEdit === c.id ? null : c.id); setPwValue('') }}
                      className="text-xs text-blue-500 hover:text-blue-700 font-medium transition"
                    >
                      {c.has_lead_password ? 'Change' : 'Set'}
                    </button>
                  </div>

                  {/* Inline password editor */}
                  {pwEdit === c.id && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="password"
                        value={pwValue}
                        onChange={e => setPwValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') savePassword(c.id) }}
                        placeholder="New lead password"
                        autoFocus
                        className="flex-1 border-2 border-blue-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-400"
                      />
                      <button
                        onClick={() => savePassword(c.id)}
                        disabled={pwSaving || !pwValue.trim()}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition disabled:opacity-50"
                      >
                        {pwSaving ? '…' : 'Save'}
                      </button>
                      <button
                        onClick={() => { setPwEdit(null); setPwValue('') }}
                        className="px-2 py-1.5 text-gray-400 hover:text-gray-600 text-xs transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <button onClick={() => deleteClass(c.id)} className="text-red-400 hover:text-red-600 transition flex-shrink-0 mt-0.5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
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
