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

  const fetchRequests = useCallback(() => {
    setLoading(true)
    setError(null)
    return listRequests()
      .then((rows) => {
        setRequests(Array.isArray(rows) ? rows : [])
        return rows
      })
      .catch(() => {
        setError('Failed to load requests')
        return []
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (didInitialLoad.current) return
    didInitialLoad.current = true
    fetchRequests()
  }, [fetchRequests])

  const createRequest = useCallback(({ itemId, qty, reason }) => {
    const quantity = Number(qty)
    if (!itemId) return
    if (!Number.isFinite(quantity) || quantity <= 0) return

    setError(null)
    return createPurchaseRequest({ itemId, qty: quantity, reason }).then((created) => {
      if (created) setRequests((prev) => [created, ...prev])
      return created
    })
  }, [])

  const approveRequest = useCallback((requestId) => {
    if (!requestId) return
    setError(null)
    return approvePurchaseRequest(requestId).then((updated) => {
      if (updated) {
        setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      }
      return updated
    })
  }, [])

  const rejectRequest = useCallback((requestId, { message } = {}) => {
    if (!requestId) return
    setError(null)
    return rejectPurchaseRequest(requestId, { message }).then((updated) => {
      if (updated) {
        setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      }
      return updated
    })
  }, [])

  const fetchRequestHistory = useCallback((requestId, { force } = {}) => {
    if (!requestId) return []
    if (!force && Array.isArray(historyByRequestId[requestId])) {
      return historyByRequestId[requestId]
    }

    setHistoryLoadingByRequestId((prev) => ({ ...prev, [requestId]: true }))
    setHistoryErrorByRequestId((prev) => ({ ...prev, [requestId]: null }))
    return getPurchaseRequestHistory(requestId)
      .then((rows) => {
        setHistoryByRequestId((prev) => ({ ...prev, [requestId]: rows }))
        return rows
      })
      .catch(() => {
        setHistoryErrorByRequestId((prev) => ({ ...prev, [requestId]: 'Failed to load request history' }))
        return []
      })
      .finally(() => {
        setHistoryLoadingByRequestId((prev) => ({ ...prev, [requestId]: false }))
      })
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
