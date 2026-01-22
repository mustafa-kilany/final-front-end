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

  let from = null
  if (location.state && location.state.from) {
    from = location.state.from
  }

  if (isAuthenticated) {
    if (from) return <Navigate to={from} replace />
    let redirectPath = '/consumer/inventory'
    if (user && user.role === 'admin') {
      redirectPath = '/admin/dashboard'
    }
    return <Navigate to={redirectPath} replace />
  }

  function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    let emailValue = ''
    if (email) {
      emailValue = String(email).trim()
    }
    let passwordValue = ''
    if (password) {
      passwordValue = String(password)
    }

    loginApi({ email: emailValue, password: passwordValue })
      .then((data) => {
        if (!data || !data.user) {
          setError('Login failed')
          return
        }

        let token = null
        if (data.token) {
          token = data.token
        } else if (data.accessToken) {
          token = data.accessToken
        }
        saveAuth({ user: data.user, token: token })

        let goTo = '/consumer/inventory'
        if (from) {
          goTo = from
        } else if (data.user.role === 'admin') {
          goTo = '/admin/dashboard'
        }
        nav(goTo, { replace: true })
      })
      .catch((err) => {
        let msg = 'Invalid email or password'
        if (err && err.response && err.response.data && err.response.data.message) {
          msg = err.response.data.message
        }
        setError(msg)
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

        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-sky-600 px-4 py-2.5 font-medium text-white hover:bg-sky-700 disabled:opacity-60"
        >
          {submitting && 'Signing in…'}
          {!submitting && 'Sign in'}
        </button>
      </form>
    </div>
  )
}
