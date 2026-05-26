import { useState } from 'react'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'
import { RequireAuth, useAuth, Role, ROLE_LABELS } from '../../context/AuthContext'

const ROLES: Role[] = ['calendar', 'praiseTeam', 'worship', 'admin']

function PasswordRow({ role }: { role: Role }) {
  const { authFetch } = useAuth()
  const [password, setPassword] = useState('')
  const [show, setShow]         = useState(false)
  const [status, setStatus]     = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [errMsg, setErrMsg]     = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    setErrMsg('')
    try {
      const res = await authFetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, newPassword: password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStatus('done')
      setPassword('')
      setTimeout(() => setStatus('idle'), 2500)
    } catch (err: any) {
      setErrMsg(err.message ?? 'Failed')
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSave} className="flex items-center gap-3 py-4 border-b border-gray-100 last:border-0">
      <span className="w-36 text-sm font-semibold text-gray-700">{ROLE_LABELS[role]}</span>

      <div className="relative flex-1 max-w-xs">
        <input
          type={show ? 'text' : 'password'}
          value={password}
          onChange={e => { setPassword(e.target.value); setStatus('idle'); setErrMsg('') }}
          placeholder="New password"
          minLength={6}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-9 text-sm outline-none focus:border-blue-400 transition"
        />
        <button type="button" onClick={() => setShow(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <button
        type="submit"
        disabled={status === 'saving' || password.length < 6}
        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-40"
      >
        {status === 'saving' ? 'Saving…' : 'Update'}
      </button>

      {status === 'done' && (
        <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
          <CheckCircle className="w-4 h-4" /> Saved
        </span>
      )}
      {status === 'error' && <span className="text-red-500 text-xs">{errMsg}</span>}
    </form>
  )
}

export default function AdminPanel() {
  const { role, logout } = useAuth()

  return (
    <RequireAuth role="admin">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-500 text-sm mt-1">Manage section passwords</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-2">
          <p className="text-xs text-gray-400 pt-4 pb-2 font-semibold uppercase tracking-wider">Section Passwords</p>
          {ROLES.map(r => <PasswordRow key={r} role={r} />)}
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-700">
          <strong>Note:</strong> Passwords are hashed and stored securely on the server. Default passwords are set in <code>server/.env</code> and take effect only on first run.
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">Logged in as <strong>{role}</strong></p>
      </div>
    </RequireAuth>
  )
}
