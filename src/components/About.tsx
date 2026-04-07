import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

const About = () => {
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  const milestones = [
    {
      year: '2021',
      text: 'Established by a group of brothers and sisters who shared a vision to build a Christ-centered community in our local area.',
    },
    {
      year: '2022',
      text: 'Blessed by the arrival of Pastor Peng, whose leadership and shepherding have been a great encouragement to our church family.',
    },
    {
      year: '2025',
      text: 'Our English ministry was launched with a heart to serve the next generation — strengthening faith and building meaningful relationships among youth and young adults.',
    },
    {
      year: 'Now',
      text: 'We are prayerfully seeking a part-time or full-time servant to join the ministry, and we look forward to the upcoming launch of our English Worship Service. Join us during this special season.',
    },
  ]

  return (
    <div className='bg-stone-50 min-h-screen py-10'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 space-y-8'>
        {/* Hero */}
        <div>
          <p className='text-xs font-medium uppercase tracking-[0.25em] text-stone-400 mb-2'>
            Who We Are
          </p>
          <h1 className='text-2xl sm:text-3xl font-semibold text-stone-700 leading-snug'>
            About Us
          </h1>
        </div>

        {/* Photo + Intro */}
        <div
          className='rounded-2xl border border-stone-200 shadow-sm overflow-hidden relative min-h-72 sm:min-h-80'
          style={{
            backgroundImage: 'url(./images/acbccgrp.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        >
          <div className='absolute inset-0 bg-stone-900/50' />
          <div className='absolute inset-0 p-6 sm:p-10 flex items-center justify-center text-center'>
            <p
              className='text-white/70 text-xs sm:text-lg leading-snug uppercase tracking-wide sm:tracking-widest font-bold'
              style={{ fontFamily: '"Roboto", sans-serif' }}
            >
              We are a non-denominational church established in 2021 by a group
              of brothers and sisters who shared a vision to build a
              Christ-centered community in our local area. What began as a small
              gathering has grown into a place where people come together to
              worship, connect, and grow in faith.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className='bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8'>
          <p className='text-xs font-medium uppercase tracking-[0.2em] text-stone-400 mb-6'>
            Our Story
          </p>
          <div className='relative border-l border-stone-200 pl-7 space-y-7'>
            {milestones.map((m) => (
              <div key={m.year} className='relative'>
                <span className='absolute -left-[2.5rem] flex items-center justify-center w-8 h-8 rounded-full bg-stone-100 border border-stone-300 text-stone-400 text-xs font-semibold'>
                  {m.year}
                </span>
                <p className='text-sm text-stone-600 leading-relaxed pt-1'>
                  {m.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Today + Location */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          <div className='bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8'>
            <p className='text-xs font-medium uppercase tracking-[0.2em] text-stone-400 mb-3'>
              Today
            </p>
            <p className='text-sm text-stone-600 leading-relaxed'>
              We are a multi-generational and multicultural church, seeking to
              create a space where everyone — no matter their background — can
              explore faith, grow spiritually, and experience genuine community.
            </p>
          </div>

          <div className='bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8'>
            <p className='text-xs font-medium uppercase tracking-[0.2em] text-stone-400 mb-3'>
              Location
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
                  Georgia United Korean SDA Church
                </p>
              </div>
            </div>
            <p className='text-sm text-stone-600 leading-relaxed'>
              We currently rent space at Georgia United Korean SDA Church. As
              our ministry continues to grow, we have begun a building
              initiative and are actively seeking a more suitable venue.
            </p>
          </div>
        </div>

        {/* Welcome */}
        <div ref={ref} className='bg-stone-800 rounded-2xl p-8 sm:p-12 text-center'>
          <p
            className='text-stone-400 text-sm sm:text-base uppercase tracking-widest mb-4'
            style={{ fontFamily: '"Roboto", sans-serif' }}
          >
            Whether you are new to church, returning to faith, or looking for a place to belong —
          </p>
          <p
            className={`text-sm sm:text-base font-semibold uppercase tracking-widest text-white ${started ? 'fade-in-text' : 'opacity-0'}`}
            style={{ fontFamily: '"Roboto", sans-serif' }}
          >
            You are always welcome here.
          </p>
        </div>
      </div>
    </div>
  )
}

export default About
