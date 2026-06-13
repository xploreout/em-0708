import { Calendar, Clock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { t, tx } from '../i18n/translations'

const AdultSmallGroup = () => {
  const { lang } = useLang()

  const studies = [
    {
      titleKey: 'studiesTitle' as const,
      descKey: 'studiesDesc' as const,
      href: '/resources/basicoffaith',
      image: 'https://images.pexels.com/photos/66100/pexels-photo-66100.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    },
    {
      titleKey: 'pdlTitle' as const,
      descKey: 'pdlDesc' as const,
      href: '/resources/purposedrivenlife',
      image: 'https://images.pexels.com/photos/91153/pexels-photo-91153.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    },
  ]

  return (
    <section className='py-5 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-left '>
          <h2 className='text-xl font-bold text-gray-900 uppercase tracking-widest'>
            {tx(t.adultSmallGroup.title, lang)}
          </h2>
          <p className='text-xl text-gray-500 opacity-80 pb-8'>
            {tx(t.adultSmallGroup.subtitle, lang)}
          </p>
        </div>

        {/* Photo + description layout */}
        <div className='flex flex-col md:flex-row gap-8 items-stretch mb-10'>
          <div className='relative w-full md:w-1/3 rounded-lg overflow-hidden shadow-md'>
            <img
              src='./images/bible.jpg'
              alt='Adult Small Group'
              className='w-full h-full object-cover'
            />
            <div className='absolute inset-0 bg-black/40 flex items-start p-6'>
              <p
                className='text-white text-lg leading-tight uppercase tracking-widest font-bold'
                style={{ fontFamily: '"Roboto", sans-serif' }}
              >
                {tx(t.adultSmallGroup.overlayText, lang)}
              </p>
            </div>
          </div>

          <div className='w-full md:w-1/2 space-y-4'>
            {/* Salt n Light card */}
            <div className='bg-gray-50 rounded-lg border border-gray-100 p-5 space-y-2 text-sm text-gray-500'>
              <p className='font-semibold text-gray-800 text-base'>
                {tx(t.adultSmallGroup.snlTitle, lang)}
              </p>
              <p className='text-gray-500 leading-relaxed'>
                {tx(t.adultSmallGroup.snlText, lang)}
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
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {studies.map((study) => (
            <Link
              key={study.href}
              to={study.href}
              className='bg-gray-50 rounded-lg overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col group'
            >
              <img
                src={study.image}
                alt={tx(t.adultSmallGroup[study.titleKey], lang)}
                className='w-full h-44 object-cover'
              />
              <div className='p-5 flex flex-col flex-1'>
                <h4 className='text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors'>
                  {tx(t.adultSmallGroup[study.titleKey], lang)}
                </h4>
                <p className='text-base text-gray-600 leading-relaxed flex-1'>
                  {tx(t.adultSmallGroup[study.descKey], lang)}
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
