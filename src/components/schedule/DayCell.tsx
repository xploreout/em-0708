import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, Plus, Pencil, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react'
import type { Entry, FormShared } from './scheduleTypes'
import { DAY_STYLE, MONTH_NAMES, COLLAPSE_AT } from './scheduleConstants'
import { dateKey, mergeEntries } from './scheduleHelpers'
import { EntryFormModal } from './ScheduleModals'

// ── Day Detail Modal (full-screen popup when clicking a date header) ───────────

export function DayDetailModal({ date, entries, onSave, onClose, shared, readOnly = false }: {
  date: Date
  entries: Entry[]
  onSave: (key: string, entries: Entry[]) => void
  onClose: () => void
  shared: FormShared
  readOnly?: boolean
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
    onSave(key, mergeEntries(entries, idx, updated))
    setEditingIdx(null)
  }

  function deleteEntry(idx: number) { onSave(key, entries.filter((_, i) => i !== idx)) }

  const dayPortal = createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full md:w-1/2 max-h-[60vh] mx-4 bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">

        <div className="flex items-center justify-between px-4 py-3 bg-purple-200 border-b border-gray-300 shrink-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-500 text-white' : 'text-gray-900'}`}>
              {date.getDate()}
            </span>
            <span className="font-bold text-gray-900">{ds.label}</span>
            <span className="text-gray-500 text-sm">{MONTH_NAMES[date.getMonth()]} {date.getFullYear()}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:bg-purple-300 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {entries.map((entry, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
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
                  {entry.persons.map((p, pi) => {
                    const unknown = shared.congregation.length > 0 &&
                      !shared.congregation.some(m => m.name.toLowerCase().trim() === p.name.toLowerCase().trim())
                    return (
                      <span key={pi} className="flex items-center gap-1 w-full text-sm bg-purple-100 text-purple-700 font-medium rounded px-2.5 py-1">
                        {unknown && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" title="Not in contacts" />}
                        <span className="truncate">{p.name}{p.task ? <span className="text-purple-400"> · {p.task}</span> : null}</span>
                      </span>
                    )
                  })}
                </div>
              )}
              {!readOnly && (
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
              )}
            </div>
          ))}
          {!readOnly && (
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

  return (
    <>
      {dayPortal}
      {editingIdx !== null && !readOnly && (
        <EntryFormModal
          title={editingIdx === 'new' ? 'Add Entry' : 'Edit Entry'}
          entry={editingIdx !== 'new' ? entries[editingIdx as number] : undefined}
          onSave={e => saveEntry(editingIdx as number | 'new', e)}
          onClose={() => setEditingIdx(null)}
          shared={shared}
        />
      )}
    </>
  )
}

// ── Day Cell (calendar grid cell / mobile card) ───────────────────────────────

export function DayCell({ date, entries, onSave, saving, asTd = true, shared, readOnly = false }: {
  date: Date
  entries: Entry[]
  onSave: (key: string, entries: Entry[]) => void
  saving: boolean
  asTd?: boolean
  shared: FormShared
  readOnly?: boolean
}) {
  const [editingIdx, setEditingIdx] = useState<number | 'new' | null>(null)
  const [expanded,   setExpanded]   = useState(false)
  const [showModal,  setShowModal]  = useState(false)

  const key     = dateKey(date)
  const isToday = dateKey(new Date()) === key
  const dow     = date.getDay() as keyof typeof DAY_STYLE
  const ds      = DAY_STYLE[dow]

  function saveEntry(idx: number | 'new', updated: Entry) {
    onSave(key, mergeEntries(entries, idx, updated))
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
    <div className="px-2 py-1.5 flex flex-col gap-1.5">
      {(expanded ? entries : entries.slice(0, COLLAPSE_AT)).map((entry, idx) => (
        <div key={idx} className="bg-gray-50 rounded-lg px-2 py-1.5">
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
              {entry.persons.map((p, pi) => {
                const unknown = shared.congregation.length > 0 &&
                  !shared.congregation.some(m => m.name.toLowerCase().trim() === p.name.toLowerCase().trim())
                return (
                  <span key={pi} className="flex items-center gap-1 w-full text-xs bg-purple-100 text-purple-700 font-medium rounded px-2 py-0.5">
                    {unknown && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" title="Not in contacts" />}
                    <span className="truncate">{p.name}{p.task ? <span className="text-purple-400"> · {p.task}</span> : null}</span>
                  </span>
                )
              })}
            </div>
          )}
          {!readOnly && (
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
          )}
        </div>
      ))}
      {entries.length > COLLAPSE_AT && (
        <button onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-blue-500 transition-colors">
          {expanded
            ? <><ChevronUp className="w-3 h-3" /> less</>
            : <><ChevronDown className="w-3 h-3" /> +{entries.length - COLLAPSE_AT} more</>}
        </button>
      )}
      {!readOnly && (
        <button onClick={() => setEditingIdx('new')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-400 hover:bg-blue-100 hover:text-blue-600 transition-colors text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      )}
    </div>
  )

  const entryPopup = editingIdx !== null && !readOnly && (
    <EntryFormModal
      title={editingIdx === 'new' ? 'Add Entry' : 'Edit Entry'}
      entry={editingIdx !== 'new' ? entries[editingIdx as number] : undefined}
      onSave={e => saveEntry(editingIdx as number | 'new', e)}
      onClose={() => setEditingIdx(null)}
      shared={shared}
    />
  )

  const modal = showModal && (
    <DayDetailModal date={date} entries={entries} onSave={onSave}
      shared={shared} onClose={() => setShowModal(false)} readOnly={readOnly} />
  )

  if (!asTd) {
    return (
      <>
        <div className={`overflow-hidden rounded-lg border border-gray-200 border-l-4 ${ds.cardBorder} bg-white shadow-sm`}>
          {dateHeader}{bodyContent}
        </div>
        {modal}
        {entryPopup}
      </>
    )
  }

  return (
    <>
      <td className="border-l border-t border-gray-300 first:border-l-0 align-top p-0">
        {dateHeader}{bodyContent}
      </td>
      {modal}
      {entryPopup}
    </>
  )
}

// ── Column group for the 7-day table layout ───────────────────────────────────

export function CalColGroup() {
  return (
    <colgroup>
      <col style={{ width: '22%' }} />{/* Sun */}
      <col style={{ width: '8%'  }} />{/* Mon */}
      <col style={{ width: '8%'  }} />{/* Tue */}
      <col style={{ width: '8%'  }} />{/* Wed */}
      <col style={{ width: '8%'  }} />{/* Thu */}
      <col style={{ width: '20%' }} />{/* Fri */}
      <col style={{ width: '20%' }} />{/* Sat */}
    </colgroup>
  )
}
