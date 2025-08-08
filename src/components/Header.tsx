import React, { useState } from 'react';
import { Menu, X, Church, ArrowLeft } from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            {/* <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-2 rounded-xl">
              <Church className="h-6 w-6 text-white" />
            </div> */}
            <a href="#" className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent hover:text-purple-600 transition-colors duration-200">
              ACBCC English Ministry
            </a>
          
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a 
              href="https://www.acbcc.org" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-blue-400 transition-colors duration-200 font-semibold flex items-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>ACBCC</span>
            </a>
            <a href="#announcements" className="text-gray-700 hover:text-orange-600 transition-colors duration-200 font-semibold">
                Announcements
            </a>
            <a href="#resources" className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-semibold">
              Resources
            </a>
             <a
                href="https://www.instagram.com/acbccem/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-700 hover:text-purple-400 transition-colors duration-200 font-semibold flex items-center space-x-1"
                onClick={() => setIsMenuOpen(false)}
                aria-label='Instagram'
              >
                <FaInstagram className="h-6 w-6 text-gray" />
                <span>Follow Us</span>
              </a> 
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-orange-600 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2 mt-4">
              <a 
                href="https://www.acbcc.org" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-blue-400 transition-colors duration-200 font-semibold py-2 flex items-center space-x-1"
                onClick={() => setIsMenuOpen(false)}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>ACBCC</span>
              </a>
              <a 
                href="#announcements" 
                className="text-gray-700 hover:text-orange-600 transition-colors duration-200 font-semibold py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Announcements
              </a>
              <a 
                href="#resources" 
                className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-semibold py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Resources
              </a>
              <a
                href="https://www.instagram.com/acbccem/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-700 hover:text-purple-400 transition-colors duration-200 font-semibold flex items-center space-x-1"
                onClick={() => setIsMenuOpen(false)}
                aria-label='Instagram'
              >
                <FaInstagram className="h-6 w-6 text-gray" />
                <span>Follow Us</span>
              </a> 
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;