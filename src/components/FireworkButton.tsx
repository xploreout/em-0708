import React from 'react'
import { Heart } from 'lucide-react'
import confetti from 'canvas-confetti'

const FireworkButton: React.FC = () => {
  const handleClick = () => {
    // Single firework burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })

    // Optional: multiple bursts for a more dynamic effect
    const duration = 1000 // 1 second
    const animationEnd = Date.now() + duration

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        return
      }

      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        particleCount: 60,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2,
        },
      })
    }, 250)
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <Heart
        className='h-5 w-5 text-pink-800 animate-pulse'
        onClick={handleClick}
      />
    </div>
  )
}

export default FireworkButton
