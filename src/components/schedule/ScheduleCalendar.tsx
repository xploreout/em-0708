import { useState, useEffect, useRef } from 'react'
import { Loader2, Plus, Pencil, Check, X, Trash2 } from 'lucide-react'
import { RequireAuth, useAuth } from '../../context/AuthContext'

type Entry   = { eventName: string; personOnDuty: string }
type Schedule = Record<string, Entry[]>

interface WeekRow { fri: Date | null; sat: Date | null; sun: Date | null }

const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']
const MON_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function getWeekRows(year: number, month: number): WeekRow[] {
  const rows: WeekRow[] = []
  let cur: WeekRow | null = null
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) {
    const dow = d.getDay()
    if (dow === 5) {
      cur = { fri: new Date(d), sat: null, sun: null }
    } else if (dow === 6) {
      if (!cur) cur = { fri: null, sat: new Date(d), sun: null }
      else cur.sat = new Date(d)
    } else if (dow === 0) {
      if (!cur) cur = { fri: null, sat: null, sun: new Date(d) }
      else cur.sun = new Date(d)
      rows.push(cur); cur = null
    }
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

const BTN_SAVE   = "flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm md:text-xs font-semibold hover:bg-blue-600 transition"
const BTN_CANCEL = "flex items-center gap-1 px-2 py-1.5 rounded-lg text-gray-400 text-sm md:text-xs hover:text-gray-600 transition"
const INPUT_SM   = "w-full text-base md:text-xs border rounded-lg px-2 py-2 md:py-1.5 outline-none bg-white"

// ── New entry form ────────────────────────────────────────────────────────────

function NewEntryForm({ onSave, onCancel, eventRef }: {
  onSave: (e: Entry) => void
  onCancel: () => void
  eventRef?: React.RefObject<HTMLInputElement>
}) {
  const [eventName,    setEventName] = useState('')
  const [personOnDuty, setPerson]    = useState('')

  function save() { onSave({ eventName, personOnDuty }) }
  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter')  save()
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div className="flex flex-col gap-2 py-1">
      <input ref={eventRef} type="text" placeholder="Event name…" value={eventName}
        onChange={e => setEventName(e.target.value)} onKeyDown={onKey}
        className={`${INPUT_SM} border-blue-300 focus:ring-1 focus:ring-blue-200`} />
      <input type="text" placeholder="Co-worker name…" value={personOnDuty}
        onChange={e => setPerson(e.target.value)} onKeyDown={onKey}
        className={`${INPUT_SM} border-purple-300 focus:ring-1 focus:ring-purple-100`} />
      <div className="flex gap-2">
        <button onClick={save}     className={BTN_SAVE}><Check className="w-3.5 h-3.5" /> Save</button>
        <button onClick={onCancel} className={BTN_CANCEL}><X className="w-3.5 h-3.5" /> Cancel</button>
      </div>
    </div>
  )
}

// ── Edit entry form ───────────────────────────────────────────────────────────

