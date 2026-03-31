import { Calendar, Clock, MapPin } from 'lucide-react'

const Youth = () => {
  return (
    <section className='py-20 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-left mb-14'>
          <h2 className='text-4xl font-bold text-gray-900'>Youth</h2>
        </div>

        <div className='flex flex-col md:flex-row gap-8 items-start'>
          {/* Video */}
          <div className='w-full md:w-1/2 rounded-2xl overflow-hidden shadow-md aspect-video'>
            <iframe
              src='https://www.youtube.com/embed/l2zWtUVklm8'
              title='Youth Ministry'
              className='w-full h-full'
              allowFullScreen
            />
          </div>

          {/* Text */}
          <div className='w-full md:w-1/2 text-gray-600 leading-relaxed space-y-4'>
            <p>
              Welcome to the Youth program, the ministry designed specifically
              for middle &amp; high school students! It includes a lively Friday
              nights fellowship, engaging Sunday bible studies, and fun social
              events throughout the year. Our youth ministries are led by adults
              committed to equipping students to navigate middle and high school
              and develop a faith of their own.
            </p>

            {/* Youth Friday Night Fellowship card */}
            <div className='mt-4 bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-2 text-sm text-gray-500'>
              <p className='font-semibold text-gray-700 text-base'>Youth Friday Night Fellowship</p>
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
              <p className='font-semibold text-gray-700 text-base'>Youth Sunday School</p>
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

export default Youth
