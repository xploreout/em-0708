import { Calendar, Clock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

const AdultSmallGroup = () => {
  const studies = [
    {
      title: 'Basics of Faith',
      href: '/resources/basicoffaith',
      image:
        'https://images.pexels.com/photos/66100/pexels-photo-66100.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      description:
        'A video series exploring the foundations of Christian faith — who Jesus is, what faith means, and how to grow spiritually.',
    },
    {
      title: 'Purpose Driven Life',
      href: '/resources/purposedrivenlife',
      image:
        'https://images.pexels.com/photos/91153/pexels-photo-91153.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      description:
        'A 40-day devotional series helping you discover what you were created for and how to live with purpose.',
    },
  ]

  return (
    <section className='py-20 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-left mb-14'>
          <p className='text-sm uppercase tracking-widest text-gray-900 font-semibold mb-2'>
            Resources
          </p>
          <h2 className='text-xl font-bold text-gray-900'>
            Adult Small Group
          </h2>

          {/* Adult Small Group - Salt n Light card */}
          <div className='mt-6 inline-block bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-2 text-sm text-gray-500'>
            <p className='font-semibold text-gray-800 text-base'>
              Salt n Light (SnL)
            </p>
            <p className='text-gray-500 leading-relaxed'>
              Come experience community and grow in faith with others. No matter
              where you are in life, you’re welcome to join us as we walk this
              journey together.
            </p>
            <div className='flex items-center gap-2'>
              <Calendar className='h-3.5 w-3.5 text-blue-400 shrink-0' />
              <span>1st &amp; 3rd Fridays of each month</span>
            </div>
            <div className='flex items-center gap-2'>
              <Clock className='h-3.5 w-3.5 text-emerald-400 shrink-0' />
              <span>7:30pm – 9:15pm</span>
            </div>
            <div className='flex items-center gap-2'>
              <MapPin className='h-3.5 w-3.5 text-blue-400 shrink-0' />
              <a
                href='https://www.google.com/maps/search/?api=1&query=2965+Duluth+Hwy+Duluth+GA+30096'
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-500 hover:text-blue-700 transition-colors'
              >
                SDA Church, Duluth, GA
              </a>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {studies.map((study) => (
            <Link
              key={study.title}
              to={study.href}
              className='bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col group'
            >
              <img
                src={study.image}
                alt={study.title}
                className='w-full h-44 object-cover'
              />
              <div className='p-5 flex flex-col flex-1'>
                <h4 className='text-base font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors'>
                  {study.title}
                </h4>
                <p className='text-sm text-gray-500 leading-relaxed flex-1'>
                  {study.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AdultSmallGroup
