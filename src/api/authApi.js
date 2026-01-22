import { backendHttp } from './backendHttp'

export async function adminSignup({ name, email, password, adminSignupToken }) {
  const response = await backendHttp.post('/api/auth/admin/signup', {
    name,
    email,
    password,
    adminSignupToken,
  })
  return response.data
}

export async function loginApi({ email, password }) {
  const response = await backendHttp.post('/api/auth/login', { email, password })
  return response.data
}

export async function meApi() {
  const response = await backendHttp.get('/api/auth/me')
  return response.data
}
