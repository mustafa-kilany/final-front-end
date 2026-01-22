import { backendHttp } from './backendHttp'

export function adminSignup({ name, email, password, adminSignupToken }) {
  return backendHttp.post('/api/auth/admin/signup', {
    name,
    email,
    password,
    adminSignupToken,
  }).then(function(response) {
    return response.data
  })
}

export function loginApi({ email, password }) {
  return backendHttp.post('/api/auth/login', { email, password }).then(function(response) {
    return response.data
  })
}

export function meApi() {
  return backendHttp.get('/api/auth/me').then(function(response) {
    return response.data
  })
}
