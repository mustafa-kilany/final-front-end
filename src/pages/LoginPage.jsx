import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { loginApi } from '../api/authApi'
import { getUser, saveAuth } from '../auth'

export default function LoginPage() {
  const location = useLocation()
  const nav = useNavigate()

  const user = getUser()
  const isAuthenticated = Boolean(user)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const from = location.state?.from

  if (isAuthenticated) {
    if (from) return <Navigate to={from} replace />
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/consumer/inventory'} replace />
  }

  function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)

    setError(null)
    return loginApi({ email: String(email ?? '').trim(), password: String(password ?? '') })
      .then((data) => {
        if (!data?.user) {
          setError('Login failed')
          return
        }

        saveAuth({ user: data.user, token: data?.token || data?.accessToken || null })
        const goTo = from || (data.user.role === 'admin' ? '/admin/dashboard' : '/consumer/inventory')
        nav(goTo, { replace: true })
      })
      .catch(() => {
        setError('Invalid email or password')
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Login</h1>
      <p className="mt-1 text-sm text-slate-600">No signup — admin creates users later.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@inventorygo.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="admin123 / user123"
            type="password"
            autoComplete="current-password"
          />
        </div>

        {error ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-sky-600 px-4 py-2.5 font-medium text-white hover:bg-sky-700 disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
