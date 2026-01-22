import { backendHttp } from './backendHttp'

export function listUsers() {
  return backendHttp.get('/api/users').then((response) => response.data)
}

export function createUser({ name, email, password, role }) {
  return backendHttp
    .post('/api/users', {
      name,
      email,
      password,
      role,
    })
    .then((response) => response.data)
}
