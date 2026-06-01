import { useState, useEffect, useRef, useMemo } from 'react'
import { Loader2, Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { RequireAuth, useAuth } from '../../context/AuthContext'
import type { Schedule, FormShared, ViewMode } from './scheduleTypes'
import { MONTH_NAMES, MON_SHORT, DOW_SHORT } from './scheduleConstants'
import { dateKey, getWeekRows, getWeekDays, highlight } from './scheduleHelpers'
import { DayCell, CalColGroup } from './DayCell'

// ── Calendar content (also used by AdminPanel) ────────────────────────────────

export function CalendarContent() {
  const { authFetch, role } = useAuth()
  const readOnly = role !== 'admin'

  const [schedule,     setSchedule]     = useState<Schedule>({})
  const [congregation, setCongregation] = useState<Parameters<FormShared['onContactCreated']>[0][]>([])
  const [eventTypes,   setEventTypes]   = useState<Parameters<FormShared['onEventTypeCreated']>[0][]>([])
  const [teams,        setTeams]        = useState<Parameters<FormShared['onTeamCreated']>[0][]>([])
  const [tasks,        setTasks]        = useState<string[]>([])
  const [loading,      setLoading]      = useState(true)
  const [savingKeys,   setSavingKeys]   = useState<Set<string>>(new Set())
  const [viewMode,     setViewMode]     = useState<ViewMode>('month')
  const [cursor,       setCursor]       = useState(() => new Date())
  const [searchQuery,  setSearchQuery]  = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

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
      setTasks(Array.from(new Set(
        Object.values(sched as Schedule).flatMap(entries =>
          entries.flatMap(e => e.persons?.map(p => p.task.trim()).filter(Boolean) ?? [])
        )
      )).sort())
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [authFetch])

  // ── Navigation ───────────────────────────────────────────────────────────────

  function navigate(dir: -1 | 1) {
    setCursor(prev => {
      const d = new Date(prev)
      if (viewMode === 'month') d.setMonth(d.getMonth() + dir)
      if (viewMode === 'week')  d.setDate(d.getDate() + dir * 7)
      if (viewMode === 'day')   d.setDate(d.getDate() + dir)
      return d
    })
  }

  function cursorLabel() {
    if (viewMode === 'month') return `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`
    if (viewMode === 'week') {
      const days = getWeekDays(cursor)
      const s = days[0], e = days[6]
      if (s.getMonth() === e.getMonth())
        return `${MON_SHORT[s.getMonth()]} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`
      return `${MON_SHORT[s.getMonth()]} ${s.getDate()} – ${MON_SHORT[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`
    }
    return `${DOW_SHORT[cursor.getDay()]}, ${MON_SHORT[cursor.getMonth()]} ${cursor.getDate()}, ${cursor.getFullYear()}`
  }

  // ── Search ───────────────────────────────────────────────────────────────────

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null
    const q = searchQuery.trim().toLowerCase()
    return Object.entries(schedule).flatMap(([key, entries]) => {
      const matched = entries.filter(e =>
        e.eventName.toLowerCase().includes(q) ||
        e.persons?.some(p => p.name.toLowerCase().includes(q) || p.task.toLowerCase().includes(q))
      )
      if (!matched.length) return []
      const [y, m, d] = key.split('-').map(Number)
      return [{ date: new Date(y, m - 1, d), key, matched }]
    }).sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [searchQuery, schedule])

  // ── Save ─────────────────────────────────────────────────────────────────────

  async function handleSave(key: string, entries: Schedule[string]) {
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

  // ── Shared form props ─────────────────────────────────────────────────────────

  const shared: FormShared = {
    congregation, eventTypes, teams, tasks,
    onEventTypeCreated: et   => setEventTypes(prev => [...prev, et].sort((a, b) => a.name.localeCompare(b.name))),
    onTeamCreated:      t    => setTeams(prev => [...prev, t].sort((a, b) => a.name.localeCompare(b.name))),
    onContactCreated:   m    => setCongregation(prev => [...prev, m].sort((a, b) => a.name.localeCompare(b.name))),
    onTaskCreated:      task => setTasks(prev => [...new Set([...prev, task])].sort()),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading schedule…
      </div>
    )
  }

  // ── View renderers ────────────────────────────────────────────────────────────

  function renderMonth() {
    const rows = getWeekRows(cursor.getFullYear(), cursor.getMonth())
    return (
      <>
        <div className="md:hidden flex flex-col gap-5">
          {rows.map((row, wi) => {
            const days = [row.sun, row.mon, row.tue, row.wed, row.thu, row.fri, row.sat]
            if (!days.some(Boolean)) return null
            return (
              <div key={wi} className="flex flex-col gap-2">
                {days.map((date, di) => date ? (
                  <DayCell key={di} date={date} entries={schedule[dateKey(date)] ?? []}
                    onSave={handleSave} saving={savingKeys.has(dateKey(date))}
                    shared={shared} asTd={false} readOnly={readOnly} />
                ) : null)}
              </div>
            )
          })}
        </div>
        <div className="hidden md:block rounded-2xl border border-gray-700 shadow-sm overflow-hidden">
          <table className="w-full table-fixed text-sm border-collapse">
            <CalColGroup />
            <tbody>
              {rows.map((row, wi) => {
                const days = [row.sun, row.mon, row.tue, row.wed, row.thu, row.fri, row.sat]
                return (
                  <tr key={wi} className="bg-white">
                    {days.map((date, di) => date
                      ? <DayCell key={di} date={date} entries={schedule[dateKey(date)] ?? []}
                          onSave={handleSave} saving={savingKeys.has(dateKey(date))} shared={shared} readOnly={readOnly} />
                      : <td key={di} className="border-l border-t border-gray-300 first:border-l-0" />
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  function renderWeek() {
    const days = getWeekDays(cursor)
    return (
      <>
        <div className="md:hidden flex flex-col gap-2">
          {days.map((date, di) => (
            <DayCell key={di} date={date} entries={schedule[dateKey(date)] ?? []}
              onSave={handleSave} saving={savingKeys.has(dateKey(date))}
              shared={shared} asTd={false} readOnly={readOnly} />
          ))}
        </div>
        <div className="hidden md:block rounded-2xl border border-gray-700 shadow-sm overflow-hidden">
          <table className="w-full table-fixed text-sm border-collapse">
            <CalColGroup />
            <tbody>
              <tr className="bg-white">
                {days.map((date, di) => (
                  <DayCell key={di} date={date} entries={schedule[dateKey(date)] ?? []}
                    onSave={handleSave} saving={savingKeys.has(dateKey(date))} shared={shared} readOnly={readOnly} />
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </>
    )
  }

  function renderDay() {
    return (
      <div className="max-w-sm">
        <DayCell date={cursor} entries={schedule[dateKey(cursor)] ?? []}
          onSave={handleSave} saving={savingKeys.has(dateKey(cursor))}
          shared={shared} asTd={false} readOnly={readOnly} />
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Sticky nav */}
      <div className="sticky top-16 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 bg-white/95 backdrop-blur-sm border-b border-gray-100 mb-6">
        <div className="flex items-center gap-2 pt-2 pb-2 flex-wrap">

          {/* < period label > + Today */}
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-gray-700 min-w-[11rem] text-center select-none">
              {cursorLabel()}
            </span>
            <button onClick={() => navigate(1)}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => setCursor(new Date())}
              className="ml-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
              Today
            </button>
          </div>

          <div className="flex-1" />

          {/* Month / Week / Day toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold shrink-0">
            {(['month', 'week', 'day'] as ViewMode[]).map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`px-3 py-1.5 capitalize transition-colors border-l border-gray-200 first:border-l-0 ${
                  viewMode === m ? 'bg-orange-400 text-white' : 'text-gray-500 hover:bg-orange-50'
                }`}>
                {m}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input ref={searchRef} type="text" placeholder="Search…"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-36 pl-8 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 bg-white" />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); searchRef.current?.focus() }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
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
                <button onClick={() => { setSearchQuery(''); setCursor(date); setViewMode('day') }}
                  className="text-xs text-blue-500 hover:text-blue-700 font-semibold transition">
                  View →
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
        viewMode === 'month' ? renderMonth() :
        viewMode === 'week'  ? renderWeek()  :
        renderDay()
      )}
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ScheduleCalendar() {
  return (
    <RequireAuth role="calendar">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">CoWorker Calendar</h1>
        </div>
        <CalendarContent />
      </div>
    </RequireAuth>
  )
}
