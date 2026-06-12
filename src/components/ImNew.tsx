import NewcomerForm from './NewcomerForm'

const scrollToForm = () => {
  document
    .getElementById('newcomer-form')
    ?.scrollIntoView({ behavior: 'smooth' })
}

const ImNew = () => {
  return (
    <div className='bg-stone-50 min-h-screen py-10'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 space-y-8'>
        <div>
          <p className='text-xs font-medium uppercase tracking-[0.25em] text-stone-400 mb-2'>
            Welcome
          </p>
          <h1 className='text-2xl sm:text-3xl font-semibold text-stone-700 leading-snug'>
            New Here?
          </h1>
        </div>

        <div className='relative rounded-lg overflow-hidden shadow-sm'>
          <video
            src='https://res.cloudinary.com/dz2zqnf2q/video/upload/video/church1.mp4'
            autoPlay
            loop
            muted
            playsInline
            className='w-full object-cover block'
          />
          <div className='absolute inset-0 bg-black/40 flex flex-col justify-end p-6 sm:p-8'>
            <p className='text-2xl font-semibold text-white leading-relaxed'>
              We're really glad you're here.
            </p>
            <p className='text-white/80 leading-relaxed mt-2'>
              Visiting a new church can feel unfamiliar, but our goal is
              simple—to create a welcoming and comfortable space where you can
              explore faith and connect with others.
            </p>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-sm border border-stone-100 p-6 sm:p-8 space-y-4'>
          <h2 className='text-xl font-semibold text-stone-700'>
            What to Expect
          </h2>
          <p className='text-stone-500 leading-relaxed'>
            We are a young and growing church with a diverse, multi-generational
            community. Our English congregation is still in its early stages, and we are excited about the journey ahead as we build a vibrant English-speaking community together.
          </p>
          <p className='text-stone-500 leading-relaxed'>
            Our Sunday services at 11:00am are in Mandarin, with English
            translation available right on your phone. We come together for
            praise and worship, a message, and meaningful time to connect with
            one another.
          </p>
          <hr className='border-stone-300 w-2/3 sm:w-1/2 mx-auto' />
          <p className='text-stone-500 leading-relaxed'>
            While we do not yet have a dedicated English worship service, we are
            actively praying and preparing for one to begin soon. We have a
            heart to build an English or multilingual community where people can
            grow in faith and build meaningful relationships.
          </p>
          <p className='text-stone-500 leading-relaxed'>
            If this vision resonates with you, we warmly invite you to{' '}
            <button
              onClick={scrollToForm}
              className='text-sky-400 hover:text-sky-500 italic transition-colors duration-200'
            >
              join us
            </button>{' '}
            as we take these first steps together. We would love to get to know
            you and{' '}
            <button
              onClick={scrollToForm}
              className='text-sky-400 hover:text-sky-500 italic transition-colors duration-200'
            >
              connect
            </button>
            .
          </p>
        </div>

        <div className='bg-white rounded-lg shadow-sm border border-stone-100 p-6 sm:p-8 space-y-4'>
          <h2 className='text-xl font-semibold text-stone-700'>
            Join Us On Friday
          </h2>
          <p className='text-stone-500 leading-relaxed'>
            We also have an English small group that meets on Fridays—a great
            way to connect and grow in community. To learn more, please visit
            the "Ministries" from the menu bar and explore the Adult Small
            Group, meeting times and other ministry opportunities.
          </p>
          <p className='text-stone-500 leading-relaxed'>
            Whether you've been following Jesus for years, are exploring faith,
            or are simply wondering what your next step might be, we invite you
            to take that next step and{' '}
            <button
              onClick={scrollToForm}
              className='text-sky-400 hover:text-sky-500 italic transition-colors duration-200'
            >
              come visit us
            </button>
            .
          </p>
        </div>
        <NewcomerForm />
      </div>
    </div>
  )
}

export default ImNew
