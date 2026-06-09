import { useState, useRef, useEffect } from 'react'
import confetti from 'canvas-confetti'
import { parseCSV } from './EmFeudForm'

type Answer = { text: string; points: number }
type QuestionData = { question: string; answers: Answer[] }

const QUESTIONS: QuestionData[] = [
  {
    question: "Name something people do when the sermon runs a bit long",
    answers: [
      { text: "Check their phone", points: 38 },
      { text: "Take notes", points: 22 },
      { text: "Doodle / draw", points: 16 },
      { text: "Look around", points: 12 },
      { text: "Nap / doze off", points: 8 },
      { text: "Count ceiling tiles", points: 4 },
    ],
  },
  {
    question: "Name a reason someone arrives late to Sunday service",
    answers: [
      { text: "Parking", points: 35 },
      { text: "Oversleeping", points: 28 },
      { text: "Getting kids ready", points: 18 },
      { text: "Traffic", points: 12 },
      { text: "Forgot something at home", points: 5 },
      { text: "GPS took them the wrong way", points: 2 },
    ],
  },
  {
    question: "Name a popular dish at EM fellowship potluck",
    answers: [
      { text: "Fried rice", points: 42 },
      { text: "Pasta / Lasagna", points: 25 },
      { text: "Chicken wings", points: 15 },
      { text: "Salad", points: 10 },
      { text: "Cake / Dessert", points: 6 },
      { text: "Dumplings", points: 2 },
    ],
  },
  {
    question: "Name an excuse people give to skip small group",
    answers: [
      { text: "Work / overtime", points: 40 },
      { text: "Too tired", points: 28 },
      { text: "Sick", points: 18 },
      { text: "Family event", points: 8 },
      { text: "Forgot", points: 4 },
      { text: "Traffic", points: 2 },
    ],
  },
  {
    question: "Name something EM members stress about before a big church event",
    answers: [
      { text: "Not enough food", points: 35 },
      { text: "Mic / projector issues", points: 28 },
      { text: "Low attendance", points: 20 },
      { text: "Forgetting lines / lyrics", points: 10 },
      { text: "Running over time", points: 5 },
      { text: "Weather", points: 2 },
    ],
  },
  {
    question: "Name something you always find at a church BBQ",
    answers: [
      { text: "Burgers & hot dogs", points: 36 },
      { text: "Watermelon", points: 24 },
      { text: "Corn on the cob", points: 18 },
      { text: "Potato salad", points: 12 },
      { text: "Kids running everywhere", points: 7 },
      { text: "Someone burning the food", points: 3 },
    ],
  },
]

// round: who is actively playing (0 or 1); stealMode = after 3 strikes other team guesses
type RoundState = {
  revealed: boolean[]
  strikes: number
  stealMode: boolean
  awarded: boolean
  winnerTeam: number | null
}

function makeRound(q: QuestionData): RoundState {
  return {
    revealed: new Array(q.answers.length).fill(false),
    strikes: 0,
    stealMode: false,
    awarded: false,
    winnerTeam: null,
  }
}

