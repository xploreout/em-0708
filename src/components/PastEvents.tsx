import { Calendar } from 'lucide-react'

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
        <div className='text-center mb-16 mt-50'>
          <h2 className='px-20 text-4xl md:text-4xl font-bold text-gray-900 mb-4'>
            <br />
            <span>Past Activities</span>
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'></p>
        </div>

        {/* Past Events */}
        <>
          <div className='mb-10'>
            <div className='p-4 w-full md:w-2/5'>
              <div className='bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl'>
                <div className='aspect-video w-full'>
                  <iframe
                    src='https://www.youtube.com/embed/l2zWtUVklm8'
                    title='Red Pockets & Redemption'
                    className='w-full h-full rounded-xl'
                    allowFullScreen
                  ></iframe>
                </div>
                {/* <p
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    window.open('https://youtu.be/l2zWtUVklm8', '_blank')
                  }
                  className='text-sm text-blue-400  mb-4'
                >
                  Red Pockets & Redemption
                </p> */}
              </div>
            </div>
          </div>
        </>
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {pastEvents.map((event) => (
              <div
                key={event.id}
                className='bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group relative'
              >
                <div className='relative'>
                  <PhotoCollage images={event.images} title={event.title} />
                  {/* Event Details Overlay */}
                  <div className='absolute bottom-0 left-0 right-0   p-4'>
                    <h4 className='text-lg font-bold text-white mb-1 opacity-70'>
                      {event.title}
                    </h4>
                    <div className='flex items-center text-white/90 text-sm mb-1 opacity-70'>
                      <Calendar className='h-3 w-3 mr-1' />
                      <span>{event.date}</span>
                    </div>
                  </div>
                </div>
                <div className='p-4'>
                  <p className='text-gray-600 mb-3 text-sm'>
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      </div>
    </>
  )
}

export default PastEvents
