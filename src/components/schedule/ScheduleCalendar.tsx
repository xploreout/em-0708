import { useState, useEffect, useRef, useMemo } from 'react'
import { Loader2, Plus, Pencil, Check, X, Trash2, Search } from 'lucide-react'
import { RequireAuth, useAuth } from '../../context/AuthContext'

type Entry   = { eventName: string; personOnDuty: string }
type Schedule = Record<string, Entry[]>
type ViewMode = '12' | '3'

interface WeekRow { fri: Date | null; sat: Date | null; sun: Date | null }

const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']
const MON_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DOW_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

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

// Wrap matched substring in a yellow highlight
function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text
  const q = query.toLowerCase()
  const idx = text.toLowerCase().indexOf(q)
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-yellow-900 rounded px-0.5 not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
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
        }`}>{dateLabel}</span>
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
  const [viewMode,    setViewMode]   = useState<ViewMode>('12')
  const [monthOffset, setMonthOffset] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const monthRefs = useRef<(HTMLDivElement | null)[]>([])
  const pillRefs  = useRef<(HTMLButtonElement | null)[]>([])
  const searchRef = useRef<HTMLInputElement>(null)

  const months    = get12Months()
  const firstYear = months[0].year

  const visibleMonths = viewMode === '3'
    ? months.slice(monthOffset, monthOffset + 3)
    : months

  useEffect(() => {
    authFetch('/api/schedule')
      .then(r => r.json())
      .then(data => { setSchedule(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Track active month pill via scroll (12-month mode only)
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

  // Keep active pill scrolled into view in the pill bar
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
    const offset = 160 // sticky header + nav height
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' })
  }

  // Search across all 12 months of schedule data
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null
    const q = searchQuery.trim().toLowerCase()
    const allDates: Date[] = months.flatMap(({ year, month }) =>
      getWeekRows(year, month).flatMap(row =>
        [row.fri, row.sat, row.sun].filter((d): d is Date => d !== null)
      )
    )
    return allDates
      .map(date => {
        const key = dateKey(date)
        const matched = (schedule[key] ?? []).filter(e =>
          e.eventName.toLowerCase().includes(q) ||
          e.personOnDuty.toLowerCase().includes(q)
        )
        return { date, key, matched }
      })
      .filter(r => r.matched.length > 0)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading schedule…
      </div>
    )
  }

  return (
    <>
      {/* ── Sticky nav: toolbar + month pills ── */}
      <div className="sticky top-16 z-40 -mx-4 px-4 bg-white/95 backdrop-blur-sm border-b border-gray-100 mb-6">

        {/* Toolbar row */}
        <div className="flex items-center gap-2 pt-2 pb-1.5">
          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold shrink-0">
            <button
              onClick={() => handleSetViewMode('12')}
              className={`px-2.5 py-1.5 transition-colors ${
                viewMode === '12' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              12 Mo
            </button>
            <button
              onClick={() => handleSetViewMode('3')}
              className={`px-2.5 py-1.5 border-l border-gray-200 transition-colors whitespace-nowrap ${
                viewMode === '3' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              3 Mo Glance
            </button>
          </div>

          {/* Search input */}
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search events or names…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); searchRef.current?.focus() }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Month pills */}
        <div
          className="flex gap-1.5 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        >
          {months.map(({ year, month }, idx) => {
            const label    = year !== firstYear ? `${MON_SHORT[month]} '${String(year).slice(2)}` : MON_SHORT[month]
            const isPrimary = viewMode === '3' ? idx === monthOffset : activeMonth === idx
            const isInView  = viewMode === '3' && idx > monthOffset && idx < monthOffset + 3
            return (
              <button
                key={idx}
                ref={el => { pillRefs.current[idx] = el }}
                onClick={() => scrollToMonth(idx)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  isPrimary ? 'bg-blue-500 text-white shadow-sm'
                  : isInView  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Search results view ── */}
      {searchResults ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-500">
            {searchResults.length === 0
              ? <span>No results for <strong>"{searchQuery}"</strong></span>
              : <span><strong>{searchResults.length}</strong> date{searchResults.length !== 1 ? 's' : ''} matching <strong>"{searchQuery}"</strong></span>
            }
          </p>
          {searchResults.map(({ date, matched }) => (
            <div key={dateKey(date)} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              {/* Date header */}
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-700">
                  {DOW_SHORT[date.getDay()]}, {MONTH_NAMES[date.getMonth()]} {date.getDate()}, {date.getFullYear()}
                </span>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    const mIdx = months.findIndex(m => m.year === date.getFullYear() && m.month === date.getMonth())
                    if (mIdx === -1) return
                    if (viewMode === '3') {
                      setMonthOffset(Math.min(mIdx, months.length - 3))
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    } else {
                      setTimeout(() => scrollToMonth(mIdx), 50)
                    }
                  }}
                  className="text-xs text-blue-500 hover:text-blue-700 font-semibold transition"
                >
                  View in calendar →
                </button>
              </div>
              {/* Matching entries */}
              <div className="px-3 py-2 flex flex-col gap-2">
                {matched.map((e, i) => (
                  <div key={i}>
                    {e.eventName && (
                      <div className="text-xs font-semibold text-gray-800">
                        {highlight(e.eventName, searchQuery)}
                      </div>
                    )}
                    {e.personOnDuty && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {e.personOnDuty.split(',').map(p => p.trim()).filter(Boolean).map((p, pi) => (
                          <span key={pi} className="text-xs bg-purple-100 text-purple-700 font-medium rounded-full px-2 py-0.5">
                            {highlight(p, searchQuery)}
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
        /* ── Calendar view ── */
        <div className="flex flex-col gap-10">
          {visibleMonths.map(({ year, month }) => {
            const origIdx = months.findIndex(m => m.year === year && m.month === month)
            const rows    = getWeekRows(year, month)
            return (
              <div key={`${year}-${month}`} ref={el => { monthRefs.current[origIdx] = el }}>
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
          <p className="text-gray-500 text-sm mt-1">
            Fri, Sat & Sun · tap <strong>+</strong> to add an entry
          </p>
        </div>
        <CalendarContent />
      </div>
    </RequireAuth>
  )
}
