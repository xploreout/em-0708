import type { Entry } from './scheduleTypes'

// ── Date helpers ──────────────────────────────────────────────────────────────

export function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

type WeekRow = { sun: Date|null; mon: Date|null; tue: Date|null; wed: Date|null; thu: Date|null; fri: Date|null; sat: Date|null }
const EMPTY_ROW = (): WeekRow => ({ sun: null, mon: null, tue: null, wed: null, thu: null, fri: null, sat: null })
const DOW_KEYS  = ['sun','mon','tue','wed','thu','fri','sat'] as const

export function getWeekRows(year: number, month: number): WeekRow[] {
  const rows: WeekRow[] = []
  let cur: WeekRow | null = null
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

export function getWeekDays(date: Date): Date[] {
  const start = new Date(date)
  start.setDate(date.getDate() - date.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

// ── Entry merge logic (shared between DayCell and DayDetailModal) ─────────────

export function mergeEntries(entries: Entry[], idx: number | 'new', updated: Entry): Entry[] {
  if (idx !== 'new') return entries.map((e, i) => i === idx ? updated : e)

  const matchIdx = updated.eventName.trim()
    ? entries.findIndex(e => e.eventName.trim().toLowerCase() === updated.eventName.trim().toLowerCase())
    : -1

  if (matchIdx !== -1) {
    return entries.map((e, i) => {
      if (i !== matchIdx) return e
      const existingNames = new Set(e.persons.map(p => p.name.toLowerCase().trim()))
      const newPersons    = updated.persons.filter(p => !existingNames.has(p.name.toLowerCase().trim()))
      return { ...e, persons: [...e.persons, ...newPersons] }
    })
  }
  return [...entries, updated]
}

// ── Search highlight ──────────────────────────────────────────────────────────

export function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-yellow-900 rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}
