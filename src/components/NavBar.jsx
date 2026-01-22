import { NavLink, useNavigate } from 'react-router-dom'
import { clearAuth, getUser } from '../auth'

function linkClass({ isActive }) {
  return [
    'rounded-md px-3 py-2 text-sm font-medium',
    isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200',
  ].join(' ')
}

export default function NavBar() {
  const nav = useNavigate()
  const user = getUser()

  const isAdmin = user?.role === 'admin'

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-sky-600" />
          <div>
            <div className="text-lg font-semibold leading-5">InventoryGo</div>
            <div className="text-xs text-slate-500">Clinic supplies inventory demo</div>
          </div>
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-2 md:flex">
              {!isAdmin ? (
                <>
                  <NavLink to="/consumer/dashboard" className={linkClass}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/consumer/inventory" className={linkClass}>
                    Inventory
                  </NavLink>
                  <NavLink to="/consumer/requests" className={linkClass}>
                    My Requests
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/admin/dashboard" className={linkClass}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/admin/inventory" className={linkClass}>
                    Inventory
                  </NavLink>
                  <NavLink to="/admin/requests" className={linkClass}>
                    Requests
                  </NavLink>
                  <NavLink to="/admin/users" className={linkClass}>
                    Users
                  </NavLink>
                </>
              )}
            </nav>

            <div className="text-right">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs text-slate-500">Role: {user.role}</div>
            </div>

            <button
              type="button"
              onClick={() => {
                clearAuth()
                nav('/login', { replace: true })
              }}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}
