import { Calendar, MapPin, Clock, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'
import { upcomingEvents } from '../data/events'

const Events = () => {

  return (
    <section id='events' className='py-20 bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='text-left mb-12'>
          <h2 className='text-xl font-bold text-gray-900 uppercase tracking-widest'>What's Coming Up</h2>
        </div>

        {/* Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {upcomingEvents.filter((e) => ![3, 4, 5, 7, 8, 9, 10].includes(e.id)).map((event) => (
            <Link
              key={event.id}
              to={event.link ?? '#'}
              onClick={event.link ? undefined : (e) => e.preventDefault()}
              className='bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col'
            >
              {event.video ? (
                <video
                  src={event.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className='w-full h-44 object-cover block'
                />
              ) : (
                <img
                  src={event.image}
                  alt={event.title}
                  className='w-full h-44 object-cover'
                />
              )}
              <div className='p-5 flex flex-col flex-1'>
                <h3 className='text-base font-semibold text-gray-900 mb-2'>
                  {event.title}
                </h3>
                <div className='mb-4 flex-1 space-y-2'>
                  <p className='text-sm text-gray-500 leading-relaxed'>
                    {event.description}
                  </p>
                  {event.alert && (
                    <p className='text-xs text-amber-600 font-medium'>{event.alert}</p>
                  )}
                </div>
                <div className='space-y-1.5 text-sm text-gray-500'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-3.5 w-3.5 text-blue-400 shrink-0' />
                    <span>{event.date}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-3.5 w-3.5 text-emerald-400 shrink-0' />
                    <span>{event.time}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <MapPin className='h-3.5 w-3.5 text-blue-400 shrink-0' />
                    {event.mapUrl ? (
                      <a
                        href={event.mapUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        onClick={(e) => e.stopPropagation()}
                        className='hover:text-blue-600 transition-colors'
                      >
                        {event.location}
                      </a>
                    ) : (
                      <span>{event.location}</span>
                    )}
                  </div>
                  {event.note && (
                    <div className='flex items-center gap-1.5 text-xs text-gray-500'>
                      <Globe className='h-3.5 w-3.5 shrink-0' />
                      <span>中文 · {event.note}</span>
                    </div>
                  )}
                </div>
                {event.registrationUrl && (
                  <a
                    href={event.registrationUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='mt-4 inline-block text-sm text-blue-500 font-medium hover:text-blue-700 transition-colors'
                  >
                    Registration & Event Info →
                  </a>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* <EventRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedEvent={selectedEvent}
        allEvents={upcomingEvents}
        onRegister={() => {}}
      /> */}
    </section>
  )
}

export default Events
