import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'
import { getUser } from '../auth'
import { useInventory } from '../hooks/useInventory'
import { useRequests } from '../hooks/useRequests'
import { computeInventoryStats } from '../utils/inventoryStats'

export default function ConsumerDashboardPage() {
  const user = getUser()
  const { items, loading, error, fetchItems } = useInventory()
  const { requests } = useRequests()

  const didInitialLoad = useRef(false)

  useEffect(() => {
    if (didInitialLoad.current) return
    didInitialLoad.current = true
    if (items.length === 0) fetchItems()
  }, [items.length, fetchItems])

  const stats = useMemo(() => computeInventoryStats(items), [items])

  const myRecentRequests = useMemo(() => {
    if (!user) return []
    return requests
      .filter((r) => r.requestedBy && r.requestedBy.id === user.id)
      .slice(0, 5)
  }, [requests, user])

  const lowList = useMemo(() => {
    return [...stats.lowStockItems]
      .sort((a, b) => a.stockQty - b.stockQty)
      .slice(0, 6)
  }, [stats.lowStockItems])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-slate-600">Quick stock overview for Purchase department.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/consumer/inventory"
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            View inventory
          </Link>
          <Link
            to="/consumer/requests"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
          >
            My requests
          </Link>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total items" value={stats.totalItems} hint="Different products" tone="slate" />
        <StatCard label="Total units" value={stats.totalUnits} hint="Sum of stock quantities" tone="sky" />
        <StatCard label="Low stock" value={stats.lowStockCount} hint="At or below reorder level" tone="amber" />
        <StatCard label="Out of stock" value={stats.outOfStockCount} hint="Need urgent action" tone="red" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Low stock items</div>
              <div className="text-sm text-slate-600">Top items to request soon.</div>
            </div>
            <Link to="/consumer/inventory" className="text-sm font-medium text-sky-700 hover:underline">
              Open inventory
            </Link>
          </div>

          {loading && <div className="mt-3 text-sm text-slate-600">Loading…</div>}

          <div className="mt-3 divide-y rounded-xl border">
            {lowList.map((i) => (
              <div key={i.id} className="flex items-center justify-between px-3 py-3">
                <div>
                  <div className="text-sm font-medium">{i.name}</div>
                  <div className="text-xs text-slate-500">{i.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{i.stockQty}</div>
                  <div className="text-xs text-slate-500">reorder ≤ {i.reorderLevel}</div>
                </div>
              </div>
            ))}

            {!loading && lowList.length === 0 ? (
              <div className="px-3 py-6 text-sm text-slate-600">No low stock items right now.</div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Recent requests</div>
              <div className="text-sm text-slate-600">Your latest purchase requests.</div>
            </div>
            <Link to="/consumer/requests" className="text-sm font-medium text-sky-700 hover:underline">
              View all
            </Link>
          </div>

          <div className="mt-3 divide-y rounded-xl border">
            {myRecentRequests.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-3 py-3">
                <div>
                  <div className="text-sm font-medium">{r.itemName}</div>
                  <div className="text-xs text-slate-500">qty {r.qty}</div>
                </div>
                <span
                  className={
                    r.status === 'approved'
                      ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200'
                      : r.status === 'rejected'
                        ? 'rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800 ring-1 ring-red-200'
                        : 'rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200'
                  }
                >
                  {r.status}
                </span>
              </div>
            ))}

            {myRecentRequests.length === 0 ? (
              <div className="px-3 py-6 text-sm text-slate-600">No requests yet. Create one from Inventory.</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
        Data source: Backend API.
      </div>
    </div>
  )
}
