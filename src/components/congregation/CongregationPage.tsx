import { useState, useEffect, useRef } from 'react'
import { Loader2, Plus, Pencil, Trash2, X, Check, Search, Mail, Phone, Upload, Send, Users } from 'lucide-react'
import { RequireAuth, useAuth } from '../../context/AuthContext'

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

// ── Member Form Modal ─────────────────────────────────────────────────────────

function MemberModal({ member, onSave, onClose }: {
  member?: Member
  onSave: (data: Omit<Member, 'id'>) => Promise<void>
  onClose: () => void
}) {
  const { authFetch } = useAuth()
  const [name,     setName]     = useState(member?.name     ?? '')
  const [phone,    setPhone]    = useState(member?.phone    ?? '')
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
      await onSave({ name, phone, email, photoUrl })
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
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Phone</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com"
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

// ── Member Card ───────────────────────────────────────────────────────────────

function MemberCard({ member, onEdit, onDelete }: {
  member: Member
  onEdit: () => void
  onDelete: () => void
}) {
  const initials = member.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex gap-3">
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
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
      setStatus('done')
    } catch (err: any) {
      setErrMsg(err.message ?? 'Failed to send reminders')
      setStatus('error')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
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
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white"
        >
          {months.map((m, i) => <option key={i} value={i}>{m.label}</option>)}
        </select>

        <button
          onClick={sendReminders}
          disabled={status === 'sending'}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-50"
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

// ── Main Page ─────────────────────────────────────────────────────────────────

function CongregationContent() {
  const { authFetch } = useAuth()
  const [members,  setMembers]  = useState<Member[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [modal,    setModal]    = useState<'add' | Member | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    authFetch('/api/congregation')
      .then(r => r.json())
      .then(data => { setMembers(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave(data: Omit<Member, 'id'>) {
    if (typeof modal === 'object' && modal !== null) {
      // Edit
      const res = await authFetch(`/api/congregation/${modal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const updated = await res.json()
      if (!res.ok) throw new Error(updated.error)
      setMembers(prev => prev.map(m => m.id === modal.id ? updated : m))
    } else {
      // Add
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

  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    return m.name.toLowerCase().includes(q)
      || m.email.toLowerCase().includes(q)
      || m.phone.includes(q)
  })

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
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 bg-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {/* Member count */}
      <p className="text-xs text-gray-400 mb-3">
        {filtered.length} of {members.length} member{members.length !== 1 ? 's' : ''}
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
