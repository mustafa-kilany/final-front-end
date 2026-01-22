import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getUser } from '../auth'
import { useRequests } from '../hooks/useRequests'

export default function ConsumerRequestsPage() {
  const user = getUser()
  const { requests, loading, error } = useRequests()

  const mine = useMemo(() => {
    if (!user) return []
    // Backend already scopes non-admin users to their own requests.
    // Keep a defensive filter in case a future endpoint returns more.
    return requests.filter((r) => {
      if (!r.requestedBy || !r.requestedBy.id) return true
      if (r.requestedBy.id === user.id) return true
      return false
    })
  }, [requests, user])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Requests</h1>
          <p className="text-sm text-slate-600">Track requests you submitted to Finance.</p>
        </div>
        <Link
          to="/consumer/inventory"
          className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          Create new request
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[450px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="whitespace-nowrap px-4 py-3">Item</th>
                <th className="whitespace-nowrap px-4 py-3">Qty</th>
                <th className="whitespace-nowrap px-4 py-3">Status</th>
                <th className="whitespace-nowrap px-4 py-3">Created</th>
              </tr>
            </thead>
          <tbody className="divide-y">
            {error && (
              <tr>
                <td className="px-4 py-6 text-sm text-red-700" colSpan={4}>
                  {error}
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td className="px-4 py-6 text-sm text-slate-600" colSpan={4}>
                  Loading…
                </td>
              </tr>
            )}

            {mine.map((r) => {
              let statusClass = 'rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200'
              if (r.status === 'approved') {
                statusClass = 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200'
              } else if (r.status === 'rejected') {
                statusClass = 'rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800 ring-1 ring-red-200'
              }
              return (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{r.itemName}</td>
                  <td className="px-4 py-3">{r.qty}</td>
                  <td className="px-4 py-3">
                    <span className={statusClass}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              )
            })}

            {mine.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-sm text-slate-600" colSpan={4}>
                  No requests yet. Create one from the Inventory page.
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
