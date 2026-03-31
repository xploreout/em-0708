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

const episodes = [
  {
    id: 1,
    title: 'Basics of Faith – Episode 1',
    description: 'What is faith? Who is Jesus? Why is Jesus important?',
    duration: '6 min',
    videoUrl: 'https://youtu.be/kFh3dHvAsLE?si=CAAxMMNpuyOe5Dfj',
    links: [
      { label: 'Conversation Guide', url: '/images/whatsmean1.jpg' },
      {
        label: "Let's Unpack These 3 Myths About Life as a Christian",
        url: 'https://finds.life.church/myths-life-as-a-christian/',
      },
      {
        label:
          'A guide to Spiritual Disciplines to Help You Grow Closer to God',
        url: 'https://finds.life.church/spiritual-disciplines/',
      },
    ],
  },
  {
    id: 2,
    title: 'Basics of Faith – Episode 2',
    description: 'How to pray to God?',
    duration: '6 min',
    videoUrl: 'https://youtu.be/yc5DT0li4V0?si=MKqTMSiadp9Qfh0j',
    links: [
      { label: 'Conversation Guide', url: '/images/mean2.jpg' },
      {
        label: 'What is Prayer and How Do I Pray to God?',
        url: 'https://finds.life.church/what-is-prayer/',
      },
    ],
  },
  {
    id: 3,
    title: 'Basics of Faith – Episode 3',
    description:
      'What is faith? Why is faith important? How can we grow in our faith? This series explores the basics of Christian faith and how to apply it daily.',
    duration: '6 min',
    videoUrl: 'https://youtu.be/eu-VtkMFaow?si=6aOr-6lZFy_g6V8R',
    links: [
      { label: 'Conversation Guide', url: '/images/resource3.jpg' },
      {
        label: 'Worship in the Bible is about more than singing',
        url: 'https://finds.life.church/worship-in-the-bible/',
      },
      {
        label: 'Losing Faith in God, this is for You',
        url: 'https://finds.life.church/losing-faith-in-god/',
      },
    ],
  },
  {
    id: 4,
    title: 'Basics of Faith – Episode 4',
    description:
      'How Does the Bible Apply to Me Today? Reading and understanding the Bible can feel intimidating. But the story of the Bible is amazing, and the impact it can have on your life is immeasurable.',
    duration: '6 min',
    videoUrl: 'https://youtu.be/C_LjTe-3BLs?si=4jt8cix3VPNjLGRQ',
    links: [
      { label: 'Conversation Guide', url: '/images/mean4.jpg' },
      {
        label: 'How to Get to Know God Better, Starting Today',
        url: 'https://finds.life.church/get-to-know-god/',
      },
    ],
  },
  {
    id: 5,
    title: 'Basics of Faith – Episode 5',
    description:
      'Find Community When It Feels Ackward. Is faith just between you and God? Or do other people have something to do with it? Let’s talk about it.',
    duration: '6 min',
    videoUrl: 'https://youtu.be/G3uOSrGCNbU?si=SbBL58DJuOeD4yJS',
    links: [
      { label: 'Conversation Guide', url: '/images/mean5.jpg' },
      {
        label: 'Wondering How to Change Your Life? Look to God and People',
        url: 'https://finds.life.church/how-to-change-your-life/',
      },
    ],
  },
  {
    id: 6,
    title: 'Basics of Faith – Episode 6',
    description:
      'How Slowing Down Can Bring You Closer to God? The busier life gets, the harder it can be to slow down and rest. But rest is something we all desperately need. And Jesus modeled some of the best ways for us to find it.',
    duration: '6 min',
    videoUrl: 'https://youtu.be/apLNoPNfwMQ?si=JpuJdF-JLd1_WGqe',
    links: [
      { label: 'Conversation Guide', url: '/images/mean6.jpg' },
      {
        label: 'Jesus Rests, So You Can Too. Here’s How to Start Slowing Down',
        url: 'https://finds.life.church/jesus-rests/',
      },
    ],
  },
]

const VideoCard = ({ ep }: { ep: (typeof episodes)[0] }) => {
  const [playing, setPlaying] = useState(false)
  const videoId = getVideoId(ep.videoUrl)
  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

  return (
    <div className='bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col'>
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

const BasicsOfFaith = () => {
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
        <div className='text-left mb-14'>
          <h2 className='text-xl font-bold text-gray-900 uppercase tracking-widest'>
            Basics of Faith
          </h2>
          <p className='text-gray-500 mt-3 max-w-xl text-sm'>
            A video series exploring the foundations of Christian faith — who
            Jesus is, what faith means, and how to grow spiritually.
          </p>
        </div>

        {/* Episode cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {episodes.map((ep) => (
            <VideoCard key={ep.id} ep={ep} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default BasicsOfFaith
