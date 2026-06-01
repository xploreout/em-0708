export type Person     = { name: string; task: string }
export type Entry      = { eventName: string; teamId?: number | null; persons: Person[] }
export type Schedule   = Record<string, Entry[]>
export type ViewMode   = 'month' | 'week' | 'day'
export type CongMember = { id: string; name: string }
export type EventType  = { id: number; name: string; recurring: boolean }
export type Team       = { id: number; name: string }

export type FormShared = {
  congregation:       CongMember[]
  eventTypes:         EventType[]
  teams:              Team[]
  tasks:              string[]
  onEventTypeCreated: (et: EventType) => void
  onTeamCreated:      (t: Team) => void
  onContactCreated:   (m: CongMember) => void
  onTaskCreated:      (task: string) => void
}
