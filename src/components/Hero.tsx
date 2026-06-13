import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, Globe } from 'lucide-react'
import { upcomingEvents } from '../data/events'
import { useLang } from '../context/LanguageContext'
import { t, tx } from '../i18n/translations'

const Hero = () => {
  const { lang } = useLang()
  const heroIds = [1, 6, 11]
  const preview = heroIds
    .map((id) => upcomingEvents.find((e) => e.id === id)!)
    .filter(Boolean)

  return (
    <section className='bg-white'>
      {/* Top — bright hero banner */}
      <div className='relative overflow-hidden bg-gradient-to-br from-blue-50 via-teal-50 to-emerald-100'>
        {/* Decorative blobs */}
        <div className='absolute -top-24 -right-24 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl' />
        <div className='absolute -bottom-16 -left-16 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl' />

        <div className='absolute inset-0 z-0'>
          <img
            src='https://images.pexels.com/photos/33307468/pexels-photo-33307468.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'
            alt='Young adults fellowship'
            className='w-full h-full object-cover opacity-40'
          />
        </div>

        <div className='relative z-10 max-w-4xl mx-auto px-6 sm:px-10 pt-24 pb-14 text-center'>
          <span
            className='inline-flex items-center gap-2 text-blue-600 text-[20px] sm:text-xxs uppercase tracking-widest px-4 py-1.5 mb-4'
            style={{
              fontFamily: "'Julius Sans One', sans-serif",
              WebkitTextStroke: '0.8px currentColor',
            }}
          >
            {tx(t.hero.churchName, lang)}
          </span>

          <h1 className='text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 pb-2 overflow-visible'>
            <span className='brush-title'>{tx(t.hero.title, lang)}</span>
          </h1>

          <p className='text-[18px] sm:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-5'>
            {tx(t.hero.description, lang)}
          </p>
        </div>
      </div>

      {/* Bottom — upcoming event cards */}
      <div className='bg-white py-12 border-t border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-lg font-semibold text-gray-900'>
              {tx(t.hero.whatsComingUp, lang)}
            </h2>
            <Link
              to='/events'
              className='text-sm text-teal-600 hover:text-teal-800 transition-colors font-medium'
            >
              {tx(t.hero.viewAll, lang)}
            </Link>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {preview.map((event) => (
              <Link
                key={event.id}
                to={event.link ?? '/events'}
                className='bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col'
              >
                {event.video ? (
                  <video
                    src={event.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className='w-full h-32 object-cover block'
                  />
                ) : (
                  <img
                    src={event.image}
                    alt={event.title}
                    className='w-full h-32 object-cover'
                  />
                )}
                <div className='p-4 flex flex-col flex-1'>
                  <h3 className='text-sm font-semibold text-gray-900 mb-2 leading-snug'>
                    {event.title}
                  </h3>
                  {event.alert && (
                    <p className='text-xs text-amber-600 font-medium mb-2'>
                      {event.alert}
                    </p>
                  )}
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
                    {event.note && (
                      <div className='flex items-center gap-1.5 text-xs text-gray-400'>
                        <Globe className='h-3 w-3 shrink-0' />
                        <span>中文 · {event.note}</span>
                      </div>
                    )}
                  </div>
                  {event.registrationUrl && (
                    <a
                      href={event.registrationUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      onClick={(e) => e.stopPropagation()}
                      className='mt-3 inline-block text-xs text-blue-500 font-medium hover:text-blue-700 transition-colors'
                    >
                      {tx(t.events.registrationInfo, lang)}
                    </a>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
