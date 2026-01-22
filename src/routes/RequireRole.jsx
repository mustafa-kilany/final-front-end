import { Navigate, Outlet } from 'react-router-dom'
import { getUser } from '../auth'

export default function RequireRole({ role }) {
  const user = getUser()

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to="/" replace />

  return <Outlet />
}
