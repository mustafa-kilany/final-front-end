import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPurchaseRequest, listRequests, approvePurchaseRequest, rejectPurchaseRequest } from '../api/requestsApi'

const RequestsContext = createContext(null)

export function RequestsProvider({ children }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
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

  const value = useMemo(
    () => ({
      requests,
      loading,
      error,
      fetchRequests,
      createRequest,
      approveRequest,
      rejectRequest,
    }),
    [requests, loading, error, fetchRequests, createRequest, approveRequest, rejectRequest],
  )

  return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>
}

export default RequestsContext
