import { Play, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

const playlist = {
  title: 'Purpose Driven Life – Full Playlist',
  description:
    "A 40-day devotional journey discovering God's purpose for your life. Each session is 5–10 minutes and explores meaning, worship, fellowship, discipleship, and ministry.",
  duration: '5–10 min · 40 episodes',
  playlistUrl:
    'https://youtube.com/playlist?list=PL_UPGMCoup7CAZylckDzth0KuYLYh7A6P',
  thumbnail: './images/IMG_4822.JPG',
  links: [
    {
      label: 'Purpose Driven Life – Daily Devotional PDF',
      url: 'https://www.wearesacredheart.org/uploads/5/6/9/3/56932635/the_purpose_driven_life_pdf.pdf',
    },
  ],
}

const PurposeDrivenLife = () => {
  return (
    <section className='py-20 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Back link */}
        <Link
          to='/resources'
          className='inline-flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-700 transition-colors mb-8'
        >
          ← Back to Resources
        </Link>

        {/* Header */}
        <div className='text-left mb-12'>
          <p className='text-sm uppercase tracking-widest text-gray-900 font-semibold mb-2'>
            Bible Study Series
          </p>
          <h2 className='text-4xl font-bold text-gray-900'>
            Purpose Driven Life
          </h2>
          <p className='text-gray-500 mt-3 max-w-xl text-sm'>
            A 40-day devotional series helping you discover what you were
            created for and how to live with purpose.
          </p>
        </div>

        {/* Playlist card */}
        <div className='w-full md:w-1/3 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm'>
          <img
            src={playlist.thumbnail}
            alt={playlist.title}
            className='w-full h-48 object-cover'
          />
          {/* Info */}
          <div className='p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-1'>
              {playlist.title}
            </h3>
            <div className='flex items-center gap-1.5 text-xs text-gray-400 mb-3'>
              <Clock className='h-3 w-3' />
              <span>{playlist.duration}</span>
            </div>
            <p className='text-sm text-gray-500 leading-relaxed mb-5'>
              {playlist.description}
            </p>

            <a
              href={playlist.playlistUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors duration-200 mb-4'
            >
              <Play className='h-4 w-4 fill-white' />
              Listen on YouTube
            </a>

            <div className='space-y-1 pt-2 border-t border-gray-100'>
              {playlist.links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='block text-sm text-blue-500 hover:text-blue-700 transition-colors mt-3'
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PurposeDrivenLife
