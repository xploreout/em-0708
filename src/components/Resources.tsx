import { Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

const toEmbedUrl = (url: string): string => {
  // youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([\w-]+)/)
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?color=white`
  // youtube.com/watch?v=ID
  const watchMatch = url.match(/[?&]v=([\w-]+)/)
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?color=white`
  // playlist
  const listMatch = url.match(/[?&]list=([\w-]+)/)
  if (listMatch) return `https://www.youtube.com/embed/videoseries?list=${listMatch[1]}&color=white`
  return url
}

const Resources = () => {
  const bibleStudies = [
    // {
    //   id: 3,
    //   title: 'Discipleship Training',
    //   description:
    //     'A 4-week intensive training program for growing as a disciple of Christ.',
    //   duration: 'Contact us to learn more',
    //   image:
    //     'https://images.pexels.com/photos/8383409/pexels-photo-8383409.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    // },
  ]

  return (
    <section id='resources' className='py-20 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='text-left mb-14'>
          <p className='text-sm uppercase tracking-widest text-gray-900 font-semibold mb-2'>
            Grow in Faith
          </p>
          <h2 className='text-xl font-bold text-gray-900 uppercase tracking-widest'>Resources</h2>
        </div>

        {/* Bible Studies */}
        <div className='mb-16'>
          <h3 className='text-lg font-semibold text-gray-900 uppercase tracking-wider mb-6'>
            Small Group Bible Studies
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {/* Basics of Faith — link card */}
            <Link
              to='/resources/basicoffaith'
              className='bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col group'
            >
              <img
                src='https://images.pexels.com/photos/66100/pexels-photo-66100.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
                alt='Basics of Faith'
                className='w-full h-44 object-cover'
              />
              <div className='p-5 flex flex-col flex-1'>
                <h4 className='text-base font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors'>
                  Basics of Faith
                </h4>
                <p className='text-sm text-gray-500 leading-relaxed mb-4 flex-1'>
                  A video series exploring the foundations of Christian faith — who Jesus is, what faith means, and how to grow spiritually.
                </p>
               
              </div>
            </Link>

            {/* Purpose Driven Life — link card */}
            <Link
              to='/resources/purposedrivenlife'
              className='bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col group'
            >
              <img
                src='https://images.pexels.com/photos/91153/pexels-photo-91153.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
                alt='Purpose Driven Life'
                className='w-full h-44 object-cover'
              />
              <div className='p-5 flex flex-col flex-1'>
                <h4 className='text-base font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors'>
                  Purpose Driven Life
                </h4>
                <p className='text-sm text-gray-500 leading-relaxed mb-4 flex-1'>
                  A 40-day devotional series helping you discover what you were created for and how to live with purpose.
                </p>
                
              </div>
            </Link>

            {/* Remaining bible studies */}
            {bibleStudies.map((study) => (
              <div
                key={study.id}
                className='bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col'
              >
                {'videoUrl' in study && study.videoUrl ? (
                  <div className='aspect-video w-full'>
                    <iframe
                      src={toEmbedUrl(study.videoUrl as string)}
                      title={study.title}
                      className='w-full h-full'
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <img
                    src={study.image}
                    alt={study.title}
                    className='w-full h-44 object-cover'
                  />
                )}
                <div className='p-5 flex flex-col flex-1'>
                  <h4 className='text-base font-semibold text-gray-900 mb-1'>
                    {study.title}
                  </h4>
                  <div className='flex items-center gap-1.5 text-xs text-gray-400 mb-3'>
                    <Clock className='h-3 w-3' />
                    <span>{study.duration}</span>
                  </div>
                  <p className='text-sm text-gray-500 leading-relaxed mb-4 flex-1'>
                    {study.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

export default Resources
