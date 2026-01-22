import { backendHttp } from './backendHttp'

// 1) Proxy-search OpenFDA (no DB write)
// GET /api/import/openfda/devices?term=&productCode=&limit=&skip=&includeProductCodes=
export function searchOpenFdaDevices({
  term,
  productCode,
  limit = 25,
  skip = 0,
  includeProductCodes = false,
} = {}) {
  return backendHttp
    .get('/api/import/openfda/devices', {
      params: {
        term,
        productCode,
        limit,
        skip,
        includeProductCodes,
      },
    })
    .then((response) => response.data)
}

// 2) Import OpenFDA results into MongoDB (DB write / admin)
// POST /api/import/openfda/devices?term=&productCode=&limit=&skip=
export function importOpenFdaDevicesToDb({
  term,
  productCode,
  limit = 25,
  skip = 0,
} = {}) {
  return backendHttp
    .post(
      '/api/import/openfda/devices',
      {},
      {
        params: {
          term,
          productCode,
          limit,
          skip,
        },
      },
    )
    .then((response) => response.data)
}

// 3) Query stored devices from MongoDB
// GET /api/devices?term=&limit=&skip=
export function listStoredDevices({ term, limit = 25, skip = 0 } = {}) {
  return backendHttp.get('/api/devices', { params: { term, limit, skip } }).then((response) => response.data)
}

// GET /api/devices/:recordKey
export function getStoredDevice(recordKey) {
  return backendHttp.get(`/api/devices/${encodeURIComponent(recordKey)}`).then((response) => response.data)
}
