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

  let itemId = null
  if (raw.itemId && raw.itemId._id) {
    itemId = raw.itemId._id
  } else if (raw.itemId && raw.itemId.id) {
    itemId = raw.itemId.id
  } else if (raw.itemId) {
    itemId = raw.itemId
  }

  return {
    ...raw,
    id: raw.id || raw._id || null,
    itemId: itemId,
    requestedBy: normalizeUser(raw.requestedBy) || raw.requestedBy,
    approvedBy: normalizeUser(raw.approvedBy) || raw.approvedBy,
    rejectedBy: normalizeUser(raw.rejectedBy) || raw.rejectedBy,
  }
}

export function listRequests({ status } = {}) {
  return backendHttp.get('/api/requests', { params: { status } }).then(function(response) {
    let data = null
    if (response && response.data) {
      data = response.data
    }
    let rows = []
    if (Array.isArray(data)) {
      rows = data
    } else if (data && Array.isArray(data.requests)) {
      rows = data.requests
    }
    return rows.map(normalizeRequest).filter(Boolean)
  })
}

export function createPurchaseRequest({ itemId, qty, reason }) {
  return backendHttp.post('/api/requests', { itemId, qty, reason }).then(function(response) {
    let data = null
    if (response && response.data) {
      data = response.data
    }
    return normalizeRequest(data)
  })
}

export function approvePurchaseRequest(requestId) {
  return backendHttp.post('/api/requests/' + encodeURIComponent(requestId) + '/approve').then(function(response) {
    let data = null
    if (response && response.data) {
      data = response.data
    }
    return normalizeRequest(data)
  })
}

export function rejectPurchaseRequest(requestId, { message } = {}) {
  return backendHttp.post('/api/requests/' + encodeURIComponent(requestId) + '/reject', { message }).then(function(response) {
    let data = null
    if (response && response.data) {
      data = response.data
    }
    return normalizeRequest(data)
  })
}
