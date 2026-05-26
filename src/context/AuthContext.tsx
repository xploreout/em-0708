import { createContext, useContext, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export type Role = 'calendar' | 'praiseTeam' | 'worship' | 'admin'

export const ROLE_LABELS: Record<Role, string> = {
  calendar:   'CoWorker Calendar',
  praiseTeam: 'Praise Team',
  worship:    'Worship',
  admin:      'Admin',
}

export const ROLE_ROUTES: Record<Role, string> = {
  calendar:   '/schedule/calendar',
  praiseTeam: '/schedule/praise-team',
  worship:    '/schedule/worship',
  admin:      '/schedule/admin',
}

type AuthCtx = {
  token: string | null
  role: Role | null
  login: (role: Role, password: string) => Promise<void>
  logout: () => void
  isAuthorized: (required: Role) => boolean
  authFetch: (url: string, init?: RequestInit) => Promise<Response>
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('auth_token'))
  const [role, setRole]   = useState<Role | null>(()  => sessionStorage.getItem('auth_role') as Role | null)

  const login = useCallback(async (r: Role, password: string) => {
    let res: Response
    try {
      res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: r, password }),
      })
    } catch {
      throw new Error('Cannot reach server — make sure it is running (cd server && npm run dev)')
    }
    let data: any = {}
    try {
      data = await res.json()
    } catch {
      throw new Error(`Server error (${res.status}) — unexpected response`)
    }
    if (!res.ok) throw new Error(data.error || 'Login failed')
    sessionStorage.setItem('auth_token', data.token)
    sessionStorage.setItem('auth_role',  data.role)
    setToken(data.token)
    setRole(data.role)
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_role')
    setToken(null)
    setRole(null)
  }, [])

  const isAuthorized = useCallback((required: Role) => {
    if (!token || !role) return false
    return role === 'admin' || role === required
  }, [token, role])

  const authFetch = useCallback((url: string, init: RequestInit = {}) => {
    return fetch(url, {
      ...init,
      headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}` },
    })
  }, [token])

  return (
    <AuthContext.Provider value={{ token, role, login, logout, isAuthorized, authFetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

// Gate component — renders children only if authorized, otherwise shows lock screen
export function RequireAuth({ role: required, children }: { role: Role; children: React.ReactNode }) {
  const { isAuthorized } = useAuth()
  const navigate = useNavigate()

  if (!isAuthorized(required)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4">
        <div className="text-5xl">🔒</div>
        <h2 className="text-xl font-bold text-gray-700">Access Required</h2>
        <p className="text-gray-500 text-sm">Please log in with the <strong>{ROLE_LABELS[required]}</strong> password.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-2 px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
        >
          Go Home
        </button>
      </div>
    )
  }
  return <>{children}</>
}
