import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth, ROLE_ROUTES } from '../context/AuthContext'
import type { Role } from '../context/AuthContext'

type Props = {
  onClose: () => void
}

const ROLE_OPTIONS: { role: Role; label: string }[] = [
  { role: 'attendance', label: 'Arrival Checkin' },
  { role: 'calendar',   label: 'Coworker' },
  { role: 'admin',      label: 'Admin' },
]

export default function LoginModal({ onClose }: Props) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [password,     setPassword]     = useState('')
  const passwordRef = useRef<HTMLInputElement>(null)
  const [showPw,       setShowPw]       = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [loading,      setLoading]      = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedRole) return
    setError(null)
    setLoading(true)
    try {
      await login(selectedRole, password)
      onClose()
      navigate(ROLE_ROUTES[selectedRole])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const roleLabel = selectedRole === 'calendar' ? 'Coworker' : selectedRole === 'admin' ? 'Admin' : ''

  return (
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4'
      onClick={onClose}
    >
      <div
        className='bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 relative'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition'
        >
          <X className='w-5 h-5' />
        </button>

        <div className='flex items-center gap-2 mb-5'>
          <Lock className='w-5 h-5 text-blue-600' />
          <h2 className='text-lg font-bold text-gray-800'>Login</h2>
        </div>

        {/* Role selector */}
        <div className='flex flex-wrap gap-2 mb-5'>
          {ROLE_OPTIONS.map(({ role, label }) => (
            <button
              key={role}
              type='button'
              onClick={() => { setSelectedRole(role); setError(null); setTimeout(() => passwordRef.current?.focus(), 0) }}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition ${
                selectedRole === role
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div>
            <label className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block'>
              Password
            </label>
            <div className='relative'>
              <input
                ref={passwordRef}
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null) }}
                placeholder={selectedRole ? `Enter ${roleLabel} password` : 'Select a role above'}
                disabled={!selectedRole}
                className='w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none focus:border-blue-400 transition disabled:bg-gray-50 disabled:text-gray-400'
              />
              <button
                type='button'
                onClick={() => setShowPw((v) => !v)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
              >
                {showPw ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
              </button>
            </div>
            {error && (
              <p className='text-red-500 text-xs mt-1.5 font-medium'>{error}</p>
            )}
          </div>

          <button
            type='submit'
            disabled={loading || !password || !selectedRole}
            className='w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? 'Verifying…' : `Login${roleLabel ? ` as ${roleLabel}` : ''}`}
          </button>
        </form>
      </div>
    </div>
  )
}
