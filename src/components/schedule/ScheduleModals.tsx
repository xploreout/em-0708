import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Plus, X, ChevronDown, Upload, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import type { Entry, Person, FormShared, EventType, Team, CongMember } from './scheduleTypes'
import { INPUT_SM } from './scheduleConstants'

// ── MiniModal (base overlay) ──────────────────────────────────────────────────

export function MiniModal({ title, onClose, children }: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-base font-bold text-gray-800 mb-4">{title}</h3>
        {children}
      </div>
    </div>,
    document.body
  )
}

// ── New Event Type modal ──────────────────────────────────────────────────────

export function NewEventTypeModal({ initialName = '', onSave, onClose }: {
  initialName?: string
  onSave: (name: string, recurring: boolean) => Promise<void>
  onClose: () => void
}) {
  const [name,      setName]      = useState(initialName)
  const [recurring, setRecurring] = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  async function handleSave() {
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true)
    try { await onSave(name.trim(), recurring) }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed'); setSaving(false) }
  }

  return (
    <MiniModal title="New Event Type" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <input autoFocus type="text" value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onClose() }}
          placeholder="Event name…"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input type="checkbox" checked={recurring} onChange={e => setRecurring(e.target.checked)} className="rounded" />
          Recurring event
        </label>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <div className="flex gap-2 mt-1">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition disabled:opacity-50">
            {saving ? 'Saving…' : 'Create'}
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
        </div>
      </div>
    </MiniModal>
  )
}

// ── New Team modal ────────────────────────────────────────────────────────────

export function NewTeamModal({ onSave, onClose }: {
  onSave: (name: string) => Promise<void>
  onClose: () => void
}) {
  const [name,   setName]   = useState('')
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  async function handleSave() {
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true)
    try { await onSave(name.trim()) }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed'); setSaving(false) }
  }

  return (
    <MiniModal title="New Team" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <input autoFocus type="text" value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onClose() }}
          placeholder="Team name…"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <div className="flex gap-2 mt-1">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition disabled:opacity-50">
            {saving ? 'Saving…' : 'Create'}
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
        </div>
      </div>
    </MiniModal>
  )
}

// ── New Contact modal ─────────────────────────────────────────────────────────

export function NewContactModal({ initialName = '', onSave, onClose }: {
  initialName?: string
  onSave: (m: CongMember) => void
  onClose: () => void
}) {
  const { authFetch } = useAuth()
  const [name,      setName]      = useState(initialName)
  const [phone,     setPhone]     = useState('')
  const [email,     setEmail]     = useState('')
  const [photoUrl,  setPhotoUrl]  = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('photo', file)
      const res  = await authFetch('/api/congregation/upload-photo', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPhotoUrl(data.url)
    } catch (e: any) {
      setError(e.message ?? 'Photo upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    try {
      const res = await authFetch('/api/congregation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), email: email.trim(), photoUrl }),
      })
      const m = await res.json()
      if (!res.ok) throw new Error(m.error)
      onSave({ id: m.id, name: m.name })
    } catch (e: any) {
      setError(e.message ?? 'Failed')
      setSaving(false)
    }
  }

  return (
    <MiniModal title="New Contact" onClose={onClose}>
      <div className="flex flex-col gap-3">
        {/* Photo upload */}
        <div className="flex flex-col items-center gap-1.5">
          <div
            onClick={() => fileRef.current?.click()}
            className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center cursor-pointer hover:border-blue-400 transition">
            {uploading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              : photoUrl ? <img src={photoUrl} alt="Photo" className="w-full h-full object-cover" />
              : <Upload className="w-5 h-5 text-gray-400" />}
          </div>
          <button type="button" onClick={() => fileRef.current?.click()}
            className="text-xs text-blue-500 hover:text-blue-700 font-medium transition" disabled={uploading}>
            {uploading ? 'Uploading…' : 'Upload photo'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>

        <input autoFocus type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full name *"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <div className="flex gap-2 mt-1">
          <button onClick={handleSave} disabled={saving || uploading}
            className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition disabled:opacity-50">
            {saving ? 'Saving…' : 'Add Contact'}
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
        </div>
      </div>
    </MiniModal>
  )
}

// ── Event name combobox ───────────────────────────────────────────────────────

