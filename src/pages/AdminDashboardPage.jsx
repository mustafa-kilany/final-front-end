import { useRequests } from '../hooks/useRequests'

export default function AdminDashboardPage() {
  const { requests, loading, error, approveRequest, rejectRequest } = useRequests()

  const pending = requests.filter((r) => r.status === 'pending')

  function formatDate(value) {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleString()
  }

  function handleApprove(requestId) {
    approveRequest(requestId)
  }

  function handleReject(requestId) {
    rejectRequest(requestId)
  }

  function renderRow(request) {
    let requestedByName = 'Unknown'
    const requestedBy = request.requestedBy
    if (requestedBy && requestedBy.name) {
      requestedByName = requestedBy.name
    }

    const createdAt = formatDate(request.createdAt)

    return (
      <tr key={request.id} className="hover:bg-slate-50">
        <td className="px-4 py-3">
          <div className="font-medium">{requestedByName}</div>
          <div className="text-xs text-slate-500">{createdAt}</div>
        </td>
        <td className="px-4 py-3 font-medium">{request.itemName}</td>
        <td className="px-4 py-3">{request.qty}</td>
        <td className="px-4 py-3 text-slate-700">{request.reason || '-'}</td>
        <td className="px-4 py-3 text-right">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => handleReject(request.id)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => handleApprove(request.id)}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Approve
            </button>
          </div>
        </td>
      </tr>
    )
  }

  function renderRequestRows() {
    if (pending.length === 0) {
      return (
        <tr>
          <td className="px-4 py-6 text-sm text-slate-600" colSpan={5}>
            No pending requests.
          </td>
        </tr>
      )
    }

    return pending.map(renderRow)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Purchase Requests</h1>
        <p className="text-sm text-slate-600">Approve or reject purchase requests from Purchase department.</p>
      </div>

      {error ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3">Requested by</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-sm text-slate-600" colSpan={5}>
                  Loading…
                </td>
              </tr>
            ) : (
              renderRequestRows()
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
        Approving a request updates inventory in the backend.
      </div>
    </div>
  )
}
