import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, Plus, Pencil, Check, X, Trash2, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { RequireAuth, useAuth } from '../../context/AuthContext'

// ── Types ─────────────────────────────────────────────────────────────────────
type Person     = { name: string; task: string }
type Entry      = { eventName: string; teamId?: number | null; persons: Person[] }
type Schedule   = Record<string, Entry[]>
type ViewMode   = '12' | '3'
type CongMember = { id: string; name: string }
type EventType  = { id: number; name: string; recurring: boolean }
type Team       = { id: number; name: string }

// ── Constants ─────────────────────────────────────────────────────────────────
const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']
const MON_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DOW_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const DAY_STYLE = {
  0: { label: 'Sunday',    short: 'Sun', cardBorder: 'border-l-amber-400',  todayBg: 'bg-amber-600'  },
  1: { label: 'Monday',   short: 'Mon', cardBorder: 'border-l-slate-400',  todayBg: 'bg-slate-600'  },
  2: { label: 'Tuesday',  short: 'Tue', cardBorder: 'border-l-rose-400',   todayBg: 'bg-rose-600'   },
  3: { label: 'Wednesday', short: 'Wed', cardBorder: 'border-l-teal-400',   todayBg: 'bg-teal-600'   },
  4: { label: 'Thursday', short: 'Thu', cardBorder: 'border-l-violet-400', todayBg: 'bg-violet-600' },
  5: { label: 'Friday',   short: 'Fri', cardBorder: 'border-l-indigo-400', todayBg: 'bg-indigo-600' },
  6: { label: 'Saturday', short: 'Sat', cardBorder: 'border-l-sky-400',    todayBg: 'bg-sky-600'    },
} as const

const BTN_SAVE   = "flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm md:text-xs font-semibold hover:bg-blue-600 transition"
const BTN_CANCEL = "flex items-center gap-1 px-2 py-1.5 rounded-lg text-gray-400 text-sm md:text-xs hover:text-gray-600 transition"
const INPUT_SM   = "w-full text-base md:text-xs border rounded-lg px-2 py-2 md:py-1.5 outline-none bg-white"

// ── Helpers ───────────────────────────────────────────────────────────────────
function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const EMPTY_ROW = (): { sun: Date|null; mon: Date|null; tue: Date|null; wed: Date|null; thu: Date|null; fri: Date|null; sat: Date|null } =>
  ({ sun: null, mon: null, tue: null, wed: null, thu: null, fri: null, sat: null })
const DOW_KEYS = ['sun','mon','tue','wed','thu','fri','sat'] as const

function getWeekRows(year: number, month: number) {
  const rows: ReturnType<typeof EMPTY_ROW>[] = []
  let cur: ReturnType<typeof EMPTY_ROW> | null = null
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) {
    const dow = d.getDay()
    if (dow === 0) { if (cur) rows.push(cur); cur = EMPTY_ROW() }
    if (!cur) cur = EMPTY_ROW()
    cur[DOW_KEYS[dow]] = new Date(d)
    d.setDate(d.getDate() + 1)
  }
  if (cur) rows.push(cur)
  return rows
}

function get12Months() {
  const now = new Date()
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return <>{text.slice(0, idx)}<mark className="bg-yellow-200 text-yellow-900 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>{text.slice(idx + query.length)}</>
}

