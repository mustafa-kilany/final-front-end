import { Navigate } from 'react-router-dom'
import { getUser } from '../auth'

export default function HomeRedirect() {
  const user = getUser()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/consumer/dashboard'} replace />
}
