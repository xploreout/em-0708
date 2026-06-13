import NewcomerForm from './NewcomerForm'
import { useLang } from '../context/LanguageContext'
import { t, tx } from '../i18n/translations'

const scrollToForm = () => {
  document
    .getElementById('newcomer-form')
    ?.scrollIntoView({ behavior: 'smooth' })
}

const ImNew = () => {
  const { lang } = useLang()

  return (
    <div className='bg-stone-50 min-h-screen py-10'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 space-y-8'>
        <div>
          <p className='text-xs font-medium uppercase tracking-[0.25em] text-stone-400 mb-2'>
            {tx(t.imNew.label, lang)}
          </p>
          <h1 className='text-2xl sm:text-3xl font-semibold text-stone-700 leading-snug'>
            {tx(t.imNew.title, lang)}
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
              {tx(t.imNew.heroTitle, lang)}
            </p>
            <p className='text-white/80 leading-relaxed mt-2'>
              {tx(t.imNew.heroText, lang)}
            </p>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-sm border border-stone-100 p-6 sm:p-8 space-y-4'>
          <h2 className='text-xl font-semibold text-stone-700'>
            {tx(t.imNew.whatToExpect, lang)}
          </h2>
          <p className='text-stone-500 leading-relaxed'>
            {tx(t.imNew.expect1, lang)}
          </p>
          <p className='text-stone-500 leading-relaxed'>
            {tx(t.imNew.expect2, lang)}
          </p>
          <hr className='border-stone-300 w-2/3 sm:w-1/2 mx-auto' />
          <p className='text-stone-500 leading-relaxed'>
            {tx(t.imNew.expect3, lang)}
          </p>
          <p className='text-stone-500 leading-relaxed'>
            {tx(t.imNew.expect4Pre, lang)}{' '}
            <button
              onClick={scrollToForm}
              className='text-sky-400 hover:text-sky-500 italic transition-colors duration-200'
            >
              {tx(t.imNew.joinUs, lang)}
            </button>{' '}
            {tx(t.imNew.expect4Mid, lang)}{' '}
            <button
              onClick={scrollToForm}
              className='text-sky-400 hover:text-sky-500 italic transition-colors duration-200'
            >
              {tx(t.imNew.connect, lang)}
            </button>
            .
          </p>
        </div>

        <div className='bg-white rounded-lg shadow-sm border border-stone-100 p-6 sm:p-8 space-y-4'>
          <h2 className='text-xl font-semibold text-stone-700'>
            {tx(t.imNew.joinFriday, lang)}
          </h2>
          <p className='text-stone-500 leading-relaxed'>
            {tx(t.imNew.friday1, lang)}
          </p>
          <p className='text-stone-500 leading-relaxed'>
            {tx(t.imNew.friday2Pre, lang)}{' '}
            <button
              onClick={scrollToForm}
              className='text-sky-400 hover:text-sky-500 italic transition-colors duration-200'
            >
              {tx(t.imNew.comeVisit, lang)}
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
