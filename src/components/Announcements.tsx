import { Calendar, MapPin, Clock } from 'lucide-react'
import { useState } from 'react'
import EventRegistrationModal from './EventRegistrationModal'

const Announcements = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvent] = useState<null>(null)

  const upcomingEvents = [
    {
      id: 2,
      title: 'Youth Sunday School',
      date: 'Every Sunday',
      time: '11:00am – 12:15pm',
      location: 'SDA Church, Duluth, GA',
      description:
        'Every Sunday, we welcome students in grades 6–12 to join our Sunday School class! We will explore the Bible together, discuss relevant topics, and grow in faith step by step.',
      image: './images/IMG_5440.jpg',
    },
    {
      id: 3,
      title: 'Youth Friday Night Fellowship',
      date: '1st, 2nd & 3rd Fridays',
      time: '7:30pm – 9:15pm',
      location: 'SDA Church, Duluth, GA',
      description:
        'A fun and welcoming space for students in grades 6–12 to hang out, strengthen faith, and build meaningful friendships through activities, Bible message, and prayer.',
      image: './images/cny.jpg',
    },
    {
      id: 4,
      title: 'Salt n Light (SnL) Fellowship',
      date: '1st & 3rd Fridays',
      time: '7:30pm – 9:15pm',
      location: 'SDA Church, Duluth, GA',
      description:
        'Starting a video series on "Basics of Faith" by Life Church Open Network. Each session includes a short video and group discussion. Come grow spiritually together!',
      image:
        'https://images.pexels.com/photos/5206051/pexels-photo-5206051.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    },
    {
      id: 5,
      title: 'Good Friday Worship Night',
      date: 'April 3rd, 2026',
      time: '7:30pm – 9:00pm',
      location: 'SDA Church, Duluth, GA',
      description:
        'A special worship night with music, scripture reading, and reflection to remember the crucifixion of Jesus Christ and the hope we have in Him.',
      image:
        'https://images.pexels.com/photos/1615776/pexels-photo-1615776.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
    },
    {
      id: 6,
      title: 'Easter Sunday Celebration',
      date: 'April 5th, 2026',
      time: '11:00am – 12:15pm',
      location: 'SDA Church, Duluth, GA',
      description:
        "Celebrate the resurrection of Jesus Christ with a special worship service, scripture, a message of hope, and children's activities.",
      image: './images/risen2.jpg',
    },
    {
      id: 7,
      title: 'April Volunteering & Lunch Outing',
      date: 'April 11th, 2026',
      time: '10:00am – Noon',
      location: 'Powers Island Unit, Chattahoochee River NRA',
      description:
        'Join us for a cleanup along the Chattahoochee River. Wear closed-toed shoes and bring a reusable water bottle. All ages 10+ welcome. Optional lunch after!',
      image: './images/river.jpg',
      registrationUrl:
        'https://chattahoocheeparks.app.neoncrm.com/nx/portal/neonevents/events?path=%2Fportal%2Fevents%2F36703',
    },
    {
      id: 8,
      title: 'April Buffet Lunch Outing',
      date: 'April 11th, 2026',
      time: '12:30pm – 1:30pm',
      location: 'Golden Corral, 2211 Cobb Pkwy, Smyrna, GA',
      description: 'Simple buffet lunch at Golden Corral. Everyone welcome!',
      image: './images/corral.jpg',
    },
  ]

  return (
    <section id='announcements' className='py-20 bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <p className='text-sm uppercase tracking-widest text-blue-500 font-semibold mb-2'>
            What's Coming Up
          </p>
          <h2 className='text-4xl font-bold text-gray-900'>Announcements</h2>
        </div>

        {/* Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className='bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col'
            >
              <img
                src={event.image}
                alt={event.title}
                className='w-full h-44 object-cover'
              />
              <div className='p-5 flex flex-col flex-1'>
                <h3 className='text-base font-semibold text-gray-900 mb-2'>
                  {event.title}
                </h3>
                <p className='text-sm text-gray-500 leading-relaxed mb-4 flex-1'>
                  {event.description}
                </p>
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
                    <span>{event.location}</span>
                  </div>
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
            </div>
          ))}
        </div>
      </div>

      <EventRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedEvent={selectedEvent}
        allEvents={upcomingEvents}
        onRegister={() => {}}
      />
    </section>
  )
}

export default Announcements
