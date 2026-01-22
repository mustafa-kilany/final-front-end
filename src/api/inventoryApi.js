import { backendHttp } from './backendHttp'

function toNumber(value, fallback = 0) {
  const n = Number(value)
  if (Number.isFinite(n)) {
    return n
  }
  return fallback
}

function normalizeItem(raw) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.id || raw._id || null
  let name = ''
  if (raw.name) {
    name = String(raw.name).trim()
  } else if (raw.title) {
    name = String(raw.title).trim()
  }

  // Backend model currently uses `qty`; UI expects `stockQty`.
  let stockQtyValue = 0
  if (raw.stockQty !== undefined && raw.stockQty !== null) {
    stockQtyValue = raw.stockQty
  } else if (raw.qty !== undefined && raw.qty !== null) {
    stockQtyValue = raw.qty
  }
  const stockQty = toNumber(stockQtyValue, 0)

  let category = 'General'
  if (raw.category) {
    category = String(raw.category)
  }

  let manufacturer = '—'
  if (raw.manufacturer) {
    manufacturer = String(raw.manufacturer)
  } else if (raw.brand) {
    manufacturer = String(raw.brand)
  }

  let reorderLevelValue = 10
  if (raw.reorderLevel !== undefined && raw.reorderLevel !== null) {
    reorderLevelValue = raw.reorderLevel
  }

  return {
    ...raw,
    id,
    name,
    category: category,
    manufacturer: manufacturer,
    stockQty,
    reorderLevel: toNumber(reorderLevelValue, 10),
  }
}

export function fetchItems() {
  return backendHttp.get('/api/items').then(function(response) {
    let data = null
    if (response && response.data) {
      data = response.data
    }

    let rows = []
    if (Array.isArray(data)) {
      rows = data
    } else if (data && Array.isArray(data.items)) {
      rows = data.items
    } else if (data && Array.isArray(data.data)) {
      rows = data.data
    } else if (data && Array.isArray(data.results)) {
      rows = data.results
    } else if (data && Array.isArray(data.rows)) {
      rows = data.rows
    }

    return rows.map(normalizeItem).filter(Boolean)
  })
}

export function importOpenFdaItemsToDb({ term, productCode, limit = 25, skip = 0, mode = 'upsert' } = {}) {
  let safeLimit = Number(limit) || 25
  if (safeLimit < 1) {
    safeLimit = 1
  }
  if (safeLimit > 100) {
    safeLimit = 100
  }

  let safeSkip = Number(skip) || 0
  if (safeSkip < 0) {
    safeSkip = 0
  }

  let safeMode = 'upsert'
  if (mode === 'replace') {
    safeMode = 'replace'
  }

  return backendHttp.post(
    '/api/import/openfda/items',
    {},
    {
      params: {
        term,
        productCode,
        limit: safeLimit,
        skip: safeSkip,
        mode: safeMode,
      },
    },
  ).then(function(response) {
    return response.data
  })
}