export function EventNameSelect({ value, onChange, eventTypes, onCreated }: {
  value: string
  onChange: (name: string) => void
  eventTypes: EventType[]
  onCreated: (et: EventType) => void
}) {
  const { authFetch } = useAuth()
  const [open,    setOpen]    = useState(false)
  const [showNew, setShowNew] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const filtered = (value.trim()
    ? eventTypes.filter(et => et.name.toLowerCase().includes(value.toLowerCase()))
    : eventTypes
  ).slice(0, 8)

  const isNew = value.trim() && !eventTypes.some(et => et.name.toLowerCase() === value.toLowerCase().trim())

  async function createInline() {
    const res = await authFetch('/api/event-types', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: value.trim(), recurring: false }),
    })
    const et = await res.json()
    if (res.ok) { onCreated(et); onChange(et.name) }
    setOpen(false)
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={wrapRef} className="relative">
      <input type="text" value={value} placeholder="Event name…"
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        className={`${INPUT_SM} pr-8 border-blue-300 focus:ring-1 focus:ring-blue-200`} />
      <button type="button" tabIndex={-1}
        onMouseDown={e => { e.preventDefault(); setOpen(v => !v) }}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition">
        <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {filtered.map(et => (
            <button key={et.id} type="button"
              onMouseDown={e => { e.preventDefault(); onChange(et.name); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-50 last:border-0 flex items-center justify-between">
              <span>{et.name}</span>
              {et.recurring && <span className="text-xs text-gray-400 shrink-0 ml-2">recurring</span>}
            </button>
          ))}
          {isNew && (
            <button type="button"
              onMouseDown={e => { e.preventDefault(); createInline() }}
              className="w-full text-left px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 font-medium flex items-center gap-1 border-t border-gray-100">
              <Plus className="w-3 h-3" /> Add "{value.trim()}"
            </button>
          )}
          <button type="button"
            onMouseDown={e => { e.preventDefault(); setShowNew(true); setOpen(false) }}
            className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:bg-gray-50 font-semibold flex items-center gap-1 border-t border-gray-100">
            <Plus className="w-3 h-3" /> New event type with options…
          </button>
        </div>
      )}
      {showNew && (
        <NewEventTypeModal
          initialName={value}
          onSave={async (name, recurring) => {
            const res = await authFetch('/api/event-types', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, recurring }),
            })
            const et = await res.json()
            if (!res.ok) throw new Error(et.error)
            onCreated(et)
            onChange(et.name)
            setShowNew(false)
          }}
          onClose={() => setShowNew(false)}
        />
      )}
    </div>
  )
}

// ── Team combobox ─────────────────────────────────────────────────────────────

