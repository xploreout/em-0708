import { useEffect, useRef } from 'react'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { upcomingEvents } from '../data/events'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { t, tx } from '../i18n/translations'

declare global {
  interface Window { YT: any; onYouTubeIframeAPIReady: () => void }
}

const LoopingYouTube = ({ videoId }: { videoId: string }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)

  useEffect(() => {
    const initPlayer = () => {
      if (!containerRef.current) return
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: { autoplay: 1, mute: 1, controls: 1, modestbranding: 1, rel: 0, playsinline: 1 },
        events: {
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.ENDED) {
              playerRef.current?.seekTo(0)
              playerRef.current?.playVideo()
            }
          },
        },
      })
    }
    if (window.YT && window.YT.Player) {
      initPlayer()
    } else if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
      window.onYouTubeIframeAPIReady = initPlayer
    } else {
      window.onYouTubeIframeAPIReady = initPlayer
    }
    return () => { playerRef.current?.destroy() }
  }, [videoId])

  return <div ref={containerRef} className='w-full h-full' />
}

const Children = () => {
  const navigate = useNavigate()
  const { lang } = useLang()

  const goToContact = () => {
    navigate('/im-new')
    setTimeout(() => document.getElementById('newcomer-form')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }
  const childrenIds = [9, 10, 11]
  const childrenEvents = childrenIds.map((id) => upcomingEvents.find((e) => e.id === id)!).filter(Boolean)

  return (
    <section className='py-10 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-left mb-14'>
          <h2 className='text-xl font-bold text-gray-900 uppercase tracking-widest'>
            {tx(t.children.title, lang)}
          </h2>
          <p className='text-xl text-gray-500 mt-2 opacity-80'>
            {tx(t.children.subtitle, lang)}
          </p>
        </div>

        <div className='flex flex-col md:flex-row gap-8 items-start'>
          {/* Video */}
          <div className='w-full md:w-1/2 rounded-lg overflow-hidden shadow-md aspect-video'>
            <LoopingYouTube videoId='xHtr34Kr0j4' />
          </div>

          {/* Text */}
          <div className='w-full md:w-1/2 text-gray-600 leading-relaxed space-y-4'>
            <p>{tx(t.children.text1, lang)}</p>
            <p>{tx(t.children.text2, lang)}</p>
            <p>{tx(t.children.text3, lang)}</p>
            <p>
              {tx(t.children.contactPre, lang)}{' '}
              <button
                onClick={goToContact}
                className='text-sky-400 hover:text-sky-500 italic transition-colors duration-200'
              >
                {tx(t.children.contactLink, lang)}
              </button>
              .
            </p>
          </div>
        </div>
        {/* Event cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10'>
          {childrenEvents.map((event) => (
            <div
              key={event.id}
              className='bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm flex flex-col'
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
                <img src={event.image} alt={event.title} className='w-full h-32 object-cover' />
              )}
              <div className='p-4 flex flex-col flex-1'>
                <h3 className='text-base font-semibold text-gray-900 mb-2 leading-snug'>{event.title}</h3>
                <p className='text-sm text-gray-500 leading-relaxed mb-3'>{event.description}</p>
                <div className='space-y-1 mt-auto'>
                  <div className='flex items-center gap-1.5 text-sm text-gray-600'>
                    <Calendar className='h-3.5 w-3.5 shrink-0' />
                    <span>{event.date}</span>
                  </div>
                  <div className='flex items-center gap-1.5 text-sm text-gray-600'>
                    <Clock className='h-3.5 w-3.5 shrink-0' />
                    <span>{event.time}</span>
                  </div>
                  <div className='flex items-center gap-1.5 text-sm text-gray-600'>
                    <MapPin className='h-3.5 w-3.5 shrink-0' />
                    {event.mapUrl ? (
                      <a
                        href={event.mapUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='hover:text-blue-600'
                      >
                        {event.location}
                      </a>
                    ) : (
                      <span>{event.location}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Children
