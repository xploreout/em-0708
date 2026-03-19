import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaInstagram } from 'react-icons/fa';
import { Menu, X, ArrowLeft } from 'lucide-react';


const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navItems = [
    { name: 'Announcements', href: '/announcements' },
    { name: 'Resources', href: '/resources' },
    { name: 'Past Events', href: '/past-events' },
  ];

  return (
    <header className=" bg-white shadow-lg sticky top-0 z-50 transition-all duration-300">
      <div className="  max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex justify-between items-center py-4 ">
           <a 
              href="#"
              rel="noopener noreferrer"
              >
              <h1 className="text-xl font-bold text-gray-900">ACBCC English Ministry</h1>
           </a>
          <nav className="hidden md:flex space-x-8 ">
           
             <a
              href="https://www.acbcc.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-blue-400 transition-colors duration-200 font-semibold flex items-center space-x-1 "
            >
              {/* <ArrowLeft className="h-4 w-4" /> */}
              <span>ACBCC</span>
            </a>
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-l font-medium transition-colors duration-200 hover:bg-primary-50 ${
                  location.pathname === item.href
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <a
                href="https://www.instagram.com/acbccem/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-700 hover:text-purple-400 transition-colors duration-200 font-semibold flex items-center space-x-1"
                // onClick={() => setIsMenuOpen(false)}
                aria-label='Instagram'
              >
                <FaInstagram className="h-6 w-6 text-gray" />
              </a>
          </nav>
          

          {/* Mobile menu button */}
          <div className="flex md:hidden justify-between">
            <button
              onClick={toggleMenu}
              className=" text-gray-700 hover:text-primary-600 p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden border-t border-gray-200 transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 py-4 opacity-100' : 'max-h-0 py-0 opacity-0 overflow-hidden'
        }`}>
            <nav className="flex flex-col space-y-2">
              <a 
              href="#"
              rel="noopener noreferrer"
              >
              <h1 className="text-xl font-bold text-gray-900">ACBCC English Ministry</h1>
              </a>
             <a
              href="https://www.acbcc.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-blue-400 transition-colors duration-200 font-medium-sm flex items-center space-x-1 "
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Acbcc</span>
            </a>
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 rounded-md text-base font-medium transition-colors duration-200 hover:bg-primary-50 ${
                    location.pathname === item.href
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-blue-700 hover:text-blue-500'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
                <a
                href="https://www.instagram.com/acbccem/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-700 hover:text-purple-400 transition-colors duration-200 font-semibold flex items-center space-x-1 pl-3"
                // onClick={() => setIsMenuOpen(false)}
                aria-label='Instagram'
              >
                <FaInstagram className="h-6 w-6 text-gray" />
              </a>
            </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;