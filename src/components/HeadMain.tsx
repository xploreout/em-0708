import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { FaInstagram } from 'react-icons/fa'
import { Menu, X } from 'lucide-react'

const HeadMain = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    // { name: 'Announcements', href: '/#announcements' },
    // { name: 'Resources', href: '/#resources' },
    // { name: 'Past Events', href: '/past-events' },
  ]
  const toggleMenu = () => setIsOpen(!isOpen)

  const handleNavClick = (href: string) => {
  if (href.startsWith('/#')) {
    const id = href.replace('/#', '');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      // if we are on a different page, go back to home first
      window.location.href = href;
    }
  }
  setIsOpen(false);
};

  return (
    <header className='bg-white shadow-lg sticky top-0 z-50 transition-all duration-300'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center py-4'>
          <Link to='/' className='text-xl font-bold text-gray-900'>
            ACBCC English Ministry
          </Link>

          <nav className='hidden md:flex space-x-8'>
            <a
              href='https://www.acbcc.org'
              target='_blank'
              rel='noopener noreferrer'
              className='text-gray-700 hover:text-blue-400 transition-colors duration-200 font-semibold flex items-center space-x-1'
            >
              <ArrowLeft className='h-4 w-4' />
              <span>ACBCC</span>
            </a>

            {/* {navItems.map((item) =>
              item.href.startsWith("/#") ? (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-l font-medium transition-colors duration-200 hover:bg-primary-50"
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-l font-medium transition-colors duration-200 hover:bg-primary-50 ${
                    location.pathname === item.href
                      ? "text-primary-600 bg-primary-50"
                      : "text-gray-700 hover:text-primary-600"
                  }`}
                >
                  {item.name}
                </Link>
              )
            )} */}

            <a
              href='https://www.instagram.com/acbccem/'
              target='_blank'
              rel='noopener noreferrer'
              className='text-orange-700 hover:text-purple-400 transition-colors duration-200 font-semibold flex items-center space-x-1'
              aria-label='Instagram'
            >
              <FaInstagram className='h-6 w-6 text-gray' />
            </a>
          </nav>

          {/* Mobile menu button */}
          <div className='flex md:hidden justify-between'>
            <button
              onClick={toggleMenu}
              className='text-gray-700 hover:text-primary-600 p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500'
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
        {isOpen && (
          <div className='md:hidden border-t border-gray-200 py-4'>
            <nav className='flex flex-col space-y-2'>
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 hover:bg-primary-50 ${
                    location.pathname === item.href
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-blue-700 hover:text-blue-500'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default HeadMain
