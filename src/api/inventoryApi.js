import { backendHttp } from './backendHttp'

function toNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function normalizeItem(raw) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.id || raw._id || null
  const name = String(raw.name ?? raw.title ?? '').trim()

  // Backend model currently uses `qty`; UI expects `stockQty`.
  const stockQty = toNumber(raw.stockQty ?? raw.qty ?? 0, 0)

  return {
    ...raw,
    id,
    name,
    category: String(raw.category ?? 'General'),
    manufacturer: String(raw.manufacturer ?? raw.brand ?? '—'),
    stockQty,
    reorderLevel: toNumber(raw.reorderLevel ?? 10, 10),
  }
}

export async function fetchItems() {
  const response = await backendHttp.get('/api/items')

  const data = response?.data

  const rows =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.data) && data.data) ||
    (Array.isArray(data?.results) && data.results) ||
    (Array.isArray(data?.rows) && data.rows) ||
    []

  return rows.map(normalizeItem).filter(Boolean)
}

export async function importOpenFdaItemsToDb({ term, productCode, limit = 25, skip = 0, mode = 'upsert' } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 100)
  const safeSkip = Math.max(Number(skip) || 0, 0)
  const safeMode = mode === 'replace' ? 'replace' : 'upsert'

  const response = await backendHttp.post(
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
  )

  return response.data
}
