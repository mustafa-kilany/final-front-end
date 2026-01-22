import { useMemo, useState } from 'react'
import { useRequests } from '../hooks/useRequests'

export default function AdminDashboardPage() {
  const {
    requests,
    loading,
    error,
    approveRequest,
    rejectRequest,
    fetchRequestHistory,
    historyByRequestId,
    historyLoadingByRequestId,
    historyErrorByRequestId,
  } = useRequests()

  const [selectedRequestId, setSelectedRequestId] = useState(null)

  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      const aTime = new Date(a?.createdAt || 0).getTime()
      const bTime = new Date(b?.createdAt || 0).getTime()
      return bTime - aTime
    })
  }, [requests])

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

  function handleOpenHistory(requestId) {
    setSelectedRequestId(requestId)
    return fetchRequestHistory(requestId)
  }

  function closeHistory() {
    setSelectedRequestId(null)
  }

  function renderRow(request) {
    let requestedByName = 'Unknown'
    const requestedBy = request.requestedBy
    if (requestedBy && requestedBy.name) {
      requestedByName = requestedBy.name
    }

    const createdAt = formatDate(request.createdAt)

    const status = String(request.status || 'unknown')
    const canDecide = status === 'pending'

    return (
      <tr key={request.id} className="hover:bg-slate-50">
        <td className="px-4 py-3">
          <div className="font-medium">{requestedByName}</div>
          <div className="text-xs text-slate-500">{createdAt}</div>
        </td>
        <td className="px-4 py-3 font-medium">{request.itemName}</td>
        <td className="px-4 py-3">{request.qty}</td>
        <td className="px-4 py-3 text-slate-700">{request.reason || '-'}</td>
        <td className="px-4 py-3">
          <span
            className={
              status === 'approved'
                ? 'rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700'
                : status === 'rejected'
                  ? 'rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700'
                  : 'rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700'
            }
          >
            {status}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => handleOpenHistory(request.id)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
            >
              History
            </button>
            <button
              type="button"
              onClick={() => handleReject(request.id)}
              disabled={!canDecide}
              className={
                canDecide
                  ? 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50'
                  : 'cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400'
              }
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => handleApprove(request.id)}
              disabled={!canDecide}
              className={
                canDecide
                  ? 'rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700'
                  : 'cursor-not-allowed rounded-lg bg-emerald-200 px-3 py-2 text-sm font-medium text-white'
              }
            >
              Approve
            </button>
          </div>
        </td>
      </tr>
    )
  }

  function renderRequestRows() {
    if (sortedRequests.length === 0) {
      return (
        <tr>
          <td className="px-4 py-6 text-sm text-slate-600" colSpan={6}>
            No requests.
          </td>
        </tr>
      )
    }

    return sortedRequests.map(renderRow)
  }

  const selectedHistory = selectedRequestId ? historyByRequestId[selectedRequestId] : null
  const historyLoading = selectedRequestId ? historyLoadingByRequestId[selectedRequestId] : false
  const historyError = selectedRequestId ? historyErrorByRequestId[selectedRequestId] : null

  function renderHistoryRows() {
    if (historyLoading) {
      return (
        <tr>
          <td className="px-4 py-6 text-sm text-slate-600" colSpan={4}>
            Loading…
          </td>
        </tr>
      )
    }

    if (historyError) {
      return (
        <tr>
          <td className="px-4 py-6 text-sm text-red-700" colSpan={4}>
            {historyError}
          </td>
        </tr>
      )
    }

    if (!Array.isArray(selectedHistory) || selectedHistory.length === 0) {
      return (
        <tr>
          <td className="px-4 py-6 text-sm text-slate-600" colSpan={4}>
            No history entries.
          </td>
        </tr>
      )
    }

    return selectedHistory.map((h) => {
      const actor = h.actor
      const actorLabel = actor?.name || actor?.email || 'Unknown'
      return (
        <tr key={h.id} className="hover:bg-slate-50">
          <td className="px-4 py-3">
            <div className="font-medium">{String(h.action || '-')}</div>
            <div className="text-xs text-slate-500">{formatDate(h.at)}</div>
          </td>
          <td className="px-4 py-3">{actorLabel}</td>
          <td className="px-4 py-3 text-slate-700">{h.message || '-'}</td>
          <td className="px-4 py-3 text-slate-700">
            {h.snapshot?.qty ? `qty=${h.snapshot.qty}` : '-'}
          </td>
        </tr>
      )
    })
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
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-sm text-slate-600" colSpan={6}>
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

      {selectedRequestId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="text-sm font-semibold text-slate-900">Request History</div>
              <button
                type="button"
                onClick={closeHistory}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Message</th>
                    <th className="px-4 py-3">Snapshot</th>
                  </tr>
                </thead>
                <tbody className="divide-y">{renderHistoryRows()}</tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