// ── Global CSS injected once ──────────────────────────────────────────────────

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
  @keyframes strikeChar {
    0%   { opacity: 0; transform: translateY(-12px) scale(1.6); }
    55%  { transform: translateY(2px) scale(0.88); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes cursorBlink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  @keyframes floatBlob {
    0%, 100% { transform: translateY(0) scale(1); }
    50%       { transform: translateY(-24px) scale(1.05); }
  }
  @keyframes popIn {
    0%   { opacity: 0; transform: scale(0.7); }
    70%  { transform: scale(1.08); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
`

// ── Typewriter ────────────────────────────────────────────────────────────────

function TypewriterText({ text, speed = 40, className = '' }: { text: string; speed?: number; className?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(0)
    if (!text) return
    let i = 0
    const id = setInterval(() => {
      i++
      setCount(i)
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  const typing = count < text.length

  return (
    <span aria-label={text} className={`inline ${className}`}>
      {text.slice(0, count).split('').map((char, i) => (
        <span key={i} className="inline-block" style={{ animation: 'strikeChar 0.13s cubic-bezier(0.22,1,0.36,1) both' }}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
      {typing && (
        <span
          className="inline-block w-0.5 bg-amber-400 ml-px align-middle"
          style={{ height: '1em', animation: 'cursorBlink 0.5s step-end infinite' }}
        />
      )}
    </span>
  )
}

// ── Setup Screen ──────────────────────────────────────────────────────────────

function SetupScreen({ onStart }: { onStart: (names: [string, string]) => void }) {
  const [names, setNames] = useState<[string, string]>(['', ''])
  const [bgPlaying, setBgPlaying] = useState(true)
  const bgRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio('/audio/bombinsound-upbeat.mp3')
    audio.loop = true
    audio.volume = 0.5
    bgRef.current = audio

    const tryPlay = () => {
      audio.play().catch(() => {})
      document.removeEventListener('click', tryPlay)
      document.removeEventListener('keydown', tryPlay)
      document.removeEventListener('touchstart', tryPlay)
    }

    // Try immediately; browsers allow it if triggered by navigation from a user gesture
    audio.play().catch(() => {
      // Autoplay blocked — wait for first user interaction
      document.addEventListener('click', tryPlay)
      document.addEventListener('keydown', tryPlay)
      document.addEventListener('touchstart', tryPlay)
    })

    return () => {
      audio.pause()
      audio.src = ''
      document.removeEventListener('click', tryPlay)
      document.removeEventListener('keydown', tryPlay)
      document.removeEventListener('touchstart', tryPlay)
    }
  }, [])

  function toggleBg() {
    const audio = bgRef.current
    if (!audio) return
    if (bgPlaying) { audio.pause(); setBgPlaying(false) }
    else { audio.play().catch(() => {}); setBgPlaying(true) }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-10 px-6 relative overflow-hidden select-none"
      style={{ background: 'linear-gradient(145deg,#500724 0%,#9d174d 40%,#1e3a8a 100%)' }}
    >
      {/* Floating blobs */}
      {[
        { s: 280, t: '-80px', l: '-80px', c: '#f9a8d435', d: '0s' },
        { s: 200, t: '15%', r: '-60px', c: '#7dd3fc35', d: '1.5s' },
        { s: 160, b: '10%', l: '8%', c: '#fbcfe835', d: '0.8s' },
        { s: 220, b: '-50px', r: '10%', c: '#bae6fd30', d: '2.2s' },
      ].map((b, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none"
          style={{
            width: b.s, height: b.s,
            top: (b as any).t, bottom: (b as any).b,
            left: (b as any).l, right: (b as any).r,
            background: b.c,
            animation: `floatBlob 6s ease-in-out ${b.d} infinite`,
          }}
        />
      ))}

      {/* Logo */}
      <div className="relative text-center" style={{ animation: 'popIn 0.6s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div
          className="inline-block px-12 py-8"
          style={{
            border: '5px solid #f97316',
            borderRadius: '50%',
            boxShadow: '0 0 24px rgba(249,115,22,0.45)',
          }}
        >
          <div
            className="text-8xl font-black tracking-[0.3em]"
            style={{
              background: 'linear-gradient(135deg,#f9a8d4,#ec4899,#38bdf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 30px rgba(251,146,60,0.5))',
            }}
          >
            EM FEUD
          </div>
        </div>
        <div className="mt-2 text-sm font-bold tracking-[0.4em] uppercase text-white/40">
          English Ministry Family Feud
        </div>
        <div className="mt-4 flex items-center justify-center gap-3">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-amber-500/50" />
          <span className="text-2xl">☀️</span>
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-amber-500/50" />
        </div>
        <button
          onClick={toggleBg}
          className="mt-3 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white/70 hover:text-white transition-all"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          {bgPlaying ? '🔊 Music On' : '🔇 Music Off'}
        </button>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-md rounded-3xl p-8 flex flex-col gap-6"
        style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <p className="text-center text-white/50 text-sm tracking-widest uppercase font-semibold">Enter Team Names</p>

        <div className="flex gap-5">
          {([0, 1] as const).map(idx => {
            const isBlue = idx === 0
            const accent = isBlue ? '#38bdf8' : '#fb923c'
            return (
              <div key={idx} className="flex-1 flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest" style={{ color: accent }}>
                  {isBlue ? '🔵 Team 1' : '🔴 Team 2'}
                </label>
                <input
                  type="text"
                  placeholder={isBlue ? 'e.g. Blazers' : 'e.g. Rockets'}
                  value={names[idx]}
                  maxLength={20}
                  onChange={e => { const n: [string, string] = [names[0], names[1]]; n[idx] = e.target.value; setNames(n) }}
                  onKeyDown={e => e.key === 'Enter' && onStart([names[0].trim() || 'Team 1', names[1].trim() || 'Team 2'])}
                  className="w-full text-center text-xl font-black bg-white/10 rounded-lg px-3 py-2.5 outline-none text-white placeholder-white/20 transition-all"
                  style={{ border: `2px solid ${accent}33` }}
                  onFocus={e => (e.target.style.borderColor = accent + '99')}
                  onBlur={e => (e.target.style.borderColor = accent + '33')}
                />
              </div>
            )
          })}
        </div>

        <button
          onClick={() => onStart([names[0].trim() || 'Team 1', names[1].trim() || 'Team 2'])}
          className="w-full py-4 rounded-lg font-black text-xl uppercase tracking-widest text-white transition-all hover:scale-[1.03] active:scale-95"
          style={{
            background: 'linear-gradient(135deg,#ec4899,#f9a8d4)',
            boxShadow: '0 8px 32px rgba(236,72,153,0.45)',
          }}
        >
          🎉 Let's Play!
        </button>
        <p className="text-center text-white/25 text-xs tracking-wide">Leave blank to use default names</p>
      </div>
    </div>
  )
}

// ── Final / Winner Screen ─────────────────────────────────────────────────────

function FinalScreen({ scores, teamNames, onRestart }: {
  scores: [number, number]; teamNames: [string, string]; onRestart: () => void
}) {
  const tied = scores[0] === scores[1]
  const winnerIdx = scores[0] >= scores[1] ? 0 : 1
  const winnerName = teamNames[winnerIdx]
  const winnerColor = winnerIdx === 0 ? '#38bdf8' : '#fb923c'

  useEffect(() => {
    // Confetti bursts
    const burst = () => confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors: ['#fbbf24', '#38bdf8', '#f97316', '#34d399', '#a78bfa'] })
    burst()
    const t1 = setTimeout(burst, 600)
    const t2 = setTimeout(burst, 1200)

    // Crowd audio — play twice then stop
    const crowd = new Audio('/audio/crowd.mp3')
    crowd.volume = 0.7
    let plays = 0
    crowd.play().catch(() => {})
    crowd.addEventListener('ended', () => {
      plays++
      if (plays < 2) crowd.play().catch(() => {})
    })

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      crowd.pause()
      crowd.src = ''
    }
  }, [])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-8 px-6 select-none"
      style={{ background: 'linear-gradient(145deg,#500724 0%,#9d174d 40%,#1e3a8a 100%)' }}
    >
      <div className="text-6xl" style={{ animation: 'popIn 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>🏆</div>

      <div className="text-center" style={{ animation: 'popIn 0.6s 0.1s cubic-bezier(0.22,1,0.36,1) both' }}>
        {tied ? (
          <>
            <div className="text-4xl font-black text-white tracking-wide">It's a Tie!</div>
            <div className="text-white/50 mt-2 text-lg">Both teams played great!</div>
          </>
        ) : (
          <>
            <div className="text-xl font-bold tracking-widest uppercase mb-2" style={{ color: winnerColor }}>
              🎊 Congratulations 🎊
            </div>
            <div
              className="text-6xl font-black tracking-wide"
              style={{
                background: `linear-gradient(135deg,${winnerColor},#fbbf24)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: `drop-shadow(0 0 20px ${winnerColor}66)`,
              }}
            >
              {winnerName}
            </div>
            <div className="text-2xl font-black text-white/80 mt-1">Wins the Game!</div>
          </>
        )}
      </div>

      {/* Score comparison */}
      <div
        className="flex gap-6 rounded-3xl px-10 py-6"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', animation: 'popIn 0.6s 0.2s cubic-bezier(0.22,1,0.36,1) both' }}
      >
        {([0, 1] as const).map(idx => {
          const isWinner = !tied && idx === winnerIdx
          const color = idx === 0 ? '#38bdf8' : '#fb923c'
          return (
            <div key={idx} className="text-center flex flex-col gap-1">
              <div className="text-xs font-black uppercase tracking-widest" style={{ color }}>{teamNames[idx]}</div>
              <div className={`text-5xl font-black tabular-nums ${isWinner ? '' : 'opacity-60'}`} style={{ color: isWinner ? color : 'white' }}>
                {scores[idx]}
              </div>
              {isWinner && <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">Winner!</div>}
            </div>
          )
        })}
      </div>

      <button
        onClick={onRestart}
        className="px-12 py-4 rounded-lg font-black text-lg uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg,#ec4899,#38bdf8)', boxShadow: '0 8px 32px rgba(236,72,153,0.4)' }}
      >
        ↩ Play Again
      </button>
    </div>
  )
}