export function TeamSelect({ teamId, onChange, teams, onCreated }: {
  teamId: number | null
  onChange: (id: number | null) => void
  teams: Team[]
  onCreated: (t: Team) => void
}) {
  const { authFetch } = useAuth()
  const [open,     setOpen]     = useState(false)
  const [inputVal, setInputVal] = useState(() => teams.find(t => t.id === teamId)?.name ?? '')
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputVal(teamId ? (teams.find(t => t.id === teamId)?.name ?? '') : '')
  }, [teamId, teams])

  const filtered = (inputVal.trim()
    ? teams.filter(t => t.name.toLowerCase().includes(inputVal.toLowerCase().trim()))
    : teams
  ).slice(0, 8)

  const isNew = inputVal.trim() && !teams.some(t => t.name.toLowerCase() === inputVal.toLowerCase().trim())

  async function createInline() {
    const res = await authFetch('/api/teams', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: inputVal.trim() }),
    })
    const t = await res.json()
    if (res.ok) { onCreated(t); onChange(t.id); setInputVal(t.name) }
    setOpen(false)
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={wrapRef} className="relative flex-1">
      <input type="text" value={inputVal} placeholder="Team…"
        onChange={e => { setInputVal(e.target.value); onChange(null); setOpen(true) }}
        onFocus={() => setOpen(true)}
        className={`${INPUT_SM} pr-8 border-gray-200`} />
      <button type="button" tabIndex={-1}
        onMouseDown={e => { e.preventDefault(); setOpen(v => !v) }}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition">
        <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <button type="button"
            onMouseDown={e => { e.preventDefault(); onChange(null); setInputVal(''); setOpen(false) }}
            className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-50 border-b border-gray-100">
            — no team —
          </button>
          {filtered.map(t => (
            <button key={t.id} type="button"
              onMouseDown={e => { e.preventDefault(); onChange(t.id); setInputVal(t.name); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-50 last:border-0">
              {t.name}
            </button>
          ))}
          {isNew && (
            <button type="button"
              onMouseDown={e => { e.preventDefault(); createInline() }}
              className="w-full text-left px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 font-medium flex items-center gap-1 border-t border-gray-100">
              <Plus className="w-3 h-3" /> Add "{inputVal.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Name autocomplete ─────────────────────────────────────────────────────────

export function NameInput({ value, onChange, congregation, onContactCreated, placeholder, inputClassName, onKeyDown }: {
  value: string
  onChange: (v: string) => void
  congregation: CongMember[]
  onContactCreated: (m: CongMember) => void
  placeholder?: string
  inputClassName?: string
  onKeyDown?: (e: React.KeyboardEvent) => void
}) {
  const [open,    setOpen]    = useState(false)
  const [showNew, setShowNew] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const suggestions = (value.trim()
    ? congregation.filter(m => m.name.toLowerCase().includes(value.toLowerCase().trim()))
    : congregation
  ).slice(0, 6)

  const isNew = value.trim() && !congregation.some(m => m.name.toLowerCase() === value.toLowerCase().trim())

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={wrapRef} className="relative flex-1">
      <input type="text" value={value} placeholder={placeholder ?? 'Name…'}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className={inputClassName ?? `${INPUT_SM} pr-8 border-purple-300 focus:ring-1 focus:ring-purple-100`} />
      <button type="button" tabIndex={-1}
        onMouseDown={e => { e.preventDefault(); setOpen(v => !v) }}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 transition">
        <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {suggestions.map(m => (
            <button key={m.id} type="button"
              onMouseDown={e => { e.preventDefault(); onChange(m.name); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-50 last:border-0">
              {m.name}
            </button>
          ))}
          {isNew && (
            <button type="button"
              onMouseDown={e => { e.preventDefault(); setShowNew(true); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm text-purple-600 bg-purple-50 hover:bg-purple-100 font-medium flex items-center gap-1 border-t border-gray-100">
              <Plus className="w-3 h-3" /> Add "{value.trim()}"
            </button>
          )}
          {!isNew && (
            <button type="button"
              onMouseDown={e => { e.preventDefault(); setShowNew(true); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:bg-gray-50 font-semibold flex items-center gap-1 border-t border-gray-100">
              <Plus className="w-3 h-3" /> New contact…
            </button>
          )}
        </div>
      )}
      {showNew && (
        <NewContactModal
          initialName={value}
          onSave={m => { onContactCreated(m); onChange(m.name); setShowNew(false) }}
          onClose={() => setShowNew(false)}
        />
      )}
    </div>
  )
}

// ── Task / role combobox ──────────────────────────────────────────────────────

export function TaskInput({ value, onChange, tasks, onTaskCreated }: {
  value: string
  onChange: (v: string) => void
  tasks: string[]
  onTaskCreated: (task: string) => void
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const filtered = (value.trim()
    ? tasks.filter(t => t.toLowerCase().includes(value.toLowerCase().trim()))
    : tasks
  ).slice(0, 6)

  const isNew = value.trim() && !tasks.some(t => t.toLowerCase() === value.toLowerCase().trim())

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={wrapRef} className="relative flex-1">
      <input type="text" value={value} placeholder="Task / role…"
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 pr-8 outline-none focus:border-blue-300 bg-white" />
      <button type="button" tabIndex={-1}
        onMouseDown={e => { e.preventDefault(); setOpen(v => !v) }}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition">
        <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {filtered.map((t, i) => (
            <button key={i} type="button"
              onMouseDown={e => { e.preventDefault(); onChange(t); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-50 last:border-0">
              {t}
            </button>
          ))}
          {filtered.length === 0 && !isNew && (
            <div className="px-3 py-2 text-xs text-gray-400 italic">No tasks yet — type to add</div>
          )}
          {isNew && (
            <button type="button"
              onMouseDown={e => { e.preventDefault(); onChange(value.trim()); onTaskCreated(value.trim()); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 font-medium flex items-center gap-1 border-t border-gray-100">
              <Plus className="w-3 h-3" /> Add "{value.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Entry form popup (add / edit) ─────────────────────────────────────────────

export function EntryFormModal({ title, entry, onSave, onClose, shared }: {
  title: string
  entry?: Entry
  onSave: (e: Entry) => void
  onClose: () => void
  shared: FormShared
}) {
  const [eventName, setEventName] = useState(entry?.eventName ?? '')
  const [teamId,    setTeamId]    = useState<number | null>(entry?.teamId ?? null)
  const [persons,   setPersons]   = useState<Person[]>(
    entry?.persons?.length ? entry.persons.map(p => ({ ...p })) : [{ name: '', task: '' }]
  )

  function updatePerson(idx: number, field: keyof Person, value: string) {
    setPersons(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p))
  }
  function removePerson(idx: number) { setPersons(prev => prev.filter((_, i) => i !== idx)) }
  function addPerson()               { setPersons(prev => [...prev, { name: '', task: '' }]) }
  function save()                    { onSave({ eventName, teamId, persons: persons.filter(p => p.name.trim()) }) }

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-5 py-5 overflow-y-auto flex-1">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Event Name</label>
            <EventNameSelect value={eventName} onChange={setEventName}
              eventTypes={shared.eventTypes} onCreated={shared.onEventTypeCreated} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Team</label>
            <TeamSelect teamId={teamId} onChange={setTeamId}
              teams={shared.teams} onCreated={shared.onTeamCreated} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">People</label>
            <div className="flex flex-col gap-2">
              {persons.map((p, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <NameInput value={p.name} onChange={v => updatePerson(i, 'name', v)}
                    congregation={shared.congregation} onContactCreated={shared.onContactCreated}
                    placeholder="Name…"
                    inputClassName="w-full text-sm border border-purple-200 rounded-lg px-3 py-2 pr-8 outline-none focus:border-purple-400 bg-white" />
                  <TaskInput value={p.task} onChange={v => updatePerson(i, 'task', v)}
                    tasks={shared.tasks} onTaskCreated={shared.onTaskCreated} />
                  {persons.length > 1 && (
                    <button onClick={() => removePerson(i)} className="p-1 text-red-300 hover:text-red-500 transition shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addPerson}
              className="mt-2 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-semibold transition">
              <Plus className="w-3 h-3" /> Add person
            </button>
          </div>
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-gray-100 shrink-0">
          <button onClick={save}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition">
            Save
          </button>
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
