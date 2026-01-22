import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { hasAuth } from '../auth'

export default function RequireAuth() {
  const location = useLocation()

  const ok = hasAuth()

  if (!ok) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
