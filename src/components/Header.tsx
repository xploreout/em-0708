import { useState, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ArrowLeft, ChevronDown } from 'lucide-react'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false)
  const [eventsOpen, setEventsOpen] = useState(false)
  const [mobileEventsOpen, setMobileEventsOpen] = useState(false)
  const location = useLocation()
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const eventsHoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toggleMenu = () => setIsOpen(!isOpen)

  const eventsItems = [
    { name: 'Upcoming Events', href: '/events' },
    { name: 'Past Events', href: '/past-events' },
  ]

  const resourcesItems = [
    { name: 'Adult Small Group', href: '/resources/adult-small-group' },
    { name: 'Youth Ministry', href: '/resources/youth' },
    { name: 'Children Ministry', href: '/resources/children' },
    { name: 'Devotional Resources', href: '/resources/other' },
  ]

  const isResourcesActive = resourcesItems.some((i) =>
    location.pathname.startsWith(i.href),
  )

  const isEventsActive = eventsItems.some((i) =>
    location.pathname === i.href,
  )

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
    setResourcesOpen(true)
  }

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setResourcesOpen(false), 150)
  }

  const handleEventsMouseEnter = () => {
    if (eventsHoverTimeout.current) clearTimeout(eventsHoverTimeout.current)
    setEventsOpen(true)
  }

  const handleEventsMouseLeave = () => {
    eventsHoverTimeout.current = setTimeout(() => setEventsOpen(false), 150)
  }

  return (
    <header className=' bg-white sticky top-0 z-50 transition-all duration-300'>
      <div className='  max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 '>
        <div className='flex justify-between items-center py-4 '>
          <a href='#' rel='noopener noreferrer'>
            <h1 className='text-xl font-bold brush-title-inline'>ACBCCEM</h1>
          </a>
          <nav className='hidden md:flex space-x-8 items-center'>
            <Link
              to='/im-new'
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                location.pathname === '/im-new'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              I'm New
            </Link>

            {/* Events dropdown */}
            <div
              className='relative'
              onMouseEnter={handleEventsMouseEnter}
              onMouseLeave={handleEventsMouseLeave}
            >
              <button
                className={`px-3 py-2 rounded-md text-l font-medium transition-colors duration-200 flex items-center gap-1 hover:bg-primary-50 ${
                  isEventsActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Events
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${eventsOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {eventsOpen && (
                <div className='absolute top-full left-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50'>
                  {eventsItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`block px-4 py-2 text-sm transition-colors duration-150 hover:bg-gray-50 ${
                        location.pathname === item.href
                          ? 'text-primary-600 font-medium'
                          : 'text-gray-700 hover:text-primary-600'
                      }`}
                      onClick={() => setEventsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Resources dropdown */}
            <div
              className='relative'
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`px-3 py-2 rounded-md text-l font-medium transition-colors duration-200 flex items-center gap-1 hover:bg-primary-50 ${
                  isResourcesActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Ministries
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${resourcesOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {resourcesOpen && (
                <div className='absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50'>
                  {resourcesItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`block px-4 py-2 text-sm transition-colors duration-150 hover:bg-gray-50 ${
                        location.pathname.startsWith(item.href)
                          ? 'text-primary-600 font-medium'
                          : 'text-gray-700 hover:text-primary-600'
                      }`}
                      onClick={() => setResourcesOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to='/about'
              className={`px-3 py-2 rounded-md text-l font-medium transition-colors duration-200 hover:bg-primary-50 ${
                location.pathname === '/about'
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              About
            </Link>

            <a
              href='https://www.acbcc.org'
              target='_blank'
              rel='noopener noreferrer'
              className='text-gray-700 hover:text-blue-400 transition-colors duration-200 font-semibold flex items-center space-x-1'
            >
              <span>ACBCC</span><span className='text-xs font-normal ml-0.5 leading-none text-gray-400' style={{ writingMode: 'vertical-rl' }}>中文</span>
            </a>

          </nav>

          {/* Mobile menu button */}
          <div className='flex md:hidden justify-between'>
            <button
              onClick={toggleMenu}
              className=' text-gray-700 hover:text-primary-600 p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500'
              aria-label='Toggle menu'
            >
              {isOpen ? (
                <X className='h-6 w-6' />
              ) : (
                <Menu className='h-6 w-6' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isOpen
              ? 'max-h-screen py-4 opacity-100'
              : 'max-h-0 py-0 opacity-0 overflow-hidden'
          }`}
        >
          <nav className='flex flex-col space-y-2'>
            <a href='#' rel='noopener noreferrer'>
              <h1 className='text-xl font-bold brush-title-inline'>
                ACBCC English Ministry
              </h1>
            </a>
            <a
              href='https://www.acbcc.org'
              target='_blank'
              rel='noopener noreferrer'
              className='text-gray-700 hover:text-blue-400 transition-colors duration-200 font-medium-sm flex items-center space-x-1 '
            >
              <ArrowLeft className='h-4 w-4' />
              <span>Acbcc</span>
            </a>

            <Link
              to='/im-new'
              className='px-3 py-1 rounded-full text-base font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200 inline-block'
              onClick={() => setIsOpen(false)}
            >
              I'm New
            </Link>

            {/* Mobile Events accordion */}
            <button
              className={`px-3 text-left rounded-md text-base font-medium flex items-center gap-1 ${
                isEventsActive ? 'text-primary-600' : 'text-blue-700'
              }`}
              onClick={() => setMobileEventsOpen(!mobileEventsOpen)}
            >
              Events
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${mobileEventsOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {mobileEventsOpen && (
              <div className='pl-6 flex flex-col space-y-1'>
                {eventsItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                      location.pathname === item.href
                        ? 'text-primary-600'
                        : 'text-blue-700 hover:text-blue-500'
                    }`}
                    onClick={() => {
                      setIsOpen(false)
                      setMobileEventsOpen(false)
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Mobile Resources accordion */}
            <button
              className={`px-3 text-left rounded-md text-base font-medium flex items-center gap-1 ${
                isResourcesActive ? 'text-primary-600' : 'text-blue-700'
              }`}
              onClick={() => setMobileResourcesOpen(!mobileResourcesOpen)}
            >
              Ministries
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${mobileResourcesOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {mobileResourcesOpen && (
              <div className='pl-6 flex flex-col space-y-1'>
                {resourcesItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                      location.pathname.startsWith(item.href)
                        ? 'text-primary-600'
                        : 'text-blue-700 hover:text-blue-500'
                    }`}
                    onClick={() => {
                      setIsOpen(false)
                      setMobileResourcesOpen(false)
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}

            <Link
              to='/about'
              className={`px-3 py-1 rounded-md text-base font-medium transition-colors duration-200 ${
                location.pathname === '/about'
                  ? 'text-primary-600'
                  : 'text-blue-700 hover:text-blue-500'
              }`}
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>

          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
