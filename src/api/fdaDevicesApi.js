import { backendHttp } from './backendHttp'

// 1) Proxy-search OpenFDA (no DB write)
// GET /api/import/openfda/devices?term=&productCode=&limit=&skip=&includeProductCodes=
export async function searchOpenFdaDevices({
  term,
  productCode,
  limit = 25,
  skip = 0,
  includeProductCodes = false,
} = {}) {
  const response = await backendHttp.get('/api/import/openfda/devices', {
    params: {
      term,
      productCode,
      limit,
      skip,
      includeProductCodes,
    },
  })

  // Backend returns both `result` and `results` for convenience.
  return response.data
}

// 2) Import OpenFDA results into MongoDB (DB write / admin)
// POST /api/import/openfda/devices?term=&productCode=&limit=&skip=
export async function importOpenFdaDevicesToDb({
  term,
  productCode,
  limit = 25,
  skip = 0,
} = {}) {
  const response = await backendHttp.post(
    '/api/import/openfda/devices',
    {},
    {
      params: {
        term,
        productCode,
        limit,
        skip,
      },
    }
  )

  return response.data
}

// 3) Query stored devices from MongoDB
// GET /api/devices?term=&limit=&skip=
export async function listStoredDevices({ term, limit = 25, skip = 0 } = {}) {
  const response = await backendHttp.get('/api/devices', {
    params: { term, limit, skip },
  })
  return response.data
}

// GET /api/devices/:recordKey
export async function getStoredDevice(recordKey) {
  const response = await backendHttp.get(`/api/devices/${encodeURIComponent(recordKey)}`)
  return response.data
}
