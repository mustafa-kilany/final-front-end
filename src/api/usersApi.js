import { backendHttp } from './backendHttp'

export async function listUsers() {
  const response = await backendHttp.get('/api/users')
  return response.data
}

export async function createUser({ name, email, password, role }) {
  const response = await backendHttp.post('/api/users', {
    name,
    email,
    password,
    role,
  })
  return response.data
}
