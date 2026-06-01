export const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
export const MON_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
export const DOW_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export const DAY_STYLE = {
  0: { label: 'Sunday',    short: 'Sun', cardBorder: 'border-l-amber-400',  todayBg: 'bg-amber-600'  },
  1: { label: 'Monday',    short: 'Mon', cardBorder: 'border-l-slate-400',  todayBg: 'bg-slate-600'  },
  2: { label: 'Tuesday',   short: 'Tue', cardBorder: 'border-l-rose-400',   todayBg: 'bg-rose-600'   },
  3: { label: 'Wednesday', short: 'Wed', cardBorder: 'border-l-teal-400',   todayBg: 'bg-teal-600'   },
  4: { label: 'Thursday',  short: 'Thu', cardBorder: 'border-l-violet-400', todayBg: 'bg-violet-600' },
  5: { label: 'Friday',    short: 'Fri', cardBorder: 'border-l-indigo-400', todayBg: 'bg-indigo-600' },
  6: { label: 'Saturday',  short: 'Sat', cardBorder: 'border-l-sky-400',    todayBg: 'bg-sky-600'    },
} as const

export const INPUT_SM   = 'w-full text-base md:text-xs border rounded-lg px-2 py-2 md:py-1.5 outline-none bg-white'
export const COLLAPSE_AT = 2
