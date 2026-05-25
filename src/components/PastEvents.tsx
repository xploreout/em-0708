import { Calendar } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

// Shared queue so multiple players don't overwrite each other's onYouTubeIframeAPIReady
const ytPendingInits: (() => void)[] = []

function registerYTPlayer(initFn: () => void) {
  if (window.YT && window.YT.Player) {
    initFn()
    return
  }
  ytPendingInits.push(initFn)
  if (
    !document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
  ) {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  }
  window.onYouTubeIframeAPIReady = () => {
    ytPendingInits.forEach((fn) => fn())
    ytPendingInits.length = 0
  }
}

const LoopingYouTube = ({
  videoId,
  playbackRate = 1,
  startSeconds,
  maxSeconds,
}: {
  videoId: string
  playbackRate?: number
  startSeconds?: number
  maxSeconds?: number
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<{
    setPlaybackRate: (r: number) => void
    seekTo: (s: number) => void
    playVideo: () => void
    destroy: () => void
  } | null>(null)
  const [ended, setEnded] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const start = startSeconds ?? 0
    const initPlayer = () => {
      if (!containerRef.current) return
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          ...(start > 0 && { start }),
          ...(maxSeconds !== undefined && { end: start + maxSeconds }),
        },
        events: {
          onReady: () => {
            playerRef.current?.setPlaybackRate(playbackRate)
          },
          onStateChange: (e: { data: number }) => {
            if (e.data === window.YT.PlayerState.ENDED) {
              if (maxSeconds !== undefined) {
                setEnded(true)
              } else {
                playerRef.current?.seekTo(start)
                playerRef.current?.playVideo()
              }
            }
          },
        },
      })
    }

    registerYTPlayer(initPlayer)

    return () => {
      playerRef.current?.destroy()
    }
  }, [videoId, playbackRate, startSeconds, maxSeconds])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false)
    }
    if (expanded) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [expanded])

  const handleReplay = () => {
    playerRef.current?.seekTo(startSeconds ?? 0)
    playerRef.current?.playVideo()
    setEnded(false)
  }

  const expandSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&modestbranding=1${startSeconds ? `&start=${startSeconds}` : ''}`

  return (
    <div className='absolute inset-0 w-full h-full'>
      <div ref={containerRef} className='absolute inset-0 w-full h-full' />

      {/* Expand button — top-left to avoid YouTube logo (bottom-right) */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setExpanded(true)
        }}
        className='absolute top-2 left-2 z-10 bg-black/50 hover:bg-black/80 text-white rounded p-1 transition'
        title='Expand video'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='w-4 h-4'
        >
          <polyline points='15 3 21 3 21 9' />
          <polyline points='9 21 3 21 3 15' />
          <line x1='21' y1='3' x2='14' y2='10' />
          <line x1='3' y1='21' x2='10' y2='14' />
        </svg>
      </button>

      {ended && (
        <div className='absolute inset-0 flex items-center justify-center bg-black/40'>
          <button
            onClick={handleReplay}
            className='bg-white/90 hover:bg-white text-gray-900 rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='currentColor'
              className='w-7 h-7 ml-1'
            >
              <path d='M8 5v14l11-7z' />
            </svg>
          </button>
        </div>
      )}

      {/* Expanded modal — fixed overlay, stays within the page */}
      {expanded && (
        <div
          className='fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4'
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setExpanded(false)
          }}
        >
          <div
            className='relative w-full max-w-5xl'
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setExpanded(false)
              }}
              className='absolute -top-9 right-0 text-white/80 hover:text-white text-sm font-medium transition'
            >
              ✕ Close
            </button>
            <div
              className='relative w-full'
              style={{ paddingBottom: '56.25%' }}
            >
              <iframe
                src={expandSrc}
                className='absolute inset-0 w-full h-full rounded-xl'
                allowFullScreen
                allow='autoplay; fullscreen'
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

type Video2026 = {
  id: string
  title: string
  subtitle?: string
  maxSeconds?: number
  playbackRate?: number
  startSeconds?: number
  isShort?: boolean
}

const videos2026: Video2026[] = [
  { id: 'bQ4hU9M1uc8', title: 'EM Feud', subtitle: 'Latest', isShort: true },
  { id: 'n9toPMxF8Yw', title: 'Flowers for Mothers', maxSeconds: 20 },
  { id: 'ouhQ2YjhBQQ', title: "Happy Mother's Day", maxSeconds: 3 },
  { id: 'eRqvh6wT2aU', title: 'Volunteer Day', maxSeconds: 3 },
  {
    id: '1Am63VxRy0c',
    title: 'He is Risen',
    subtitle: 'Easter Celebration',
    playbackRate: 0.25,
    maxSeconds: 1,
  },
  {
    id: '5curN9pO0Uw',
    title: 'Red Pockets & Redemption',
    startSeconds: 106,
    maxSeconds: 3,
  },
]

const PastEvents = () => {
  const [featured, setFeatured] = useState<Video2026>(videos2026[0])

  const pastEvents = [
    {
      id: 1,
      title: 'Youth Summer Open House',
      date: 'August',
      // location: "Club House",
      description: '',
      images: [
        './images/IMG_0179.jpg',
        './images/IMG_5482.jpg',
        './images/IMG_5431.jpg',
        './images/IMG_5440.jpg',
      ],
    },
    {
      id: 2,
      title: 'Awana Award Ceremony',
      date: 'August',
      // location: "Club House",
      description: '',
      images: [
        './images/IMG_5814.jpg',
        './images/awanacollage.png',
        './images/IMG_5815.jpg',
        './images/awanayouth.jpg',
      ],
    },
    {
      id: 3,
      title: 'English Ministry Open House',
      date: 'August',
      // location: "Club House",
      description: '',
      images: [
        './images/pic2.JPG',
        './images/pic3.JPG',
        './images/pic4.JPG',
        './images/pic5.JPG',
      ],
    },
  ]

  const PhotoCollage = ({
    images,
    title,
  }: {
    images: string[]
    title: string
  }) => {
    if (images.length === 1) {
      return (
        <img
          src={images[0]}
          alt={title}
          className='w-full h-80 object-cover group-hover:scale-101 transition-transform duration-300'
        />
      )
    }

    if (images.length === 2) {
      return (
        <div className='grid grid-cols-2 gap-1 h-40'>
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${title} ${idx + 1}`}
              className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
            />
          ))}
        </div>
      )
    }

    if (images.length === 3) {
      return (
        <div className='grid grid-cols-2 gap-1 h-40'>
          <img
            src={images[0]}
            alt={`${title} 1`}
            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
          />
          <div className='grid grid-rows-2 gap-1'>
            <img
              src={images[1]}
              alt={`${title} 2`}
              className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
            />
            <img
              src={images[2]}
              alt={`${title} 3`}
              className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
            />
          </div>
        </div>
      )
    }

    if (images.length === 4) {
      return (
        <div className='grid grid-cols-2 gap-1 h-80'>
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${title} ${idx + 1}`}
              className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
            />
          ))}
        </div>
      )
    }

    // 5+ images
    return (
      <div className='grid grid-cols-3 gap-1 h-40'>
        <img
          src={images[0]}
          alt={`${title} 1`}
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
        />
        <img
          src={images[1]}
          alt={`${title} 2`}
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
        />
        <div className='relative'>
          <img
            src={images[2]}
            alt={`${title} 3`}
            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
          />
          {images.length > 3 && (
            <div className='absolute inset-0 bg-black/60 flex items-center justify-center'>
              <span className='text-white font-bold text-lg'>
                +{images.length - 3}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16'>
        {/* Header */}
        <div className='mt-4 mb-8 pt-16'>
          <h2 className='px-4 text-xl font-bold text-gray-900 uppercase tracking-widest mb-4'>
            Past Events
          </h2>
        </div>

        {/* 2026 section */}
        <div className='mb-2 -mx-4 sm:-mx-6 lg:-mx-8'>
          <div className='h-px bg-gray-200 w-full' />
        </div>
        <div className='pt-6 mb-10'>
          <h3 className='px-4 text-xl font-bold text-gray-900 uppercase tracking-widest mb-6'>
            2026
          </h3>
          <div className='flex flex-col md:flex-row gap-4'>
            {/* Featured video — ~1/3 page width */}
            <div className='md:w-1/3 shrink-0 flex justify-center md:justify-start'>
              {featured.isShort ? (
                /* Portrait Short — fills frame edge-to-edge, no letterbox */
                <div
                  className='relative rounded-2xl overflow-hidden shadow-xl bg-black'
                  style={{ width: '260px', height: '462px' }}
                >
                  <iframe
                    key={featured.id}
                    src={`https://www.youtube.com/embed/${featured.id}?autoplay=1&mute=1&loop=1&playlist=${featured.id}&rel=0&modestbranding=1&playsinline=1`}
                    className='absolute inset-0 w-full h-full border-0'
                    allow='autoplay; fullscreen'
                    allowFullScreen
                  />
                  <div className='absolute bottom-0 left-0 right-0 px-3 pb-3 pointer-events-none' style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}>
                    <p className='text-white font-bold text-sm drop-shadow'>{featured.title}</p>
                    {featured.subtitle && (
                      <p className='text-white/70 text-xs drop-shadow'>{featured.subtitle}</p>
                    )}
                  </div>
                  <a
                    href={`https://youtube.com/shorts/${featured.id}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='absolute top-2 right-2 bg-black/50 hover:bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-full transition'
                  >
                    ↗ Open
                  </a>
                </div>
              ) : (
                <a
                  href={`https://youtu.be/${featured.id}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl block group w-full'
                >
                  <div className='relative w-full' style={{ paddingBottom: '56.25%' }}>
                    <LoopingYouTube
                      key={featured.id}
                      videoId={featured.id}
                      maxSeconds={featured.maxSeconds}
                      playbackRate={featured.playbackRate}
                      startSeconds={featured.startSeconds}
                    />
                    <div className='absolute inset-0 bg-black/30 flex flex-col items-center justify-center p-4 pointer-events-none'>
                      <p className='text-white text-center font-bold text-xl leading-snug drop-shadow'>
                        {featured.title}
                      </p>
                      {featured.subtitle && (
                        <p className='text-white/80 text-center text-sm mt-1 drop-shadow'>
                          {featured.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </a>
              )}
            </div>

            {/* Side thumbnails — click to feature */}
            <div className='flex-1 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-2 content-start'>
              {videos2026
                .filter((v) => v.id !== featured.id)
                .map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setFeatured(video)}
                    className='relative w-full rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow group'
                  >
                    <div
                      className='relative w-full'
                      style={{ paddingBottom: '56.25%' }}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                        alt={video.title}
                        className='absolute inset-0 w-full h-full object-cover'
                      />
                      <div className='absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center'>
                        <svg
                          viewBox='0 0 24 24'
                          fill='white'
                          className='w-8 h-8 opacity-80'
                        >
                          <path d='M8 5v14l11-7z' />
                        </svg>
                      </div>
                      {video.isShort && (
                        <span className='absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none tracking-wide'>
                          SHORT
                        </span>
                      )}
                      <p className='absolute bottom-0 left-0 right-0 text-white text-[10px] font-semibold text-center px-1 pb-1 drop-shadow leading-tight'>
                        {video.title}
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* 2025 section */}
        <div className='mb-2 -mx-4 sm:-mx-6 lg:-mx-8'>
          <div className='h-px bg-gray-200 w-full' />
        </div>
        <div className='pt-6'>
          <h3 className='px-4 text-xl font-bold text-gray-900 uppercase tracking-widest mb-6'>
            2025
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            {pastEvents.map((event) => (
              <div
                key={event.id}
                className='bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group relative'
              >
                <div className='relative'>
                  <PhotoCollage images={event.images} title={event.title} />
                  <div className='absolute bottom-0 left-0 right-0 p-4'>
                    <h4 className='text-sm font-bold text-white mb-1 opacity-70'>
                      {event.title}
                    </h4>
                    <div className='flex items-center text-white/90 text-xs mb-1 opacity-70'>
                      <Calendar className='h-3 w-3 mr-1' />
                      <span>{event.date}</span>
                    </div>
                  </div>
                </div>
                <div className='p-3'>
                  <p className='text-gray-600 text-xs'>{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default PastEvents
