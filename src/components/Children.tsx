import { Calendar, Clock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { upcomingEvents } from '../data/events'

const Children = () => {
  const childrenIds = [9, 10]
  const childrenEvents = childrenIds.map((id) => upcomingEvents.find((e) => e.id === id)!).filter(Boolean)

  return (
    <section className='py-10 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-left mb-14'>
          <h2 className='text-xl font-bold text-gray-900 uppercase tracking-widest'>
            Children Ministry
          </h2>
        </div>

        <div className='flex flex-col md:flex-row gap-8 items-start'>
          {/* Video */}
          <div className='w-full md:w-1/2 rounded-2xl overflow-hidden shadow-md aspect-video'>
            <iframe
              src='https://www.youtube.com/embed/xHtr34Kr0j4'
              title='Children Ministry'
              className='w-full h-full'
              allowFullScreen
            />
          </div>

          {/* Text */}
          <div className='w-full md:w-1/2 text-gray-600 leading-relaxed space-y-4'>
            <p>
              Children are nutured to know, love and serve Jesus with memorizing
              Bible verses, completing a Bible-based handbook, playing games,
              and making friends.
            </p>
            <p>
              We focus on learning God's Word, making friends and having fun.
              Our goal is that all children throughout the world will come to
              know, love and serve the Lord Jesus Christ. For additional
              information about our AWANA ministry, please feel free to{' '}
              <a
                href='mailto:acbccem@gmail.com'
                className='text-gray-900 hover:text-blue-700 transition-colors'
              >
                contact us.
              </a>
            </p>
            <p>
              Children Sunday School are held every Sunday with a focus on
              engaging and fun learning experiences.
            </p>

          </div>
        </div>
        {/* Event cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10'>
          {childrenEvents.map((event) => (
            <Link
              key={event.id}
              to={event.link ?? '/events'}
              className='bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col'
            >
              <img src={event.image} alt={event.title} className='w-full h-32 object-cover' />
              <div className='p-4 flex flex-col flex-1'>
                <h3 className='text-base font-semibold text-gray-900 mb-2 leading-snug'>{event.title}</h3>
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

export default Children