function EditEntryForm({ entry, onSave, onCancel }: {
  entry: Entry
  onSave: (e: Entry) => void
  onCancel: () => void
}) {
  const [eventName, setEventName] = useState(entry.eventName)
  const [persons,   setPersons]   = useState(
    entry.personOnDuty.split(',').map(p => p.trim()).filter(Boolean)
  )
  const [newPerson, setNewPerson] = useState('')
  const addRef = useRef<HTMLInputElement>(null)

  function removePerson(idx: number) { setPersons(p => p.filter((_, i) => i !== idx)) }
  function addPerson() {
    const name = newPerson.trim()
    if (name && !persons.includes(name)) { setPersons(p => [...p, name]); setNewPerson('') }
  }
  function save() { onSave({ eventName, personOnDuty: persons.join(', ') }) }
  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter')  { if (newPerson.trim()) addPerson(); else save() }
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div className="flex flex-col gap-2 py-1">
      <input type="text" value={eventName} onChange={e => setEventName(e.target.value)}
        onKeyDown={onKey} className={`${INPUT_SM} border-blue-300 focus:ring-1 focus:ring-blue-200`} />
      {persons.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {persons.map((p, i) => (
            <span key={i} className="flex items-center gap-0.5 text-xs bg-purple-100 text-purple-700 font-medium rounded-full px-2 py-0.5">
              {p}
              <button onClick={() => removePerson(i)} className="ml-0.5 hover:text-red-500 transition leading-none">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      <input ref={addRef} type="text" placeholder="Add person…" value={newPerson}
        onChange={e => setNewPerson(e.target.value)} onKeyDown={onKey}
        className={`${INPUT_SM} border-purple-300 focus:ring-1 focus:ring-purple-100`} />
      <div className="flex gap-2">
        <button onClick={save}     className={BTN_SAVE}><Check className="w-3.5 h-3.5" /> Save</button>
        <button onClick={onCancel} className={BTN_CANCEL}><X className="w-3.5 h-3.5" /> Cancel</button>
      </div>
    </div>
  )
}

// ── Day Cell / Card ───────────────────────────────────────────────────────────

function DayCell({ date, entries, onSave, saving, asTd = true }: {
  date: Date
  entries: Entry[]
  onSave: (key: string, entries: Entry[]) => void
  saving: boolean
  asTd?: boolean
}) {
  const [editingIdx, setEditingIdx] = useState<number | 'new' | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const key       = dateKey(date)
  const isToday   = dateKey(new Date()) === key
  const isSunday  = date.getDay() === 0
  const dateLabel = `${MON_SHORT[date.getMonth()]} ${date.getDate()}`

  useEffect(() => {
    if (editingIdx !== null) setTimeout(() => inputRef.current?.focus(), 0)
  }, [editingIdx])

  function saveEntry(idx: number | 'new', updated: Entry) {
    let next: Entry[]
    if (idx === 'new') {
      const matchIdx = updated.eventName.trim()
        ? entries.findIndex(e =>
            e.eventName.trim().toLowerCase() === updated.eventName.trim().toLowerCase())
        : -1
      if (matchIdx !== -1) {
        next = entries.map((e, i) => {
          if (i !== matchIdx) return e
          const existing = e.personOnDuty.split(',').map(p => p.trim()).filter(Boolean)
          const incoming = updated.personOnDuty.trim()
          const merged   = incoming && !existing.includes(incoming) ? [...existing, incoming] : existing
          return { ...e, personOnDuty: merged.join(', ') }
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

  function deleteEntry(idx: number) {
    onSave(key, entries.filter((_, i) => i !== idx))
  }

  const cellContent = (
    <>
      <div className="flex items-center justify-center gap-1.5 -mx-3 px-3 py-1.5 mb-2 bg-gray-100/80 border-b border-gray-200/60">
        <span className={`text-xs font-bold whitespace-nowrap px-2 py-0.5 rounded-full ${
          isToday ? 'bg-blue-500 text-white' : 'text-gray-500'
        }`}>
          {dateLabel}
        </span>
        {saving && <Loader2 className="w-3 h-3 animate-spin text-gray-300 shrink-0" />}
      </div>

      {isSunday && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 mb-2">
          <span>⛪</span> Sunday Worship
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        {entries.map((entry, idx) => (
          <div key={idx}>
            {editingIdx === idx ? (
              <EditEntryForm entry={entry} onSave={e => saveEntry(idx, e)} onCancel={() => setEditingIdx(null)} />
            ) : (
              <div className="flex items-start gap-1.5 bg-gray-50 rounded-lg px-2 py-2">
                <div className="flex-1 min-w-0">
                  {entry.eventName && <div className="text-xs font-semibold text-gray-800 truncate">{entry.eventName}</div>}
                  {entry.personOnDuty && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {entry.personOnDuty.split(',').map(p => p.trim()).filter(Boolean).map((p, pi) => (
                        <span key={pi} className="text-xs bg-purple-100 text-purple-700 font-medium rounded-full px-2 py-0.5">{p}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setEditingIdx(idx)}
                    className="p-1.5 rounded-md text-blue-400 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteEntry(idx)}
                    className="p-1.5 rounded-md text-red-300 hover:text-red-500 hover:bg-red-50 active:bg-red-100 transition" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {editingIdx === 'new' ? (
        <div className="mt-2">
          <NewEntryForm eventRef={inputRef} onSave={e => saveEntry('new', e)} onCancel={() => setEditingIdx(null)} />
        </div>
      ) : editingIdx === null ? (
        <button onClick={() => setEditingIdx('new')}
          className="flex items-center gap-0.5 mt-2 p-1 text-gray-300 hover:text-blue-400 active:text-blue-500 transition-colors" title="Add entry">
          <Plus className="w-4 h-4" />
        </button>
      ) : null}
    </>
  )

  if (!asTd) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-3 py-2">{cellContent}</div>
      </div>
    )
  }
  return (
    <td className="px-3 py-3 border-l border-gray-100 align-top min-w-[200px]">
      {cellContent}
    </td>
  )
}

// ── Calendar content ──────────────────────────────────────────────────────────

function CalendarContent() {
  const { authFetch } = useAuth()
  const [schedule,    setSchedule]   = useState<Schedule>({})
  const [loading,     setLoading]    = useState(true)
  const [savingKeys,  setSavingKeys] = useState<Set<string>>(new Set())
  const [activeMonth, setActiveMonth] = useState(0)

  const monthRefs = useRef<(HTMLDivElement | null)[]>([])
  const pillRefs  = useRef<(HTMLButtonElement | null)[]>([])

  const months = get12Months()
  const firstYear = months[0].year

  useEffect(() => {
    authFetch('/api/schedule')
      .then(r => r.json())
      .then(data => { setSchedule(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Highlight the month pill whose section top is highest on screen
  useEffect(() => {
    if (loading) return
    function onScroll() {
      let active = 0
      monthRefs.current.forEach((el, idx) => {
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) active = idx
      })
      setActiveMonth(active)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // set initial active
    return () => window.removeEventListener('scroll', onScroll)
  }, [loading])

  // Keep the active pill visible in the pill bar
  useEffect(() => {
    pillRefs.current[activeMonth]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeMonth])

  function scrollToMonth(idx: number) {
    const el = monthRefs.current[idx]
    if (!el) return
    // Offset = sticky header (~64px) + sticky month nav (~48px) + gap
    const offset = 120
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading schedule…
      </div>
    )
  }

  return (
    <>
      {/* ── Sticky month pill nav ── */}
      <div className="sticky top-16 z-40 -mx-4 px-4 py-2 bg-white/95 backdrop-blur-sm border-b border-gray-100 mb-6">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
          {months.map(({ year, month }, idx) => {
            const label = year !== firstYear
              ? `${MON_SHORT[month]} '${String(year).slice(2)}`
              : MON_SHORT[month]
            return (
              <button
                key={idx}
                ref={el => { pillRefs.current[idx] = el }}
                onClick={() => scrollToMonth(idx)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  activeMonth === idx
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Month sections — one shared wrapper per month for both mobile & desktop ── */}
      <div className="flex flex-col gap-10">
        {months.map(({ year, month }, idx) => {
          const rows = getWeekRows(year, month)
          return (
            <div key={`${year}-${month}`} ref={el => { monthRefs.current[idx] = el }}>
              {/* Month heading */}
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-base font-bold text-gray-700 whitespace-nowrap">
                  {MONTH_NAMES[month]} {year}
                </h2>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Mobile: vertical day cards */}
              <div className="md:hidden flex flex-col gap-5">
                {rows.map((row, wi) => {
                  const days = [row.fri, row.sat, row.sun]
                  if (!days.some(Boolean)) return null
                  return (
                    <div key={wi}>
                      <div className="text-xs font-semibold text-gray-400 mb-2 px-0.5">Week {wi + 1}</div>
                      <div className="flex flex-col gap-2">
                        {days.map((date, di) =>
                          date ? (
                            <DayCell key={di} date={date}
                              entries={schedule[dateKey(date)] ?? []}
                              onSave={handleSave} saving={savingKeys.has(dateKey(date))}
                              asTd={false} />
                          ) : null
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop: 3-column table */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                <table className="min-w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-blue-50 text-blue-700 text-xs border-b border-blue-100">
                      <th className="px-3 py-2.5 text-left font-semibold w-10">#</th>
                      <th className="px-4 py-2.5 text-center font-semibold">Friday</th>
                      <th className="px-4 py-2.5 text-center font-semibold">Saturday</th>
                      <th className="px-4 py-2.5 text-center font-semibold">Sunday</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, wi) => {
                      const days = [row.fri, row.sat, row.sun]
                      return (
                        <tr key={wi} className={wi % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'}>
                          <td className="px-3 py-3 text-gray-300 font-bold text-xs align-top pt-4">{wi + 1}</td>
                          {days.map((date, di) =>
                            date
                              ? <DayCell key={di} date={date}
                                  entries={schedule[dateKey(date)] ?? []}
                                  onSave={handleSave} saving={savingKeys.has(dateKey(date))} />
                              : <td key={di} className="px-3 py-3 border-l border-gray-100" />
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
          <p className="text-gray-500 text-sm mt-1">
            12-month rolling view · Fri, Sat & Sun · tap <strong>+</strong> to add an entry
          </p>
        </div>
        <CalendarContent />
      </div>
    </RequireAuth>
  )
}
