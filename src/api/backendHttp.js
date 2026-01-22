import axios from 'axios'

import { getToken, getUser } from '../auth'

export const backendHttp = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 15000,
})

backendHttp.interceptors.request.use(function(config) {
  const token = getToken()
  const user = getUser()

  
  if (user && user.id) {
    config.headers = config.headers || {}
    config.headers['x-user-id'] = user.id
  }

  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = 'Bearer ' + token
  }
  return config
})
