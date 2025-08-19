// import React, { useState } from 'react';
// import { Menu, X, ArrowLeft } from 'lucide-react';
// import { FaInstagram } from 'react-icons/fa';

// const Header = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   return (
//     <header className="bg-white shadow-lg sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           <div className="flex items-center space-x-3">
//             {/* <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-2 rounded-xl">
//               <Church className="h-6 w-6 text-white" />
//             </div> */}
//             <a href="#" className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent hover:text-purple-600 transition-colors duration-200">
//               ACBCC English Ministry
//             </a>

//           </div>

//           {/* Desktop Navigation */}
//           <nav className="hidden md:flex space-x-8">
//             <a
//               href="https://www.acbcc.org"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-gray-700 hover:text-blue-400 transition-colors duration-200 font-semibold flex items-center space-x-1"
//             >
//               <ArrowLeft className="h-4 w-4" />
//               <span>ACBCC</span>
//             </a>
//             <a href="#announcements" className="text-gray-700 hover:text-orange-600 transition-colors duration-200 font-semibold">
//                 Announcements
//             </a>
//             <a href="#resources" className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-semibold">
//               Resources
//             </a>
//             <a
//                 href="/past-events/#pastevents"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-orange-700 hover:text-purple-400 transition-colors duration-200 font-semibold flex items-center space-x-1"
//                 onClick={() => setIsMenuOpen(false)}
//                 aria-label='Past Events'
//               >
//                 Past Events
//               </a>
//              <a
//                 href="https://www.instagram.com/acbccem/"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-orange-700 hover:text-purple-400 transition-colors duration-200 font-semibold flex items-center space-x-1"
//                 onClick={() => setIsMenuOpen(false)}
//                 aria-label='Instagram'
//               >
//                 <FaInstagram className="h-6 w-6 text-gray" />

//               </a>
//           </nav>

//           {/* Mobile menu button */}
//           <div className="md:hidden">
//             <button
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               className="text-gray-700 hover:text-orange-600 transition-colors duration-200"
//             >
//               {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Navigation */}
//         {isMenuOpen && (
//           <div className="md:hidden pb-4 border-t border-gray-200">
//             <nav className="flex flex-col space-y-2 mt-4">
//               <a
//                 href="https://www.acbcc.org"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-gray-700 hover:text-blue-400 transition-colors duration-200 font-semibold py-2 flex items-center space-x-1"
//                 onClick={() => setIsMenuOpen(false)}
//               >
//                 <ArrowLeft className="h-4 w-4" />
//                 <span>ACBCC</span>
//               </a>
//               <a
//                 href="#announcements"
//                 className="text-gray-700 hover:text-orange-600 transition-colors duration-200 font-semibold py-2"
//                 onClick={() => setIsMenuOpen(false)}
//               >
//                 Announcements
//               </a>
//               <a
//                 href="#resources"
//                 className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-semibold py-2"
//                 onClick={() => setIsMenuOpen(false)}
//               >
//                 Resources
//               </a>
//               <a
//                 href="/past-events/#pastevents"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-orange-700 hover:text-purple-400 transition-colors duration-200 font-semibold flex items-center space-x-1"
//                 onClick={() => setIsMenuOpen(false)}
//                 aria-label='Past Events'
//               >
//                 Past Events
//               </a>
//               <a
//                 href="https://www.instagram.com/acbccem/"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-orange-700 hover:text-purple-400 transition-colors duration-200 font-semibold flex items-center space-x-1"
//                 onClick={() => setIsMenuOpen(false)}
//                 aria-label='Instagram'
//               >
//                 <FaInstagram className="h-6 w-6 text-gray" />
//               </a>
//             </nav>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// };

// export default Header;

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaInstagram } from 'react-icons/fa';
import { Menu, X, ArrowLeft } from 'lucide-react';


const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navItems = [
    { name: 'Announcements', href: '/#announcements' },
    { name: 'Resources', href: '/#resources' },
    { name: 'Past Events', href: '/past-events' },
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith('/#')) {
      // If we're not on the home page, navigate to home first
      if (location.pathname !== '/') {
        window.location.href = href;
      } else {
        // If we're on home page, just scroll to section
        const element = document.querySelector(href.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
    setIsOpen(false);
  };
  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 ">
          {/* Logo */}
          {/* Desktop Navigation */}
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
              className="text-gray-700 hover:text-blue-400 transition-colors duration-200 font-semibold flex items-center space-x-1 "
            >
              <ArrowLeft className="h-4 w-4" />
              <span>ACBCC</span>
            </a>
          <nav className="hidden md:flex space-x-8 ">
            
            {navItems.map((item) => (
              item.href.startsWith('/#') ? (
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
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  {item.name}
                </Link>
              )
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
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary-600 p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              {navItems.map((item) => (
                item.href.startsWith('/#') ? (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.href);
                    }}
                    className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 hover:bg-primary-50 ${
                      location.pathname === item.href
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
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