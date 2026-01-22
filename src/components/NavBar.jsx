import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { clearAuth, getUser } from '../auth'

function linkClass({ isActive }) {
  let activeClass = 'text-slate-700 hover:bg-slate-200'
  if (isActive) {
    activeClass = 'bg-slate-900 text-white'
  }
  return [
    'rounded-md px-3 py-2 text-sm font-medium',
    activeClass,
  ].join(' ')
}

export default function NavBar() {
  const nav = useNavigate()
  const user = getUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  let isAdmin = false
  if (user && user.role === 'admin') {
    isAdmin = true
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-sky-600" />
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold leading-5">InventoryGo</div>
            <div className="hidden text-xs text-slate-500 sm:block">Clinic supplies inventory demo</div>
          </div>
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            {/* desktop nav */}
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

            <div className="hidden text-right sm:block">
              <div className="max-w-[10rem] truncate text-sm font-medium">{user.name}</div>
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

            {/* mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-md border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50 md:hidden"
              aria-label="Toggle menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        ) : null}
      </div>

      {/* mobile menu dropdown */}
      {user && mobileMenuOpen ? (
        <div className="border-t bg-white px-4 py-3 md:hidden">
          <div className="mb-3 border-b pb-3">
            <div className="text-sm font-medium">{user.name}</div>
            <div className="text-xs text-slate-500">Role: {user.role}</div>
          </div>
          <nav className="flex flex-col gap-1">
            {!isAdmin ? (
              <>
                <NavLink to="/consumer/dashboard" className={linkClass} onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </NavLink>
                <NavLink to="/consumer/inventory" className={linkClass} onClick={() => setMobileMenuOpen(false)}>
                  Inventory
                </NavLink>
                <NavLink to="/consumer/requests" className={linkClass} onClick={() => setMobileMenuOpen(false)}>
                  My Requests
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/admin/dashboard" className={linkClass} onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </NavLink>
                <NavLink to="/admin/inventory" className={linkClass} onClick={() => setMobileMenuOpen(false)}>
                  Inventory
                </NavLink>
                <NavLink to="/admin/requests" className={linkClass} onClick={() => setMobileMenuOpen(false)}>
                  Requests
                </NavLink>
                <NavLink to="/admin/users" className={linkClass} onClick={() => setMobileMenuOpen(false)}>
                  Users
                </NavLink>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
