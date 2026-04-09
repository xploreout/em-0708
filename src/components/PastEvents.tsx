import { Calendar } from 'lucide-react'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

const LoopingYouTube = ({ videoId }: { videoId: string }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)

  useEffect(() => {
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
        },
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
    } else {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
      window.onYouTubeIframeAPIReady = initPlayer
    }

    return () => {
      playerRef.current?.destroy()
    }
  }, [videoId])

  return <div ref={containerRef} className='absolute inset-0 w-full h-full' />
}

const PastEvents = () => {
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
          <h3 className='px-4 text-xl font-bold text-gray-900 uppercase tracking-widest mb-6'>2026</h3>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <a
              href='https://youtu.be/1Am63VxRy0c'
              target='_blank'
              rel='noopener noreferrer'
              className='bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl block group'
            >
              <div className='relative w-full' style={{ paddingBottom: '56.25%' }}>
                <LoopingYouTube videoId='1Am63VxRy0c' />
                <div className='absolute inset-0 bg-black/30 flex flex-col items-center justify-center p-4 pointer-events-none'>
                  <p className='text-white text-center font-bold text-xl leading-snug drop-shadow'>
                    He is Risen
                  </p>
                  <p className='text-white/80 text-center text-sm mt-1 drop-shadow'>
                    Easter Celebration
                  </p>
                </div>
              </div>
            </a>

            <div className='bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl'>
              <div className='relative w-full' style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src='https://www.youtube.com/embed/5curN9pO0Uw?color=white'
                  title='Red Pockets & Redemption'
                  className='absolute inset-0 w-full h-full rounded-xl'
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        {/* 2025 section */}
        <div className='mb-2 -mx-4 sm:-mx-6 lg:-mx-8'>
          <div className='h-px bg-gray-200 w-full' />
        </div>
        <div className='pt-6'>
          <h3 className='px-4 text-xl font-bold text-gray-900 uppercase tracking-widest mb-6'>2025</h3>
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
                  <p className='text-gray-600 text-xs'>
                    {event.description}
                  </p>
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
