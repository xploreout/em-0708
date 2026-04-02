import { Calendar, Clock, MapPin } from 'lucide-react'

const Children = () => {
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

            {/* Friday Awana card */}
            <div className='mt-4 bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-2 text-sm text-gray-500'>
              <p className='font-semibold text-gray-700 text-base'>
                Friday Awana
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

            {/* Children Sunday School card */}
            <div className='bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-2 text-sm text-gray-500'>
              <p className='font-semibold text-gray-700 text-base'>
                Children Sunday School
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
      </div>
    </section>
  )
}

export default Children
