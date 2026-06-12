import { useEffect, useRef } from 'react'
import Header from './Header'
import Hero from './Hero'
import Footer from './Footer'

function MainPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio('https://res.cloudinary.com/dz2zqnf2q/video/upload/audio/It_is_finished.mp3')
    audio.volume = 0.15
    audioRef.current = audio

    let played = false

    const startPlayback = () => {
      if (played) return
      played = true
      audio.play().catch(() => {})
      window.removeEventListener('click', startPlayback)
      window.removeEventListener('scroll', startPlayback)
      window.removeEventListener('keydown', startPlayback)
      window.removeEventListener('touchstart', startPlayback)
    }

    window.addEventListener('click', startPlayback)
    window.addEventListener('scroll', startPlayback)
    window.addEventListener('keydown', startPlayback)
    window.addEventListener('touchstart', startPlayback)

    return () => {
      audio.pause()
      window.removeEventListener('click', startPlayback)
      window.removeEventListener('scroll', startPlayback)
      window.removeEventListener('keydown', startPlayback)
      window.removeEventListener('touchstart', startPlayback)
    }
  }, [])

  return (
    <>
      <Header />
      <main>
        <Hero />
      </main>
      <Footer />
    </>
  )
}

export default MainPage
