import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth, Role, ROLE_LABELS, ROLE_ROUTES } from '../context/AuthContext'

type Props = {
  initialRole?: Role
  onClose: () => void
}

export default function LoginModal({ initialRole, onClose }: Props) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [role, setRole]         = useState<Role>(initialRole ?? 'calendar')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const roles: Role[] = ['calendar', 'praiseTeam', 'worship', 'admin']

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(role, password)
      onClose()
      navigate(ROLE_ROUTES[role])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      setError(err.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-800">Staff Login</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Role selector */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
              Section
            </label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setError(null) }}
                  className={`py-2 px-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                    role === r
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(null) }}
                placeholder="Enter password"
                autoFocus
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none focus:border-blue-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying…' : `Login as ${ROLE_LABELS[role]}`}
          </button>
        </form>
      </div>
    </div>
  )
}
