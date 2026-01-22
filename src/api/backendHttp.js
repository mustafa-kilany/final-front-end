import axios from 'axios'

import { getToken, getUser } from '../auth'

export const backendHttp = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 15000,
})

backendHttp.interceptors.request.use((config) => {
  const token = getToken()
  const user = getUser()

  // Backend auth is header-based (see backend/README.md).
  // Prefer sending x-user-id for authenticated routes.
  if (user?.id) {
    config.headers = config.headers || {}
    config.headers['x-user-id'] = user.id
  }

  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
