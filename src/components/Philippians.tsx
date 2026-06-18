import { useState } from 'react'
import { Clock, Play } from 'lucide-react'
import { Link } from 'react-router-dom'

const getVideoId = (url: string): string => {
  const shortMatch = url.match(/youtu\.be\/([\w-]+)/)
  if (shortMatch) return shortMatch[1]
  const watchMatch = url.match(/[?&]v=([\w-]+)/)
  if (watchMatch) return watchMatch[1]
  return ''
}

const toEmbedUrl = (url: string): string => {
  const id = getVideoId(url)
  if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&color=white`
  return url
}

interface Episode {
  id: number
  title: string
  description: string
  duration: string
  videoUrl: string
  links: { label: string; url: string }[]
}

const episodes: Episode[] = [
  {
    id: 1,
    title: 'Philippians – Session 1',
    description: '',
    duration: '',
    videoUrl: 'https://youtu.be/axgYHkUQ19c',
    links: [],
  },
]

const VideoCard = ({ ep }: { ep: Episode }) => {
  const [playing, setPlaying] = useState(false)
  const videoId = getVideoId(ep.videoUrl)
  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

  return (
    <div className='bg-gray-50 rounded-lg overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col'>
      <div className='aspect-video w-full relative'>
        {playing ? (
          <iframe
            src={toEmbedUrl(ep.videoUrl)}
            title={ep.title}
            className='w-full h-full'
            allowFullScreen
            allow='autoplay'
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className='w-full h-full relative group block'
            aria-label={`Play ${ep.title}`}
          >
            <img
              src={thumbnail}
              alt={ep.title}
              className='w-full h-full object-cover'
            />
            <div className='absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center'>
              <div className='bg-white rounded-full p-4 shadow-lg group-hover:scale-110 transition-transform duration-200'>
                <Play className='h-7 w-7 text-gray-900 fill-gray-900' />
              </div>
            </div>
          </button>
        )}
      </div>
      <div className='p-5 flex flex-col flex-1'>
        <h4 className='text-base font-semibold text-gray-900 mb-1'>
          {ep.title}
        </h4>
        <div className='flex items-center gap-1.5 text-xs text-gray-400 mb-3'>
          <Clock className='h-3 w-3' />
          <span>{ep.duration}</span>
        </div>
        <p className='text-sm text-gray-500 leading-relaxed mb-4 flex-1'>
          {ep.description}
        </p>
        <div className='space-y-1'>
          {ep.links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target='_blank'
              rel='noopener noreferrer'
              className='block text-sm text-blue-500 hover:text-blue-700 transition-colors'
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

const Philippians = () => {
  return (
    <section className='py-20 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <Link
          to='/resources/adult-small-group'
          className='inline-flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-700 transition-colors mb-8'
        >
          ← Back to Adult Small Group
        </Link>

        <div className='text-left mb-14'>
          <h2 className='text-xl font-bold text-gray-900 uppercase tracking-widest'>
            Book of Philippians
          </h2>
          <p className='text-gray-500 mt-3 max-w-xl text-sm'>
            A study on Paul's letter to the Philippians — exploring themes of
            joy, unity, and living as citizens of heaven.
          </p>
        </div>

        {episodes.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {episodes.map((ep) => (
              <VideoCard key={ep.id} ep={ep} />
            ))}
          </div>
        ) : (
          <div className='text-center py-20 text-gray-400 text-sm'>
            Resources coming soon.
          </div>
        )}
      </div>
    </section>
  )
}

export default Philippians
