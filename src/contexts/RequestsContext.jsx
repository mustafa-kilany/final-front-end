import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createPurchaseRequest,
  listRequests,
  approvePurchaseRequest,
  rejectPurchaseRequest,
  getPurchaseRequestHistory,
} from '../api/requestsApi'

const RequestsContext = createContext(null)

export function RequestsProvider({ children }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [historyByRequestId, setHistoryByRequestId] = useState({})
  const [historyLoadingByRequestId, setHistoryLoadingByRequestId] = useState({})
  const [historyErrorByRequestId, setHistoryErrorByRequestId] = useState({})
  const didInitialLoad = useRef(false)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await listRequests()
      setRequests(Array.isArray(rows) ? rows : [])
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load requests'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (didInitialLoad.current) return
    didInitialLoad.current = true
    fetchRequests()
  }, [fetchRequests])

  const createRequest = useCallback(async ({ itemId, qty, reason }) => {
    const quantity = Number(qty)
    if (!itemId) return
    if (!Number.isFinite(quantity) || quantity <= 0) return

    setError(null)
    const created = await createPurchaseRequest({ itemId, qty: quantity, reason })
    if (created) setRequests((prev) => [created, ...prev])
    return created
  }, [])

  const approveRequest = useCallback(async (requestId) => {
    if (!requestId) return
    setError(null)
    const updated = await approvePurchaseRequest(requestId)
    if (updated) {
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    }
    return updated
  }, [])

  const rejectRequest = useCallback(async (requestId, { message } = {}) => {
    if (!requestId) return
    setError(null)
    const updated = await rejectPurchaseRequest(requestId, { message })
    if (updated) {
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    }
    return updated
  }, [])

  const fetchRequestHistory = useCallback(async (requestId, { force } = {}) => {
    if (!requestId) return []
    if (!force && Array.isArray(historyByRequestId[requestId])) {
      return historyByRequestId[requestId]
    }

    setHistoryLoadingByRequestId((prev) => ({ ...prev, [requestId]: true }))
    setHistoryErrorByRequestId((prev) => ({ ...prev, [requestId]: null }))
    try {
      const rows = await getPurchaseRequestHistory(requestId)
      setHistoryByRequestId((prev) => ({ ...prev, [requestId]: rows }))
      return rows
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load request history'
      setHistoryErrorByRequestId((prev) => ({ ...prev, [requestId]: msg }))
      return []
    } finally {
      setHistoryLoadingByRequestId((prev) => ({ ...prev, [requestId]: false }))
    }
  }, [historyByRequestId])

  const value = useMemo(
    () => ({
      requests,
      loading,
      error,
      historyByRequestId,
      historyLoadingByRequestId,
      historyErrorByRequestId,
      fetchRequests,
      createRequest,
      approveRequest,
      rejectRequest,
      fetchRequestHistory,
    }),
    [
      requests,
      loading,
      error,
      historyByRequestId,
      historyLoadingByRequestId,
      historyErrorByRequestId,
      fetchRequests,
      createRequest,
      approveRequest,
      rejectRequest,
      fetchRequestHistory,
    ],
  )

  return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>
}

export default RequestsContext
