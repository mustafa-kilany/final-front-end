import { useEffect, useMemo, useRef, useState } from 'react'
import StatCard from '../components/StatCard'
import { useInventory } from '../hooks/useInventory'
import { useRequests } from '../hooks/useRequests'
import { computeInventoryStats } from '../utils/inventoryStats'
import { importOpenFdaItemsToDb } from '../api/inventoryApi'

function percent(n, d) {
  if (!d) return 0
  return Math.round((n / d) * 100)
}

export default function AdminStockDashboardPage() {
  const { items, loading, error, fetchItems } = useInventory()
  const { requests } = useRequests()

  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState(null)

  const didInitialLoad = useRef(false)

  useEffect(() => {
    if (didInitialLoad.current) return
    didInitialLoad.current = true
    if (items.length === 0) fetchItems()
  }, [items.length, fetchItems])

  async function handleImportFromFda() {
    setImporting(true)
    setImportError(null)

    try {
      const term = window.prompt('FDA import search term (e.g., stent, syringe):', 'stent')
      if (term == null) return
      await importOpenFdaItemsToDb({ term: String(term).trim(), limit: 25, mode: 'replace' })
      await fetchItems()
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Import failed'
      setImportError(msg)
    } finally {
      setImporting(false)
    }
  }

  const stats = useMemo(() => computeInventoryStats(items), [items])

  const pendingCount = useMemo(() => requests.filter((r) => r.status === 'pending').length, [requests])
  const approvedCount = useMemo(() => requests.filter((r) => r.status === 'approved').length, [requests])

  const lowPercent = useMemo(() => percent(stats.lowStockCount, stats.totalItems), [stats.lowStockCount, stats.totalItems])
  const outPercent = useMemo(() => percent(stats.outOfStockCount, stats.totalItems), [stats.outOfStockCount, stats.totalItems])

  const lowestItems = useMemo(() => {
    return [...items].sort((a, b) => a.stockQty - b.stockQty).slice(0, 10)
  }, [items])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-slate-600">Deeper stock analysis for Finance.</p>
      </div>

      {error ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      {importError ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{importError}</div> : null}

      {!loading && items.length === 0 ? (
        <div className="rounded-2xl border bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-lg font-semibold">No items in inventory</div>
              <div className="text-sm text-slate-600">If inventory is empty, import from openFDA.</div>
            </div>
            <button
              type="button"
              disabled={importing}
              onClick={handleImportFromFda}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {importing ? 'Importing…' : 'Import From FDA'}
            </button>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Uses <span className="font-mono">POST /api/import/openfda/items</span> (admin-only).
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <StatCard label="Total items" value={stats.totalItems} hint="Different products" tone="slate" />
        </div>
        <div className="lg:col-span-2">
          <StatCard label="Total units" value={stats.totalUnits} hint="All units in stock" tone="sky" />
        </div>
        <StatCard label="Low stock" value={`${stats.lowStockCount} (${lowPercent}%)`} hint="At/below reorder" tone="amber" />
        <StatCard label="Out" value={`${stats.outOfStockCount} (${outPercent}%)`} hint="Zero stock" tone="red" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Category breakdown</div>
              <div className="text-sm text-slate-600">Where stock is concentrated, and where risk is.</div>
            </div>
          </div>

          {loading ? <div className="mt-3 text-sm text-slate-600">Loading…</div> : null}

          <div className="mt-3 overflow-hidden rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Units</th>
                  <th className="px-4 py-3">Low</th>
                  <th className="px-4 py-3">Out</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.categories.slice(0, 10).map((c) => (
                  <tr key={c.category} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{c.category}</td>
                    <td className="px-4 py-3">{c.itemCount}</td>
                    <td className="px-4 py-3">{c.totalUnits}</td>
                    <td className="px-4 py-3">{c.lowCount}</td>
                    <td className="px-4 py-3">{c.outCount}</td>
                  </tr>
                ))}

                {!loading && stats.categories.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-sm text-slate-600" colSpan={5}>
                      No data yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-4">
            <div className="text-lg font-semibold">Requests snapshot</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <StatCard label="Pending" value={pendingCount} tone="amber" />
              <StatCard label="Approved" value={approvedCount} tone="emerald" />
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <div className="text-lg font-semibold">Lowest stock items</div>
            <div className="mt-3 divide-y rounded-xl border">
              {lowestItems.map((i) => (
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

              {!loading && lowestItems.length === 0 ? (
                <div className="px-3 py-6 text-sm text-slate-600">No items yet.</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
        Data source: Backend API.
      </div>
    </div>
  )
}