// ── Answer Tile ───────────────────────────────────────────────────────────────

function AnswerTile({ answer, rank, revealed, onClick, slideColor }: {
  answer: Answer; rank: number; revealed: boolean; onClick: () => void; slideColor: 'blue' | 'pink'
}) {
  const revealedBg = slideColor === 'blue' ? '#0284c7' : '#be185d'
  const revealedBorder = slideColor === 'blue' ? 'rgba(125,211,252,0.6)' : 'rgba(249,168,212,0.6)'
  return (
    <button
      onClick={onClick}
      disabled={revealed}
      className="rounded-lg px-4 py-2 transition-all duration-500 text-left w-full"
      style={
        revealed
          ? { background: revealedBg, border: `1px solid ${revealedBorder}`, cursor: 'default' }
          : { background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(249,168,212,0.25)', backdropFilter: 'blur(8px)', cursor: 'pointer' }
      }
      onMouseEnter={e => { if (!revealed) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(249,168,212,0.7)' }}
      onMouseLeave={e => { if (!revealed) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(249,168,212,0.25)' }}
    >
      {revealed ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-amber-200 text-2xl font-black w-9 shrink-0 text-center">{rank}</span>
            <span className="text-xl font-bold text-white truncate">{answer.text}</span>
          </div>
          <span className="text-amber-200 text-2xl font-black ml-2 shrink-0">{answer.points}</span>
        </div>
      ) : (
        <div className="flex items-center justify-center py-0.5">
          <span
            className="flex items-center justify-center rounded-full font-black"
            style={{
              width: '3.6rem', height: '3.6rem',
              fontSize: '1.55rem',
              background: '#38bdf8',
              color: 'white',
              boxShadow: '0 0 10px rgba(56,189,248,0.35)',
            }}
          >
            {rank}
          </span>
        </div>
      )}
    </button>
  )
}

// ── Team Score Panel ──────────────────────────────────────────────────────────

function TeamPanel({ name, totalScore, isActive, color, onSetActive, onEditName, onNameChange, onEditDone, editing }: {
  name: string; totalScore: number; isActive: boolean; color: 'blue' | 'red'
  onSetActive: () => void; onEditName: () => void; onNameChange: (n: string) => void; onEditDone: () => void; editing: boolean
}) {
  const accent = color === 'blue' ? '#38bdf8' : '#ec4899'
  const grad = color === 'blue' ? 'linear-gradient(160deg,#0ea5e9,#38bdf8)' : 'linear-gradient(160deg,#be185d,#ec4899)'

  return (
    <div
      className="w-32 shrink-0 self-start flex flex-col items-center gap-3 rounded-lg p-4 transition-all duration-300"
      style={{
        background: 'white',
        boxShadow: isActive ? `0 8px 32px ${accent}55` : '0 2px 12px rgba(0,0,0,0.25)',
        border: isActive ? `2px solid ${accent}` : '2px solid rgba(255,255,255,0.6)',
      }}
    >
      {editing ? (
        <input
          autoFocus value={name}
          onChange={e => onNameChange(e.target.value)}
          onBlur={onEditDone}
          onKeyDown={e => e.key === 'Enter' && onEditDone()}
          className="border-b-2 text-center text-sm font-black w-full outline-none bg-transparent"
          style={{ borderColor: accent, color: accent }}
        />
      ) : (
        <button
          onClick={onEditName}
          className="text-xs font-black uppercase tracking-wider text-center w-full truncate transition-opacity hover:opacity-70"
          style={{ color: accent }}
        >
          {name}
        </button>
      )}

      <div className="text-5xl font-black tabular-nums" style={{ color: accent }}>{totalScore}</div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
        total pts
      </div>

      <button
        onClick={onSetActive}
        className="w-full py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all text-white"
        style={
          isActive
            ? { background: grad, boxShadow: `0 4px 12px ${accent}55` }
            : { background: grad, opacity: 0.7 }
        }
      >
        {isActive ? '▶ Playing' : 'Set Active'}
      </button>
    </div>
  )
}

// ── Main Game ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'emfeud_questions'

export default function EmFeud() {
  const [phase, setPhase] = useState<'setup' | 'playing' | 'final'>('setup')
  const [qIdx, setQIdx] = useState(0)
  const [activeQuestions, setActiveQuestions] = useState<QuestionData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) { const p = JSON.parse(saved); if (Array.isArray(p) && p.length) return p }
    } catch {}
    return QUESTIONS
  })
  const [rounds, setRounds] = useState<RoundState[]>(() => activeQuestions.map(makeRound))

  // Auto-seed from public CSV if localStorage has no custom questions
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return
    fetch('/data/EMFeud.csv')
      .then(r => r.text())
      .then(text => {
        const parsed = parseCSV(text)
        if (parsed.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
          setActiveQuestions(parsed)
          setRounds(parsed.map(makeRound))
        }
      })
      .catch(() => {})
  }, [])
  const [totalScores, setTotalScores] = useState<[number, number]>([0, 0])
  const [teamNames, setTeamNames] = useState<[string, string]>(['Team 1', 'Team 2'])
  const [activeTeam, setActiveTeam] = useState<0 | 1>(0)
  const [editingTeam, setEditingTeam] = useState<number | null>(null)
  const [muted, setMuted] = useState(false)
  const [strikeFlash, setStrikeFlash] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const round = rounds[qIdx]
  const q = activeQuestions[qIdx]

  // Points revealed so far this round (accumulator)
  const roundAccumulator = q.answers.reduce((sum, a, i) => (round.revealed[i] ? sum + a.points : sum), 0)
  const allRevealed = round.revealed.every(Boolean)
  // Other team index during steal
  const stealingTeam: 0 | 1 = activeTeam === 0 ? 1 : 0

  function updateRound(update: Partial<RoundState>) {
    setRounds(prev => prev.map((r, i) => (i === qIdx ? { ...r, ...update } : r)))
  }

  function startGame(names: [string, string]) {
    setTeamNames(names)
    setPhase('playing')
    if (audioRef.current) {
      audioRef.current.volume = 0.35
      audioRef.current.loop = true
      audioRef.current.play().catch(() => {})
    }
  }

  function revealAnswer(i: number) {
    if (round.revealed[i] || round.awarded) return
    const next = [...round.revealed]
    next[i] = true
    updateRound({ revealed: next })
  }

  function addStrike() {
    if (round.strikes >= 3 || round.awarded) return
    const next = round.strikes + 1
    updateRound({ strikes: next, stealMode: next >= 3 })
    // Buzzer sound
    const buzzer = new Audio('/audio/buzzersound.mp3')
    buzzer.volume = 0.85
    buzzer.play().catch(() => {})
    // Red X overlay for 2 seconds
    setStrikeFlash(true)
    setTimeout(() => setStrikeFlash(false), 2000)
  }

  // Award accumulated points to teamIdx; marks round done; carries score forward
  function awardPoints(teamIdx: 0 | 1) {
    if (roundAccumulator === 0 || round.awarded) return
    setTotalScores(prev => {
      const next: [number, number] = [prev[0], prev[1]]
      next[teamIdx] += roundAccumulator
      return next
    })
    updateRound({ revealed: q.answers.map(() => true), awarded: true, winnerTeam: teamIdx })
    confetti({ particleCount: 100, spread: 75, origin: { y: 0.55 }, colors: ['#fbbf24', '#38bdf8', '#f97316', '#34d399'] })
  }

  // Auto-award current team when all cards revealed
  function awardCurrentTeam() { awardPoints(activeTeam) }
  // Steal won: stealing team gets points
  function stealWon() { awardPoints(stealingTeam) }
  // Steal lost: original team keeps points
  function stealLost() { awardPoints(activeTeam) }

  function resetRound() { updateRound(makeRound(q)) }

  function resetGame() {
    setRounds(activeQuestions.map(makeRound))
    setTotalScores([0, 0])
    setQIdx(0)
    setActiveTeam(0)
    setPhase('setup')
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 }
  }

  function endGame() { setPhase('final') }

  function toggleMute() {
    if (audioRef.current) { audioRef.current.muted = !muted; setMuted(m => !m) }
  }

  // Determine control mode
  const isRoundDone = round.awarded
  const showStealControls = round.stealMode && !isRoundDone
  const showAllRevealedPrompt = allRevealed && !isRoundDone

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <audio ref={audioRef} src="/audio/alexzavesa-calm.mp3" preload="auto" loop />

      {phase === 'setup' && <SetupScreen onStart={startGame} />}

      {phase === 'final' && (
        <FinalScreen scores={totalScores} teamNames={teamNames} onRestart={resetGame} />
      )}

      {phase === 'playing' && (
        <div
          className="min-h-screen flex flex-col select-none relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg,#500724 0%,#831843 35%,#1e3a8a 100%)', fontFamily: '"Georgia",serif' }}
        >
          {/* Strike flash overlay — huge red X for 2s */}
          {strikeFlash && (
            <div
              className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
              style={{ background: 'rgba(180,0,0,0.18)', animation: 'popIn 0.15s cubic-bezier(0.22,1,0.36,1) both' }}
            >
              <span
                style={{
                  fontSize: 'clamp(10rem, 30vw, 18rem)',
                  fontWeight: 900,
                  color: '#ef4444',
                  lineHeight: 1,
                  textShadow: '0 0 60px rgba(239,68,68,0.8), 0 0 120px rgba(239,68,68,0.4)',
                  animation: 'popIn 0.15s cubic-bezier(0.22,1,0.36,1) both',
                }}
              >
                ✕
              </span>
            </div>
          )}

          {/* Floating background blobs */}
          {[
            { s: 340, t: '-100px', l: '-100px', c: '#f9a8d432', d: '0s' },
            { s: 280, t: '20%',    r: '-80px',  c: '#7dd3fc32', d: '1.8s' },
            { s: 220, b: '12%',    l: '5%',     c: '#fbcfe830', d: '0.9s' },
            { s: 300, b: '-80px',  r: '8%',     c: '#bae6fd28', d: '2.5s' },
            { s: 200, t: '45%',    l: '38%',    c: '#f9a8d422', d: '1.2s' },
            { s: 260, t: '30%',    l: '25%',    c: '#ec489930', d: '3.1s' },
            { s: 180, b: '25%',    r: '20%',    c: '#7dd3fc35', d: '0.5s' },
          ].map((b, i) => (
            <div key={i} className="absolute rounded-full pointer-events-none"
              style={{
                width: b.s, height: b.s,
                top: (b as any).t, bottom: (b as any).b,
                left: (b as any).l, right: (b as any).r,
                background: b.c,
                animation: `floatBlob 7s ease-in-out ${b.d} infinite`,
                zIndex: 0,
              }}
            />
          ))}

          {/* ── Title Bar ── */}
          <div
            className="relative text-center py-3 md:py-4 px-4 shrink-0 z-10"
            style={{ background: 'linear-gradient(90deg,#be185d,#ec4899,#38bdf8)', borderBottom: '2px solid rgba(249,168,212,0.35)' }}
          >
            <h1
              className="text-white leading-none"
              style={{
                fontFamily: '"Bebas Neue", Impact, "Arial Narrow", sans-serif',
                fontSize: 'clamp(2rem, 6vw, 3.8rem)',
                letterSpacing: '0.18em',
                textShadow: '0 3px 16px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              EM FEUD
            </h1>
            <p className="text-white/70 text-xs md:text-sm tracking-[0.25em] md:tracking-[0.3em] uppercase font-semibold mt-0.5">
              English Ministry Family Feud
            </p>

            {/* Controls — right side */}
            <div className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button onClick={toggleMute} className="text-sm bg-white/15 hover:bg-white/25 text-white px-2 md:px-2.5 py-1.5 rounded-full transition-all font-bold">
                {muted ? '🔇' : '🔊'}
              </button>

              {/* Circle — desktop */}
              <button
                onClick={endGame}
                className="hidden md:flex font-black uppercase tracking-wider text-white transition-all hover:scale-105 active:scale-95"
                style={{
                  fontSize: '0.75rem',
                  width: '6rem', height: '6rem',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg,#ef4444,#f97316)',
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(239,68,68,0.5)',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1.2,
                }}
              >
                <span style={{ fontSize: '1.6rem' }}>🏆</span>
                Final Results
              </button>

              {/* Pill — mobile */}
              <button
                onClick={endGame}
                className="md:hidden font-black text-white text-xs px-3 py-2 rounded-full transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)', boxShadow: '0 3px 12px rgba(239,68,68,0.45)' }}
              >
                🏆 Final
              </button>
            </div>
          </div>

          {/* ── Main Layout ── */}
          <div className="flex flex-1 flex-col md:flex-row gap-3 p-3 relative z-10 overflow-y-auto">

            {/* Mobile team scores bar */}
            <div className="flex md:hidden gap-3 w-full shrink-0">
              {([0, 1] as const).map(idx => {
                const isActive = activeTeam === idx
                const accent = idx === 0 ? '#38bdf8' : '#ec4899'
                const grad = idx === 0 ? 'linear-gradient(135deg,#0ea5e9,#38bdf8)' : 'linear-gradient(135deg,#be185d,#ec4899)'
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 rounded-lg p-3 transition-all"
                    style={{ background: 'rgba(255,255,255,0.08)', border: `1.5px solid ${isActive ? accent : 'rgba(255,255,255,0.12)'}` }}>
                    <div className="text-xs font-black uppercase tracking-wider truncate w-full text-center" style={{ color: accent }}>
                      {teamNames[idx]}
                    </div>
                    <div className="text-3xl font-black text-white tabular-nums">{totalScores[idx]}</div>
                    <button onClick={() => setActiveTeam(idx as 0 | 1)}
                      className="w-full py-1 rounded-full text-xs font-black uppercase tracking-wider text-white transition-all"
                      style={{ background: isActive ? grad : 'rgba(255,255,255,0.12)' }}>
                      {isActive ? '▶ Playing' : 'Set Active'}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Team 1 — desktop only */}
            <div className="hidden md:block">
              <TeamPanel
                name={teamNames[0]} totalScore={totalScores[0]} isActive={activeTeam === 0} color="blue"
                onSetActive={() => setActiveTeam(0)}
                editing={editingTeam === 0} onEditName={() => setEditingTeam(0)}
                onNameChange={n => setTeamNames(p => [n, p[1]])} onEditDone={() => setEditingTeam(null)}
              />
            </div>

            {/* ── Center ── */}
            <div className="flex-1 flex flex-col min-w-0">

              {/* Status row */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                {/* Active team / steal badge */}
                <div
                  className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${showStealControls ? 'animate-pulse' : ''}`}
                  style={{
                    background: showStealControls
                      ? '#be185d'
                      : isRoundDone
                        ? 'rgba(255,255,255,0.1)'
                        : activeTeam === 0
                          ? '#0284c7'
                          : '#be185d',
                    color: 'white',
                  }}
                >
                  {isRoundDone
                    ? `✓ Awarded to ${teamNames[round.winnerTeam!]}`
                    : showStealControls
                      ? `🔀 Steal! ${teamNames[stealingTeam]} guesses`
                      : `${teamNames[activeTeam]} is playing`}
                </div>

                {/* Accumulator — centred */}
                <div
                  className="flex items-baseline gap-1.5 px-5 py-1.5 rounded-full"
                  style={{
                    background: roundAccumulator > 0 ? 'rgba(251,191,36,0.18)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${roundAccumulator > 0 ? 'rgba(251,191,36,0.45)' : 'rgba(255,255,255,0.1)'}`,
                    transition: 'all 0.3s',
                  }}
                >
                  <span className="text-amber-400 text-xs font-black uppercase tracking-widest">Round</span>
                  <span
                    className="text-amber-300 font-black tabular-nums"
                    style={{
                      fontSize: roundAccumulator > 0 ? '1.6rem' : '1.1rem',
                      textShadow: roundAccumulator > 0 ? '0 0 18px rgba(251,191,36,0.65)' : 'none',
                      transition: 'font-size 0.3s, text-shadow 0.3s',
                    }}
                  >
                    {roundAccumulator}
                  </span>
                  <span className="text-amber-500/60 text-xs font-bold">pts</span>
                </div>
              </div>

              {/* Question box */}
              <div
                className="rounded-lg px-5 py-3 text-center shrink-0 mb-4"
                style={{ background: 'hsla(92, 88%, 84%, 0.06)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
              >
                <div className="text-sky-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                  Question {qIdx + 1} of {activeQuestions.length}
                </div>
                <div className="text-white font-black leading-snug" style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.65rem)' }}>
                  <TypewriterText key={qIdx} text={q.question} />
                </div>
              </div>

              {/* Answer grid */}
              <div className="grid grid-cols-2 gap-4">
                {q.answers.map((answer, i) => (
                  <AnswerTile key={i} answer={answer} rank={i + 1} revealed={round.revealed[i]} onClick={() => revealAnswer(i)} slideColor={qIdx % 2 === 0 ? 'blue' : 'pink'} />
                ))}
              </div>

              {/* ── Controls ── */}
              <div className="flex flex-col gap-2 mt-auto pt-4">

                {/* Steal controls (after 3 strikes) */}
                {showStealControls && (
                  <div
                    className="flex flex-wrap items-center justify-center gap-3 px-4 py-3 rounded-lg"
                    style={{ background: 'rgba(190,24,93,0.15)', border: '1px solid rgba(249,168,212,0.4)' }}
                  >
                    <span className="text-pink-200 text-sm font-bold">Reveal if correct, then:</span>
                    <button
                      onClick={stealWon}
                      className="px-4 py-2 rounded-lg font-black text-sm uppercase tracking-wider text-white transition-all hover:scale-105 active:scale-95"
                      style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}
                    >
                      ✅ Steal Won → {teamNames[stealingTeam]}
                    </button>
                    <button
                      onClick={stealLost}
                      className="px-4 py-2 rounded-lg font-black text-sm uppercase tracking-wider text-white transition-all hover:scale-105 active:scale-95"
                      style={{ background: 'linear-gradient(135deg,#64748b,#475569)' }}
                    >
                      ❌ Steal Failed → {teamNames[activeTeam]}
                    </button>
                  </div>
                )}

                {/* All revealed — award prompt */}
                {showAllRevealedPrompt && !showStealControls && (
                  <div className="flex justify-center">
                    <button
                      onClick={awardCurrentTeam}
                      className="px-8 py-2.5 rounded-lg font-black text-base uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 animate-pulse"
                      style={{
                        background: activeTeam === 0 ? 'linear-gradient(135deg,#0ea5e9,#38bdf8)' : 'linear-gradient(135deg,#be185d,#ec4899)',
                        boxShadow: `0 0 24px ${activeTeam === 0 ? '#38bdf8' : '#ec4899'}66`,
                      }}
                    >
                      🎉 Award {roundAccumulator} pts → {teamNames[activeTeam]}
                    </button>
                  </div>
                )}

                {/* Normal controls row */}
                {!showStealControls && !isRoundDone && (
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {/* Strikes */}
                    <div className="flex items-center gap-1 bg-white/5 rounded-lg px-4 py-2">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="text-2xl font-black transition-all duration-300"
                          style={{ color: i < round.strikes ? '#ef4444' : 'rgba(255,255,255,0.1)', filter: i < round.strikes ? 'drop-shadow(0 0 8px #ef444499)' : 'none' }}>
                          ✕
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={addStrike}
                      disabled={round.strikes >= 3}
                      className="px-5 py-2 rounded-lg font-black text-sm uppercase tracking-wider text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}
                    >
                      + Strike
                    </button>
                    <button
                      onClick={resetRound}
                      className="px-4 py-2 rounded-lg font-black text-sm uppercase tracking-wider text-white/60 hover:text-white transition-all"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      Reset Round
                    </button>
                  </div>
                )}

                {/* After round awarded: manual award overrides */}
                {isRoundDone && !showStealControls && !allRevealed && (
                  <div className="flex justify-center gap-3">
                    <button onClick={() => awardPoints(0)} className="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider text-white transition-all hover:opacity-80" style={{ background: 'linear-gradient(135deg,#0ea5e9,#38bdf8)' }}>
                      +pts → {teamNames[0]}
                    </button>
                    <button onClick={() => awardPoints(1)} className="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider text-white transition-all hover:opacity-80" style={{ background: 'linear-gradient(135deg,#be185d,#ec4899)' }}>
                      +pts → {teamNames[1]}
                    </button>
                  </div>
                )}
              </div>

              {/* Question selector */}
              <div className="flex justify-center gap-2 pb-1">
                {activeQuestions.map((_, i) => {
                  const done = rounds[i].awarded
                  return (
                    <button key={i} onClick={() => setQIdx(i)}
                      className="w-9 h-9 rounded-full font-black text-sm transition-all duration-200"
                      style={
                        i === qIdx
                          ? { background: 'linear-gradient(135deg,#ec4899,#38bdf8)', color: 'white', transform: 'scale(1.15)' }
                          : done
                            ? { background: 'rgba(34,197,94,0.25)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.4)' }
                            : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }
                      }
                    >
                      {done ? '✓' : i + 1}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Team 2 — desktop only */}
            <div className="hidden md:block">
              <TeamPanel
                name={teamNames[1]} totalScore={totalScores[1]} isActive={activeTeam === 1} color="red"
                onSetActive={() => setActiveTeam(1)}
                editing={editingTeam === 1} onEditName={() => setEditingTeam(1)}
                onNameChange={n => setTeamNames(p => [p[0], n])} onEditDone={() => setEditingTeam(null)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 text-center text-white/15 text-[9px] pb-2 tracking-widest uppercase font-bold">
            Click tiles to reveal · +Strike on wrong guess · Award points after each round · 🏆 Final to see winner
          </div>
        </div>
      )}
    </>
  )
}
