import { Calendar, Clock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { upcomingEvents } from '../data/events'

const Youth = () => {
  const youthIds = [3, 5, 7, 8]
  const youthEvents = youthIds.map((id) => upcomingEvents.find((e) => e.id === id)!).filter(Boolean)

  return (
    <section className='py-5 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-left mb-14'>
          <h2 className='text-xl font-bold text-gray-900 uppercase tracking-widest'>
            Youth Ministry
          </h2>
        </div>

        <div className='flex flex-col md:flex-row gap-8 items-start'>
          {/* Image with overlay */}
          <div className='relative w-full md:w-1/2 rounded-2xl overflow-hidden shadow-md'>
            <img
              src='./images/IMG_0179.jpg'
              alt='Youth Ministry'
              className='w-full h-full object-cover'
            />
            <div className='absolute inset-0 bg-black/40 flex items-start p-6'>
              <p
                className='text-white text-3xl leading-tight uppercase tracking-widest font-bold'
                style={{ fontFamily: '"Roboto", sans-serif' }}
              >
                Empowered youth to build personal relationship with Jesus Christ
              </p>
            </div>
          </div>

          {/* Text */}
          <div className='w-full md:w-1/2 text-gray-600 leading-relaxed space-y-4'>
            <p>
              Welcome to the Youth ministry that is specifically for middle
              &amp; high schoolers! It includes a lively Friday nights
              fellowship, engaging Sunday bible studies, serving in the
              community on giving back, and fun social events throughout the
              year. Our youth ministries are led by adults committed to
              equipping students to navigate middle and high school and develop
              a faith of their own.
            </p>

            {/* Youth Friday Night Fellowship card */}
            <div className='mt-4 bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-2 text-sm text-gray-500'>
              <p className='font-semibold text-gray-700 text-base'>
                Youth Friday Night Fellowship
              </p>
              <div className='flex items-center gap-2'>
                <Calendar className='h-3.5 w-3.5 text-blue-400 shrink-0' />
                <span>1st, 2nd and 3rd Fridays of each month</span>
              </div>
              <div className='flex items-center gap-2'>
                <Clock className='h-3.5 w-3.5 text-emerald-400 shrink-0' />
                <span>7:30pm – 9:30pm</span>
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

            {/* Youth Sunday School card */}
            <div className='bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-2 text-sm text-gray-500'>
              <p className='font-semibold text-gray-700 text-base'>
                Youth Sunday School
              </p>
              <div className='flex items-center gap-2'>
                <Calendar className='h-3.5 w-3.5 text-blue-400 shrink-0' />
                <span>Every Sunday</span>
              </div>
              <div className='flex items-center gap-2'>
                <Clock className='h-3.5 w-3.5 text-emerald-400 shrink-0' />
                <span>11:00am – 12:15pm</span>
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
        </div>

        {/* Event cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10'>
          {youthEvents.map((event) => (
            <Link
              key={event.id}
              to={event.link ?? '/events'}
              className='bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col'
            >
              <img src={event.image} alt={event.title} className='w-full h-32 object-cover' />
              <div className='p-4 flex flex-col flex-1'>
                <h3 className='text-sm font-semibold text-gray-900 mb-2 leading-snug'>{event.title}</h3>
                <div className='space-y-1 mt-auto'>
                  <div className='flex items-center gap-1.5 text-xs text-gray-400'>
                    <Calendar className='h-3 w-3 shrink-0' />
                    <span>{event.date}</span>
                  </div>
                  <div className='flex items-center gap-1.5 text-xs text-gray-400'>
                    <Clock className='h-3 w-3 shrink-0' />
                    <span>{event.time}</span>
                  </div>
                  <div className='flex items-center gap-1.5 text-xs text-gray-400'>
                    <MapPin className='h-3 w-3 shrink-0' />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Youth
