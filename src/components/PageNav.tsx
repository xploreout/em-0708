import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const pages = [
  { path: '/events', label: 'Events' },
  { path: '/past-events', label: 'Past Events' },
  { path: '/resources/adult-small-group', label: 'Adult Small Group' },
  { path: '/resources/youth', label: 'Youth' },
  { path: '/resources/children', label: 'Children' },
  { path: '/resources/other', label: 'Devotional Resources' },
]

const PageNav = () => {
  const { pathname } = useLocation()
  const idx = pages.findIndex((p) => p.path === pathname)
  if (idx === -1) return null

  const prev = pages[idx - 1]
  const next = pages[idx + 1]

  return (
    <div className='flex justify-between items-center px-6 py-6 max-w-7xl mx-auto'>
      {prev ? (
        <Link
          to={prev.path}
          className='flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200'
        >
          <ChevronLeft className='h-4 w-4' />
          <span>{prev.label}</span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          to={next.path}
          className='flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200'
        >
          <span>{next.label}</span>
          <ChevronRight className='h-4 w-4' />
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}

export default PageNav
