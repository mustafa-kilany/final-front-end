import { useEffect, useMemo, useState } from 'react'
import { createUser, listUsers } from '../api/usersApi'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    function load() {
      setError(null)
      setLoading(true)

      listUsers()
        .then((data) => {
          if (Array.isArray(data)) {
            setUsers(data)
          } else {
            setUsers([])
          }
        })
        .catch((err) => {
          let message = 'Failed to load users'
          if (err && err.response && err.response.data && err.response.data.message) {
            message = err.response.data.message
          }
          setError(message)
        })
        .finally(() => {
          setLoading(false)
        })
    }

    load()
  }, [])

  const canCreate = useMemo(() => name.trim() && email.trim() && password.trim(), [name, email, password])

  function onCreateUser(e) {
    e.preventDefault()
    if (!canCreate) return

    setCreating(true)
    setError(null)

    createUser({
      name: name.trim(),
      email: email.trim(),
      password: password,
      role: 'purchase',
    })
      .then((newUser) => {
        setUsers((prev) => [newUser, ...prev])
        setName('')
        setEmail('')
        setPassword('')
      })
      .catch((err) => {
        let message = 'Failed to create user'
        if (err && err.response && err.response.data && err.response.data.message) {
          message = err.response.data.message
        }
        setError(message)
      })
      .finally(() => {
        setCreating(false)
      })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">User Management</h1>
        <p className="text-sm text-slate-600">Create purchase users in MongoDB. This page is connected to your backend.</p>
      </div>

      <form onSubmit={onCreateUser} className="rounded-2xl border bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Purchase user name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="purchase@inventorygo.com"
              autoComplete="email"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Password</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              placeholder="Set an initial password"
            />
          </div>
        </div>

        {error && <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={!canCreate || creating}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {creating && 'Creating…'}
            {!creating && 'Create purchase user'}
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="whitespace-nowrap px-4 py-3">Name</th>
                <th className="whitespace-nowrap px-4 py-3">Email</th>
                <th className="whitespace-nowrap px-4 py-3">Role</th>
                <th className="whitespace-nowrap px-4 py-3">Created</th>
              </tr>
            </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3 text-slate-600">{new Date(u.createdAt).toLocaleString()}</td>
              </tr>
            ))}

            {!loading && users.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-slate-600" colSpan={4}>
                  No created users yet.
                </td>
              </tr>
            ) : null}

            {loading ? (
              <tr>
                <td className="px-4 py-6 text-sm text-slate-600" colSpan={4}>
                  Loading…
                </td>
              </tr>
            ) : null}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
