import { Calendar, Clock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { upcomingEvents } from '../data/events'

const Youth = () => {
  const youthIds = [3, 5, 7, 8]
  const youthEvents = youthIds
    .map((id) => upcomingEvents.find((e) => e.id === id)!)
    .filter(Boolean)

  return (
    <section className='py-5 bg-white'>
      <div className='max-w-7xl mx-auto px-12 sm:px-16 lg:px-24'>
        <div className='text-left mb-14'>
          <h2 className='text-xl font-bold text-gray-900 uppercase tracking-widest'>
            Youth Ministry
          </h2>
          <p className='text-xl text-gray-500 opacity-80'>
            A place where middle and high schooler belong.
          </p>
        </div>

        <div className='flex flex-col md:flex-row gap-8 items-start'>
          {/* Image with overlay */}
          <div className='relative w-full md:w-1/2 rounded-2xl overflow-hidden shadow-md min-h-64'>
            <img
              src='./images/IMG_0179.jpg'
              alt='Youth Ministry'
              className='w-full h-full object-cover absolute inset-0'
            />
            <div className='relative bg-black/40 flex items-start p-6 min-h-64'>
              <p
                className='text-white text-xl md:text-3xl leading-tight uppercase tracking-widest font-bold'
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
              <img
                src={event.image}
                alt={event.title}
                className='w-full h-32 object-cover'
              />
              <div className='p-4 flex flex-col flex-1'>
                <h3 className='text-base font-semibold text-gray-900 mb-2 leading-snug'>
                  {event.title}
                </h3>
                <div className='space-y-1 mt-auto'>
                  <div className='flex items-center gap-1.5 text-sm text-gray-600'>
                    <Calendar className='h-3.5 w-3.5 shrink-0' />
                    <span>{event.date}</span>
                  </div>
                  <div className='flex items-center gap-1.5 text-sm text-gray-600'>
                    <Clock className='h-3.5 w-3.5 shrink-0' />
                    <span>{event.time}</span>
                  </div>
                  <div className='flex items-center gap-1.5 text-sm text-gray-600'>
                    <MapPin className='h-3.5 w-3.5 shrink-0' />
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
