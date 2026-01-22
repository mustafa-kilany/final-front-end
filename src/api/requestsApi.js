import { backendHttp } from './backendHttp'

function normalizeUser(u) {
  if (!u || typeof u !== 'object') return null
  return {
    ...u,
    id: u.id || u._id || u.userId || null,
  }
}

function normalizeRequest(raw) {
  if (!raw || typeof raw !== 'object') return null

  return {
    ...raw,
    id: raw.id || raw._id || null,
    itemId: raw.itemId?._id || raw.itemId?.id || raw.itemId || null,
    requestedBy: normalizeUser(raw.requestedBy) || raw.requestedBy,
    approvedBy: normalizeUser(raw.approvedBy) || raw.approvedBy,
    rejectedBy: normalizeUser(raw.rejectedBy) || raw.rejectedBy,
  }
}

function normalizeHistoryEntry(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    ...raw,
    id: raw.id || raw._id || null,
    requestId: raw.requestId?._id || raw.requestId?.id || raw.requestId || null,
    actor: normalizeUser(raw.actor) || raw.actor || null,
  }
}

export function listRequests({ status } = {}) {
  return backendHttp.get('/api/requests', { params: { status } }).then((response) => {
    const data = response?.data
    const rows = Array.isArray(data) ? data : Array.isArray(data?.requests) ? data.requests : []
    return rows.map(normalizeRequest).filter(Boolean)
  })
}

export function createPurchaseRequest({ itemId, qty, reason }) {
  return backendHttp
    .post('/api/requests', { itemId, qty, reason })
    .then((response) => normalizeRequest(response?.data))
}

export function approvePurchaseRequest(requestId) {
  return backendHttp
    .post(`/api/requests/${encodeURIComponent(requestId)}/approve`)
    .then((response) => normalizeRequest(response?.data))
}

export function rejectPurchaseRequest(requestId, { message } = {}) {
  return backendHttp
    .post(`/api/requests/${encodeURIComponent(requestId)}/reject`, { message })
    .then((response) => normalizeRequest(response?.data))
}

export function getPurchaseRequestHistory(requestId) {
  return backendHttp.get(`/api/requests/${encodeURIComponent(requestId)}/history`).then((response) => {
    const data = response?.data
    const rows = Array.isArray(data) ? data : Array.isArray(data?.history) ? data.history : []
    return rows.map(normalizeHistoryEntry).filter(Boolean)
  })
}
