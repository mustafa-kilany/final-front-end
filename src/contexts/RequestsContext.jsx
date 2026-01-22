import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPurchaseRequest, listRequests, approvePurchaseRequest, rejectPurchaseRequest } from '../api/requestsApi'

const RequestsContext = createContext(null)

export function RequestsProvider({ children }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const didInitialLoad = useRef(false)

  const fetchRequests = useCallback(function() {
    setLoading(true)
    setError(null)
    listRequests()
      .then(function(rows) {
        if (Array.isArray(rows)) {
          setRequests(rows)
        } else {
          setRequests([])
        }
      })
      .catch(function(err) {
        let msg = 'Failed to load requests'
        if (err && err.response && err.response.data && err.response.data.message) {
          msg = err.response.data.message
        } else if (err && err.message) {
          msg = err.message
        }
        setError(msg)
      })
      .finally(function() {
        setLoading(false)
      })
  }, [])

  useEffect(function() {
    if (didInitialLoad.current) return
    didInitialLoad.current = true
    fetchRequests()
  }, [fetchRequests])

  const createRequest = useCallback(function({ itemId, qty, reason }) {
    const quantity = Number(qty)
    if (!itemId) return
    if (!Number.isFinite(quantity) || quantity <= 0) return

    setError(null)
    return createPurchaseRequest({ itemId, qty: quantity, reason }).then(function(created) {
      if (created) {
        setRequests(function(prev) {
          return [created].concat(prev)
        })
      }
      return created
    })
  }, [])

  const approveRequest = useCallback(function(requestId) {
    if (!requestId) return
    setError(null)
    return approvePurchaseRequest(requestId).then(function(updated) {
      if (updated) {
        setRequests(function(prev) {
          return prev.map(function(r) {
            if (r.id === updated.id) {
              return updated
            }
            return r
          })
        })
      }
      return updated
    })
  }, [])

  const rejectRequest = useCallback(function(requestId, opts) {
    if (!requestId) return
    let message = undefined
    if (opts && opts.message) {
      message = opts.message
    }
    setError(null)
    return rejectPurchaseRequest(requestId, { message: message }).then(function(updated) {
      if (updated) {
        setRequests(function(prev) {
          return prev.map(function(r) {
            if (r.id === updated.id) {
              return updated
            }
            return r
          })
        })
      }
      return updated
    })
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
