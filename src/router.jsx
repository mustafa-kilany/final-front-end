import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import AuthLayout from './layouts/AuthLayout'
import RequireAuth from './routes/RequireAuth'
import RequireRole from './routes/RequireRole'
import HomeRedirect from './routes/HomeRedirect'
import LoginPage from './pages/LoginPage'
import ConsumerDashboardPage from './pages/ConsumerDashboardPage'
import ConsumerInventoryPage from './pages/ConsumerInventoryPage'
import ConsumerRequestsPage from './pages/ConsumerRequestsPage'
import AdminStockDashboardPage from './pages/AdminStockDashboardPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminUsersPage from './pages/AdminUsersPage'
import NotFoundPage from './pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomeRedirect /> },

      {
        element: <AuthLayout />,
        children: [{ path: 'login', element: <LoginPage /> }],
      },

      {
        element: <RequireAuth />,
        children: [
          {
            path: 'consumer',
            children: [
              { path: 'dashboard', element: <ConsumerDashboardPage /> },
              { path: 'inventory', element: <ConsumerInventoryPage /> },
              { path: 'requests', element: <ConsumerRequestsPage /> },
            ],
          },
          {
            element: <RequireRole role="admin" />,
            children: [
              {
                path: 'admin',
                children: [
                  { path: 'dashboard', element: <AdminStockDashboardPage /> },
                  { path: 'inventory', element: <ConsumerInventoryPage /> },
                  { path: 'requests', element: <AdminDashboardPage /> },
                  { path: 'users', element: <AdminUsersPage /> },
                ],
              },
            ],
          },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