// ── Mini modal wrapper ────────────────────────────────────────────────────────
function MiniModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
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
function NewEventTypeModal({ initialName = '', onSave, onClose }: {
  initialName?: string
  onSave: (name: string, recurring: boolean) => Promise<void>
  onClose: () => void
}) {
  const [name, setName]         = useState(initialName)
  const [recurring, setRecurring] = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

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
function NewTeamModal({ onSave, onClose }: {
  onSave: (name: string) => Promise<void>
  onClose: () => void
}) {
  const [name, setName]   = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
function NewContactModal({ initialName = '', onSave, onClose }: {
  initialName?: string
  onSave: (m: CongMember) => void
  onClose: () => void
}) {
  const { authFetch } = useAuth()
  const [name,  setName]  = useState(initialName)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  async function handleSave() {
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    try {
      const res = await authFetch('/api/congregation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), email: email.trim(), photoUrl: '' }),
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
        <input autoFocus type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full name *"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <div className="flex gap-2 mt-1">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition disabled:opacity-50">
            {saving ? 'Saving…' : 'Add Contact'}
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
        </div>
      </div>
    </MiniModal>
  )
}

// ── Event name select (combobox + New event type) ─────────────────────────────
function EventNameSelect({ value, onChange, eventTypes, onCreated }: {
  value: string
  onChange: (name: string) => void
  eventTypes: EventType[]
  onCreated: (et: EventType) => void
}) {
  const { authFetch } = useAuth()
  const [open, setOpen]       = useState(false)
  const [showNew, setShowNew] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const filtered = (value.trim()
    ? eventTypes.filter(et => et.name.toLowerCase().includes(value.toLowerCase()))
    : eventTypes
  ).slice(0, 8)

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
        className={`${INPUT_SM} border-blue-300 focus:ring-1 focus:ring-blue-200`} />
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
          <button type="button"
            onMouseDown={e => { e.preventDefault(); setShowNew(true); setOpen(false) }}
            className="w-full text-left px-3 py-2 text-xs text-blue-500 hover:bg-blue-50 font-semibold flex items-center gap-1 border-t border-gray-100">
            <Plus className="w-3 h-3" /> New event type…
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

// ── Team select ───────────────────────────────────────────────────────────────
function TeamSelect({ teamId, onChange, teams, onCreated }: {
  teamId: number | null
  onChange: (id: number | null) => void
  teams: Team[]
  onCreated: (t: Team) => void
}) {
  const { authFetch } = useAuth()
  const [showNew, setShowNew] = useState(false)

  return (
    <div className="relative flex-1">
      <select value={teamId ?? ''}
        onChange={e => {
          if (e.target.value === '__new__') { setShowNew(true); return }
          onChange(e.target.value ? Number(e.target.value) : null)
        }}
        className={`${INPUT_SM} border-gray-200`}>
        <option value="">Team…</option>
        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        <option value="__new__">+ New team…</option>
      </select>
      {showNew && (
        <NewTeamModal
          onSave={async name => {
            const res = await authFetch('/api/teams', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name }),
            })
            const t = await res.json()
            if (!res.ok) throw new Error(t.error)
            onCreated(t)
            onChange(t.id)
            setShowNew(false)
          }}
          onClose={() => setShowNew(false)}
        />
      )}
    </div>
  )
}

// ── Name autocomplete + New contact ──────────────────────────────────────────
function NameInput({ value, onChange, congregation, onContactCreated, placeholder, inputClassName, onKeyDown }: {
  value: string
  onChange: (v: string) => void
  congregation: CongMember[]
  onContactCreated: (m: CongMember) => void
  placeholder?: string
  inputClassName?: string
  onKeyDown?: (e: React.KeyboardEvent) => void
}) {
  const [open, setOpen]       = useState(false)
  const [showNew, setShowNew] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const suggestions = (value.trim()
    ? congregation.filter(m => m.name.toLowerCase().includes(value.toLowerCase().trim()))
    : congregation
  ).slice(0, 6)

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
        className={inputClassName ?? `${INPUT_SM} border-purple-300 focus:ring-1 focus:ring-purple-100`} />
      {open && (
        <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {suggestions.map(m => (
            <button key={m.id} type="button"
              onMouseDown={e => { e.preventDefault(); onChange(m.name); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-50 last:border-0">
              {m.name}
            </button>
          ))}
          <button type="button"
            onMouseDown={e => { e.preventDefault(); setShowNew(true); setOpen(false) }}
            className="w-full text-left px-3 py-2 text-xs text-blue-500 hover:bg-blue-50 font-semibold flex items-center gap-1 border-t border-gray-100">
            <Plus className="w-3 h-3" /> New contact…
          </button>
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

// ── New entry form ────────────────────────────────────────────────────────────
function NewEntryForm({ onSave, onCancel, congregation, eventTypes, teams, onEventTypeCreated, onTeamCreated, onContactCreated }: {
  onSave: (e: Entry) => void
  onCancel: () => void
  congregation: CongMember[]
  eventTypes: EventType[]
  teams: Team[]
  onEventTypeCreated: (et: EventType) => void
  onTeamCreated: (t: Team) => void
  onContactCreated: (m: CongMember) => void
}) {
  const [eventName, setEventName] = useState('')
  const [teamId,    setTeamId]    = useState<number | null>(null)
  const [name,      setName]      = useState('')
  const [task,      setTask]      = useState('')

  function save() {
    onSave({ eventName, teamId, persons: name.trim() ? [{ name: name.trim(), task: task.trim() }] : [] })
  }
  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter')  save()
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div className="flex flex-col gap-2 py-1">
      <EventNameSelect value={eventName} onChange={setEventName} eventTypes={eventTypes} onCreated={onEventTypeCreated} />
      <TeamSelect teamId={teamId} onChange={setTeamId} teams={teams} onCreated={onTeamCreated} />
      <div className="flex gap-1">
        <NameInput value={name} onChange={setName} congregation={congregation}
          onContactCreated={onContactCreated} placeholder="Name…" onKeyDown={onKey} />
        <input type="text" placeholder="Task/role…" value={task}
          onChange={e => setTask(e.target.value)} onKeyDown={onKey}
          className={`flex-1 ${INPUT_SM} border-gray-200 focus:ring-1 focus:ring-gray-100`} />
      </div>
      <div className="flex gap-2">
        <button onClick={save}     className={BTN_SAVE}><Check className="w-3.5 h-3.5" /> Save</button>
        <button onClick={onCancel} className={BTN_CANCEL}><X className="w-3.5 h-3.5" /> Cancel</button>
      </div>
    </div>
  )
}

// ── Edit entry form ───────────────────────────────────────────────────────────
function EditEntryForm({ entry, onSave, onCancel, congregation, eventTypes, teams, onEventTypeCreated, onTeamCreated, onContactCreated }: {
  entry: Entry
  onSave: (e: Entry) => void
  onCancel: () => void
  congregation: CongMember[]
  eventTypes: EventType[]
  teams: Team[]
  onEventTypeCreated: (et: EventType) => void
  onTeamCreated: (t: Team) => void
  onContactCreated: (m: CongMember) => void
}) {
  const [eventName, setEventName] = useState(entry.eventName)
  const [teamId,    setTeamId]    = useState<number | null>(entry.teamId ?? null)
  const [persons,   setPersons]   = useState<Person[]>(
    entry.persons?.length > 0 ? entry.persons.map(p => ({ ...p })) : [{ name: '', task: '' }]
  )

  function updatePerson(idx: number, field: keyof Person, value: string) {
    setPersons(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p))
  }
  function removePerson(idx: number) { setPersons(prev => prev.filter((_, i) => i !== idx)) }
  function addPerson() { setPersons(prev => [...prev, { name: '', task: '' }]) }
  function save() { onSave({ eventName, teamId, persons: persons.filter(p => p.name.trim()) }) }
  function onKey(e: React.KeyboardEvent) { if (e.key === 'Escape') onCancel() }

  return (
    <div className="flex flex-col gap-2 py-1">
      <EventNameSelect value={eventName} onChange={setEventName} eventTypes={eventTypes} onCreated={onEventTypeCreated} />
      <TeamSelect teamId={teamId} onChange={setTeamId} teams={teams} onCreated={onTeamCreated} />

      {persons.map((p, i) => (
        <div key={i} className="flex gap-1 items-center">
          <NameInput value={p.name} onChange={v => updatePerson(i, 'name', v)}
            congregation={congregation} onContactCreated={onContactCreated}
            placeholder="Name…" onKeyDown={onKey} />
          <input type="text" placeholder="Task/role…" value={p.task}
            onChange={e => updatePerson(i, 'task', e.target.value)} onKeyDown={onKey}
            className={`flex-1 ${INPUT_SM} border-gray-200 focus:ring-1 focus:ring-gray-100`} />
          <button onClick={() => removePerson(i)} className="p-1.5 text-red-300 hover:text-red-500 transition shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      <button onClick={addPerson} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-600 transition w-fit">
        <Plus className="w-3 h-3" /> Add person
      </button>

      <div className="flex gap-2 mt-0.5">
        <button onClick={save}     className={BTN_SAVE}><Check className="w-3.5 h-3.5" /> Save</button>
        <button onClick={onCancel} className={BTN_CANCEL}><X className="w-3.5 h-3.5" /> Cancel</button>
      </div>
    </div>
  )
}

// ── Shared form props ─────────────────────────────────────────────────────────
type FormShared = {
  congregation: CongMember[]
  eventTypes: EventType[]
  teams: Team[]
  onEventTypeCreated: (et: EventType) => void
  onTeamCreated: (t: Team) => void
  onContactCreated: (m: CongMember) => void
}

// ── Day detail modal ──────────────────────────────────────────────────────────
function DayDetailModal({ date, entries, onSave, onClose, shared }: {
  date: Date
  entries: Entry[]
  onSave: (key: string, entries: Entry[]) => void
  onClose: () => void
  shared: FormShared
}) {
  const [editingIdx, setEditingIdx] = useState<number | 'new' | null>(null)

  const key     = dateKey(date)
  const isToday = dateKey(new Date()) === key
  const dow     = date.getDay() as keyof typeof DAY_STYLE
  const ds      = DAY_STYLE[dow]

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function saveEntry(idx: number | 'new', updated: Entry) {
    let next: Entry[]
    if (idx === 'new') {
      const matchIdx = updated.eventName.trim()
        ? entries.findIndex(e => e.eventName.trim().toLowerCase() === updated.eventName.trim().toLowerCase())
        : -1
      if (matchIdx !== -1) {
        next = entries.map((e, i) => {
          if (i !== matchIdx) return e
          const existingNames = e.persons.map(p => p.name.toLowerCase().trim())
          const newPersons = updated.persons.filter(p => !existingNames.includes(p.name.toLowerCase().trim()))
          return { ...e, persons: [...e.persons, ...newPersons] }
        })
      } else {
        next = [...entries, updated]
      }
    } else {
      next = entries.map((e, i) => i === idx ? updated : e)
    }
    onSave(key, next)
    setEditingIdx(null)
  }

  function deleteEntry(idx: number) { onSave(key, entries.filter((_, i) => i !== idx)) }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full md:w-1/2 max-h-[60vh] mx-4 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-purple-200 border-b border-gray-300 shrink-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-500 text-white' : 'text-gray-900'}`}>{date.getDate()}</span>
            <span className="font-bold text-gray-900">{ds.label}</span>
            <span className="text-gray-500 text-sm">{MONTH_NAMES[date.getMonth()]} {date.getFullYear()}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:bg-purple-300 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {entries.map((entry, idx) => (
            <div key={idx}>
              {editingIdx === idx ? (
                <EditEntryForm entry={entry} {...shared}
                  onSave={e => saveEntry(idx, e)} onCancel={() => setEditingIdx(null)} />
              ) : (
                <div className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    {entry.eventName && <span className="text-sm font-semibold text-gray-800">{entry.eventName}</span>}
                    {entry.teamId && shared.teams.find(t => t.id === entry.teamId) && (
                      <span className="text-xs bg-blue-100 text-blue-600 rounded-full px-2 py-0.5">
                        {shared.teams.find(t => t.id === entry.teamId)!.name}
                      </span>
                    )}
                  </div>
                  {entry.persons?.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {entry.persons.map((p, pi) => (
                        <span key={pi} className="block w-full text-sm bg-purple-100 text-purple-700 font-medium rounded px-2.5 py-1">
                          {p.name}{p.task ? <span className="text-purple-400"> · {p.task}</span> : null}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-end gap-0.5 mt-2">
                    <button onClick={() => setEditingIdx(idx)}
                      className="p-1.5 rounded text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition" title="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteEntry(idx)}
                      className="p-1.5 rounded text-red-300 hover:text-red-500 hover:bg-red-50 transition" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {editingIdx === 'new' ? (
            <NewEntryForm {...shared}
              onSave={e => saveEntry('new', e)} onCancel={() => setEditingIdx(null)} />
          ) : (
            <button onClick={() => setEditingIdx('new')}
              className="flex items-center justify-center gap-1 w-full px-2.5 py-1 rounded-lg bg-blue-50 text-blue-400 hover:bg-blue-100 hover:text-blue-600 transition-colors text-xs font-semibold">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Day Cell ──────────────────────────────────────────────────────────────────
const COLLAPSE_AT = 2

function DayCell({ date, entries, onSave, saving, asTd = true, shared }: {
  date: Date
  entries: Entry[]
  onSave: (key: string, entries: Entry[]) => void
  saving: boolean
  asTd?: boolean
  shared: FormShared
}) {
  const [editingIdx, setEditingIdx] = useState<number | 'new' | null>(null)
  const [expanded,   setExpanded]   = useState(false)
  const [showModal,  setShowModal]  = useState(false)

  const key     = dateKey(date)
  const isToday = dateKey(new Date()) === key
  const dow     = date.getDay() as keyof typeof DAY_STYLE
  const ds      = DAY_STYLE[dow]

  function saveEntry(idx: number | 'new', updated: Entry) {
    let next: Entry[]
    if (idx === 'new') {
      const matchIdx = updated.eventName.trim()
        ? entries.findIndex(e => e.eventName.trim().toLowerCase() === updated.eventName.trim().toLowerCase())
        : -1
      if (matchIdx !== -1) {
        next = entries.map((e, i) => {
          if (i !== matchIdx) return e
          const existingNames = e.persons.map(p => p.name.toLowerCase().trim())
          const newPersons = updated.persons.filter(p => !existingNames.includes(p.name.toLowerCase().trim()))
          return { ...e, persons: [...e.persons, ...newPersons] }
        })
      } else {
        next = [...entries, updated]
      }
    } else {
      next = entries.map((e, i) => i === idx ? updated : e)
    }
    onSave(key, next)
    setEditingIdx(null)
  }

  function deleteEntry(idx: number) { onSave(key, entries.filter((_, i) => i !== idx)) }

  const dateHeader = (
    <button onClick={() => setShowModal(true)}
      className="flex items-center justify-center gap-1 w-full px-2 py-1 border-b bg-purple-200 border-gray-300 hover:bg-purple-300 transition-colors">
      <span className="text-xs font-bold text-gray-900">{ds.short}</span>
      <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full leading-none ${isToday ? 'bg-blue-500 text-white' : 'text-gray-900'}`}>
        {date.getDate()}
      </span>
      {saving && <Loader2 className="w-2.5 h-2.5 animate-spin text-gray-300 shrink-0" />}
    </button>
  )

  const bodyContent = (
    <div className="p-0 flex flex-col gap-1.5">
      {(expanded ? entries : entries.slice(0, COLLAPSE_AT)).map((entry, idx) => (
        <div key={idx}>
          {editingIdx === idx ? (
            <EditEntryForm entry={entry} {...shared}
              onSave={e => saveEntry(idx, e)} onCancel={() => setEditingIdx(null)} />
          ) : (
            <div className="bg-gray-50 rounded-lg px-2 py-1.5">
              <div className="flex items-center gap-1 flex-wrap">
                {entry.eventName && <div className="text-xs font-semibold text-gray-800 truncate">{entry.eventName}</div>}
                {entry.teamId && shared.teams.find(t => t.id === entry.teamId) && (
                  <span className="text-xs bg-blue-100 text-blue-600 rounded-full px-1.5 shrink-0">
                    {shared.teams.find(t => t.id === entry.teamId)!.name}
                  </span>
                )}
              </div>
              {entry.persons?.length > 0 && (
                <div className="flex flex-col gap-0.5 mt-0.5">
                  {entry.persons.map((p, pi) => (
                    <span key={pi} className="block w-full text-xs bg-purple-100 text-purple-700 font-medium rounded px-2 py-0.5 truncate">
                      {p.name}{p.task ? <span className="text-purple-400"> · {p.task}</span> : null}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-0.5 mt-1">
                <button onClick={() => setEditingIdx(idx)}
                  className="p-1 rounded text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition" title="Edit">
                  <Pencil className="w-3 h-3" />
                </button>
                <button onClick={() => deleteEntry(idx)}
                  className="p-1 rounded text-red-300 hover:text-red-500 hover:bg-red-50 transition" title="Delete">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      {entries.length > COLLAPSE_AT && (
        <button onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-blue-500 transition-colors">
          {expanded ? <><ChevronUp className="w-3 h-3" /> less</> : <><ChevronDown className="w-3 h-3" /> +{entries.length - COLLAPSE_AT} more</>}
        </button>
      )}
      {editingIdx === 'new' ? (
        <NewEntryForm {...shared}
          onSave={e => saveEntry('new', e)} onCancel={() => setEditingIdx(null)} />
      ) : editingIdx === null ? (
        <button onClick={() => setEditingIdx('new')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-400 hover:bg-blue-100 hover:text-blue-600 transition-colors text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      ) : null}
    </div>
  )

  const modal = showModal && (
    <DayDetailModal date={date} entries={entries} onSave={onSave}
      shared={shared} onClose={() => setShowModal(false)} />
  )

  if (!asTd) {
    return (
      <>
        <div className={`overflow-hidden rounded-xl border border-gray-200 border-l-4 ${ds.cardBorder} bg-white shadow-sm`}>
          {dateHeader}{bodyContent}
        </div>
        {modal}
      </>
    )
  }

  return (
    <>
      <td className="border-l border-t border-gray-300 first:border-l-0 align-top p-0">
        {dateHeader}{bodyContent}
      </td>
      {modal}
    </>
  )
}

// ── Calendar content ──────────────────────────────────────────────────────────
function CalendarContent() {
  const { authFetch } = useAuth()
  const [schedule,     setSchedule]     = useState<Schedule>({})
  const [congregation, setCongregation] = useState<CongMember[]>([])
  const [eventTypes,   setEventTypes]   = useState<EventType[]>([])
  const [teams,        setTeams]        = useState<Team[]>([])
  const [loading,      setLoading]      = useState(true)
  const [savingKeys,   setSavingKeys]   = useState<Set<string>>(new Set())
  const [activeMonth,  setActiveMonth]  = useState(0)
  const [viewMode,     setViewMode]     = useState<ViewMode>('12')
  const [monthOffset,  setMonthOffset]  = useState(0)
  const [searchQuery,  setSearchQuery]  = useState('')

  const monthRefs = useRef<(HTMLDivElement | null)[]>([])
  const pillRefs  = useRef<(HTMLButtonElement | null)[]>([])
  const searchRef = useRef<HTMLInputElement>(null)

  const months       = get12Months()
  const firstYear    = months[0].year
  const visibleMonths = viewMode === '3' ? months.slice(monthOffset, monthOffset + 3) : months

  useEffect(() => {
    Promise.all([
      authFetch('/api/schedule').then(r => r.json()),
      authFetch('/api/congregation/names').then(r => r.ok ? r.json() : []).catch(() => []),
      authFetch('/api/event-types').then(r => r.ok ? r.json() : []).catch(() => []),
      authFetch('/api/teams').then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([sched, cong, ets, tms]) => {
      setSchedule(sched)
      setCongregation(Array.isArray(cong) ? cong : [])
      setEventTypes(Array.isArray(ets) ? ets : [])
      setTeams(Array.isArray(tms) ? tms : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (loading || viewMode !== '12') return
    function onScroll() {
      let active = 0
      monthRefs.current.forEach((el, idx) => {
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) active = idx
      })
      setActiveMonth(active)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [loading, viewMode])

  useEffect(() => {
    const idx = viewMode === '3' ? monthOffset : activeMonth
    pillRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeMonth, monthOffset, viewMode])

  function handleSetViewMode(mode: ViewMode) {
    setSearchQuery('')
    setViewMode(mode)
    if (mode === '3') setMonthOffset(Math.min(activeMonth, months.length - 3))
    if (mode === '12') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function scrollToMonth(idx: number) {
    if (viewMode === '3') {
      setMonthOffset(Math.min(idx, months.length - 3))
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const el = monthRefs.current[idx]
    if (!el) return
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 160, behavior: 'smooth' })
  }

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null
    const q = searchQuery.trim().toLowerCase()
    const allDates: Date[] = months.flatMap(({ year, month }) =>
      getWeekRows(year, month).flatMap(row =>
        [row.sun, row.mon, row.tue, row.wed, row.thu, row.fri, row.sat].filter((d): d is Date => d !== null)
      )
    )
    return allDates.map(date => {
      const key = dateKey(date)
      const matched = (schedule[key] ?? []).filter(e =>
        e.eventName.toLowerCase().includes(q) ||
        e.persons?.some(p => p.name.toLowerCase().includes(q) || p.task.toLowerCase().includes(q))
      )
      return { date, key, matched }
    }).filter(r => r.matched.length > 0)
  }, [searchQuery, schedule])

  async function handleSave(key: string, entries: Entry[]) {
    setSchedule(prev => {
      const next = { ...prev }
      if (entries.length === 0) delete next[key]
      else next[key] = entries
      return next
    })
    setSavingKeys(s => new Set(s).add(key))
    try {
      await authFetch(`/api/schedule/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      })
    } finally {
      setSavingKeys(s => { const n = new Set(s); n.delete(key); return n })
    }
  }

  const shared: FormShared = {
    congregation,
    eventTypes,
    teams,
    onEventTypeCreated: et => setEventTypes(prev => [...prev, et].sort((a, b) => a.name.localeCompare(b.name))),
    onTeamCreated:      t  => setTeams(prev => [...prev, t].sort((a, b) => a.name.localeCompare(b.name))),
    onContactCreated:   m  => setCongregation(prev => [...prev, m].sort((a, b) => a.name.localeCompare(b.name))),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading schedule…
      </div>
    )
  }

  return (
    <>
      {/* Sticky nav */}
      <div className="sticky top-16 z-40 -mx-4 px-4 bg-white/95 backdrop-blur-sm border-b border-gray-100 mb-6">
        <div className="flex items-center gap-2 pt-2 pb-1.5">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold shrink-0">
            <button onClick={() => handleSetViewMode('12')}
              className={`px-2.5 py-1.5 transition-colors ${viewMode === '12' ? 'bg-orange-400 text-white' : 'text-gray-500 hover:bg-orange-50'}`}>
              12 Mo
            </button>
            <button onClick={() => handleSetViewMode('3')}
              className={`px-2.5 py-1.5 border-l border-gray-200 transition-colors whitespace-nowrap ${viewMode === '3' ? 'bg-orange-400 text-white' : 'text-gray-500 hover:bg-orange-50'}`}>
              3 Mo Glance
            </button>
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input ref={searchRef} type="text" placeholder="Search events, names or tasks…"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 bg-white" />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); searchRef.current?.focus() }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
          {months.map(({ year, month }, idx) => {
            const label     = year !== firstYear ? `${MON_SHORT[month]} '${String(year).slice(2)}` : MON_SHORT[month]
            const isPrimary = viewMode === '3' ? idx === monthOffset : activeMonth === idx
            const isInView  = viewMode === '3' && idx > monthOffset && idx < monthOffset + 3
            return (
              <button key={idx} ref={el => { pillRefs.current[idx] = el }}
                onClick={() => scrollToMonth(idx)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  isPrimary ? 'bg-orange-400 text-white shadow-sm'
                  : isInView  ? 'bg-orange-400 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-orange-200 hover:text-orange-500'
                }`}>
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Search results */}
      {searchResults ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-500">
            {searchResults.length === 0
              ? <span>No results for <strong>"{searchQuery}"</strong></span>
              : <span><strong>{searchResults.length}</strong> date{searchResults.length !== 1 ? 's' : ''} matching <strong>"{searchQuery}"</strong></span>}
          </p>
          {searchResults.map(({ date, matched }) => (
            <div key={dateKey(date)} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-700">
                  {DOW_SHORT[date.getDay()]}, {MONTH_NAMES[date.getMonth()]} {date.getDate()}, {date.getFullYear()}
                </span>
                <button onClick={() => {
                  setSearchQuery('')
                  const mIdx = months.findIndex(m => m.year === date.getFullYear() && m.month === date.getMonth())
                  if (mIdx === -1) return
                  if (viewMode === '3') { setMonthOffset(Math.min(mIdx, months.length - 3)); window.scrollTo({ top: 0, behavior: 'smooth' }) }
                  else setTimeout(() => scrollToMonth(mIdx), 50)
                }} className="text-xs text-blue-500 hover:text-blue-700 font-semibold transition">
                  View in calendar →
                </button>
              </div>
              <div className="px-3 py-2 flex flex-col gap-2">
                {matched.map((e, i) => (
                  <div key={i}>
                    {e.eventName && <div className="text-xs font-semibold text-gray-800">{highlight(e.eventName, searchQuery)}</div>}
                    {e.persons?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {e.persons.map((p, pi) => (
                          <span key={pi} className="text-xs bg-purple-100 text-purple-700 font-medium rounded-full px-2 py-0.5">
                            {highlight(p.name, searchQuery)}
                            {p.task ? <span className="text-purple-400"> · {highlight(p.task, searchQuery)}</span> : null}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {visibleMonths.map(({ year, month }) => {
            const origIdx = months.findIndex(m => m.year === year && m.month === month)
            const rows    = getWeekRows(year, month)
            return (
              <div key={`${year}-${month}`} ref={el => { monthRefs.current[origIdx] = el }}>
                <h2 className="text-base font-bold text-gray-700 text-center mb-2">{MONTH_NAMES[month]} {year}</h2>

                {/* Mobile */}
                <div className="md:hidden flex flex-col gap-5">
                  {rows.map((row, wi) => {
                    const days = [row.sun, row.mon, row.tue, row.wed, row.thu, row.fri, row.sat]
                    if (!days.some(Boolean)) return null
                    return (
                      <div key={wi} className="flex flex-col gap-2">
                        {days.map((date, di) => date ? (
                          <DayCell key={di} date={date} entries={schedule[dateKey(date)] ?? []}
                            onSave={handleSave} saving={savingKeys.has(dateKey(date))}
                            shared={shared} asTd={false} />
                        ) : null)}
                      </div>
                    )
                  })}
                </div>

                {/* Desktop */}
                <div className="hidden md:block rounded-2xl border border-gray-700 shadow-sm overflow-hidden">
                  <table className="w-full table-fixed text-sm border-collapse">
                    <tbody>
                      {rows.map((row, wi) => {
                        const days = [row.sun, row.mon, row.tue, row.wed, row.thu, row.fri, row.sat]
                        return (
                          <tr key={wi} className="bg-white">
                            {days.map((date, di) => date
                              ? <DayCell key={di} date={date} entries={schedule[dateKey(date)] ?? []}
                                  onSave={handleSave} saving={savingKeys.has(dateKey(date))} shared={shared} />
                              : <td key={di} className="border-l border-t border-gray-300 first:border-l-0" />
                            )}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ScheduleCalendar() {
  return (
    <RequireAuth role="calendar">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">CoWorker Calendar</h1>
          <p className="text-gray-500 text-sm mt-1">Fri, Sat & Sun · tap <strong>+</strong> to add an entry</p>
        </div>
        <CalendarContent />
      </div>
    </RequireAuth>
  )
}
