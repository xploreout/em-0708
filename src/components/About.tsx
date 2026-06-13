import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { t, tx } from '../i18n/translations'

const About = () => {
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { lang } = useLang()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStarted(true)
      },
      { threshold: 0.5 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const milestones = [
    { year: '2021', textKey: 'milestone2021' as const },
    { year: '2022', textKey: 'milestone2022' as const },
    { year: '2025', textKey: 'milestone2025' as const },
    { year: 'Now',  textKey: 'milestoneNow'  as const },
  ]

  return (
    <div className='bg-stone-50 min-h-screen py-10'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 space-y-8'>
        {/* Hero */}
        <div>
          <p className='text-xs font-medium uppercase tracking-[0.25em] text-stone-400 mb-2'>
            {tx(t.about.label, lang)}
          </p>
          <h1 className='text-2xl sm:text-3xl font-semibold text-stone-700 leading-snug'>
            {tx(t.about.title, lang)}
          </h1>
        </div>

        {/* Photo + Intro */}
        <div
          className='rounded-lg border border-stone-200 shadow-sm overflow-hidden relative min-h-72 sm:min-h-80'
          style={{
            backgroundImage: 'url(./images/acbccgrp.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        >
          <div className='absolute inset-0 bg-stone-900/50' />
          <div className='absolute inset-0 p-6 sm:p-10 flex items-center justify-center text-center'>
            <p
              className='text-white/70 text-sm sm:text-lg leading-snug uppercase tracking-wide sm:tracking-widest font-bold'
              style={{ fontFamily: '"Roboto", sans-serif' }}
            >
              {tx(t.about.photoText, lang)}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className='bg-white rounded-lg border border-stone-200 shadow-sm p-6 sm:p-8'>
          <p className='text-xs font-medium uppercase tracking-[0.2em] text-stone-400 mb-6'>
            {tx(t.about.ourStory, lang)}
          </p>
          <div className='relative border-l border-stone-200 pl-7 space-y-7'>
            {milestones.map((m) => (
              <div key={m.year} className='relative'>
                <span className='absolute -left-[2.5rem] flex items-center justify-center w-8 h-8 rounded-full bg-stone-100 border border-stone-300 text-stone-400 text-xs font-semibold'>
                  {m.year}
                </span>
                <p className='text-sm text-stone-600 leading-relaxed pt-1'>
                  {tx(t.about[m.textKey], lang)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Today + Location */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          <div className='bg-white rounded-lg border border-stone-200 shadow-sm p-6 sm:p-8'>
            <p className='text-xs font-medium uppercase tracking-[0.2em] text-stone-400 mb-3'>
              {tx(t.about.today, lang)}
            </p>
            <p className='text-sm text-stone-600 leading-relaxed'>
              {tx(t.about.todayText, lang)}
            </p>
          </div>

          <div className='bg-white rounded-lg border border-stone-200 shadow-sm p-6 sm:p-8'>
            <p className='text-xs font-medium uppercase tracking-[0.2em] text-stone-400 mb-3'>
              {tx(t.about.location, lang)}
            </p>
            <div className='flex items-start gap-3 mb-3'>
              <MapPin className='h-4 w-4 text-stone-400 shrink-0 mt-0.5' />
              <div>
                <a
                  href='https://www.google.com/maps/search/?api=1&query=2965+Duluth+Hwy+Duluth+GA+30096'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-sm text-stone-700 font-medium hover:text-blue-500 transition-colors'
                >
                  2965 Duluth Hwy, Duluth, GA 30096
                </a>
                <p className='text-xs text-stone-400 mt-0.5'>
                  {tx(t.about.locationNote, lang)}
                </p>
              </div>
            </div>
            <p className='text-sm text-stone-600 leading-relaxed'>
              {tx(t.about.locationText, lang)}
            </p>
          </div>
        </div>

        {/* Welcome */}
        <div
          ref={ref}
          className='bg-stone-800 rounded-lg p-8 sm:p-12 text-center'
        >
          <p
            className='text-stone-400 text-sm sm:text-base uppercase tracking-widest mb-4'
            style={{ fontFamily: '"Roboto", sans-serif' }}
          >
            {tx(t.about.welcomeLabel, lang)}
          </p>
          <p
            className={`text-sm sm:text-base font-semibold uppercase tracking-widest text-white ${started ? 'fade-in-text' : 'opacity-0'}`}
            style={{ fontFamily: '"Roboto", sans-serif' }}
          >
            {tx(t.about.welcomeText, lang)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default About
