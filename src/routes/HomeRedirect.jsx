import { Navigate } from 'react-router-dom'
import { getUser } from '../auth'

export default function HomeRedirect() {
  const user = getUser()
  if (!user) return <Navigate to="/login" replace />
  let redirectPath = '/consumer/dashboard'
  if (user.role === 'admin') {
    redirectPath = '/admin/dashboard'
  }
  return <Navigate to={redirectPath} replace />
}
