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

export async function listRequests({ status } = {}) {
  const response = await backendHttp.get('/api/requests', { params: { status } })
  const data = response?.data
  const rows = Array.isArray(data) ? data : Array.isArray(data?.requests) ? data.requests : []
  return rows.map(normalizeRequest).filter(Boolean)
}

export async function createPurchaseRequest({ itemId, qty, reason }) {
  const response = await backendHttp.post('/api/requests', { itemId, qty, reason })
  return normalizeRequest(response?.data)
}

export async function approvePurchaseRequest(requestId) {
  const response = await backendHttp.post(`/api/requests/${encodeURIComponent(requestId)}/approve`)
  return normalizeRequest(response?.data)
}

export async function rejectPurchaseRequest(requestId, { message } = {}) {
  const response = await backendHttp.post(`/api/requests/${encodeURIComponent(requestId)}/reject`, { message })
  return normalizeRequest(response?.data)
}
