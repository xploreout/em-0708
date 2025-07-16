import React, { useState } from 'react'
import {
  Facebook,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  Church,
} from 'lucide-react'

const Footer = () => {
  const [showMap, setShowMap] = useState(false)

  const address = '2965 Duluth Hwy, Duluth, GA 30096'
  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dronpxnlwSugjY&q=${encodeURIComponent(
    address
  )}`

  return (
    <footer className='bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 text-white py-12'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* Church Info */}
          <div className='col-span-1 md:col-span-2'>
            <div className='flex items-center space-x-3 mb-4'>
              <div className='bg-gradient-to-r from-orange-500 to-pink-500 p-2 rounded-xl'>
                <Church className='h-6 w-6 text-white' />
              </div>
              <h3 className='text-xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent'>
                ACBCC English Ministry
              </h3>
            </div>
            <p className='text-gray-300 mb-4 leading-relaxed'>
              We are a group of vibrant Jesus followers committed to growing together in
              faith, friendship, and life! Join us as we serve God and our
              community with joy and open hearts. ✨
            </p>
            <div className='flex space-x-4'>
              <a
                href='#'
                className='text-gray-400 hover:text-orange-400 transition-colors duration-200 transform hover:scale-110'
                aria-label='Facebook'
              >
                <Facebook className='h-6 w-6' />
              </a>
              <a
                href='#'
                className='text-gray-400 hover:text-pink-400 transition-colors duration-200 transform hover:scale-110'
                aria-label='Instagram'
              >
                <Instagram className='h-6 w-6' />
              </a>
              <a
                href='https://www.instagram.com/acbccem/'
                className='text-gray-400 hover:text-purple-400 transition-colors duration-200 transform hover:scale-110'
                aria-label='YouTube'
              >
                <Youtube className='h-6 w-6' />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className='text-lg font-semibold mb-4'>Quick Links</h4>
            <ul className='space-y-2'>
              <li>
                <a
                  href='#announcements'
                  className='text-gray-300 hover:text-pink-400 transition-colors duration-200'
                >
                  Announcements
                </a>
              </li>
              <li>
                <a
                  href='#resources'
                  className='text-gray-300 hover:text-orange-400 transition-colors duration-200'
                >
                  Resources
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className='text-lg font-semibold mb-4'>Contact</h4>
            <div className='space-y-2'>
              <div className='flex items-center space-x-2'>
                <Mail className='h-4 w-4 text-gray-400' />
                <span className='text-gray-300 text-sm'>acbccem@gmail.com</span>
              </div>
              {/* <div className='flex items-center space-x-2'>
                <Phone className='h-4 w-4 text-gray-400' />
                <span className='text-gray-300 text-sm'>(555) 123-4567</span>
              </div> */}
              <button
                onClick={() => setShowMap(!showMap)}
                className='flex items-start space-x-2 text-left hover:text-orange-400 transition-colors duration-200 group'
              >
                <MapPin className='h-4 w-4 text-gray-400 mt-0.5' />
                <span className='text-gray-300 text-sm group-hover:text-orange-400 transition-colors duration-200'>
                  {address.split(', ').map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      {index < address.split(', ').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Google Map */}
        {showMap && (
          <div className='mt-8 border-t border-gray-800 pt-8'>
            <div className='bg-white rounded-2xl p-4 shadow-2xl'>
              <div className='flex items-center justify-between mb-4'>
                <h4 className='text-lg font-semibold text-gray-900 flex items-center'>
                  <MapPin className='h-5 w-5 mr-2 text-orange-500' />
                  Our Location
                </h4>
                <button
                  onClick={() => setShowMap(false)}
                  className='text-gray-500 hover:text-gray-700 transition-colors duration-200'
                >
                  ✕
                </button>
              </div>
              <div className='relative w-full h-80 rounded-xl overflow-hidden'>
                <iframe
                  src={googleMapsUrl}
                  width='100%'
                  height='100%'
                  style={{ border: 0 }}
                  allowFullScreen
                  loading='lazy'
                  referrerPolicy='no-referrer-when-downgrade'
                  className='rounded-xl'
                  title='ACBCC English Ministry Location'
                ></iframe>
              </div>
              <div className='mt-4 flex flex-col sm:flex-row gap-3'>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    address
                  )}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-center font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm'
                >
                  Open in Google Maps
                </a>
                <a
                  href={`https://maps.apple.com/?q=${encodeURIComponent(
                    address
                  )}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-lg text-center font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 text-sm'
                >
                  Open in Apple Maps
                </a>
              </div>
            </div>
          </div>
        )}

        <div className='border-t border-gray-800 mt-8 pt-8 text-center'>
          <p className='text-gray-400 text-sm'>
            © 2024 ACBCC English Ministry. All rights reserved. Built with 💖
            for our amazing community.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
