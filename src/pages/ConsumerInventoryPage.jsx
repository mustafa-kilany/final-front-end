import { useEffect, useMemo, useState } from 'react'
import { useInventory } from '../hooks/useInventory'
import { useRequests } from '../hooks/useRequests'
import { getUser } from '../auth'

function stockBadge(item) {
  const isLow = item.stockQty <= item.reorderLevel
  if (isLow) {
    return 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
  }
  return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
}

export default function ConsumerInventoryPage() {
  const user = getUser()
  let isAdmin = false
  if (user && user.role === 'admin') {
    isAdmin = true
  }

  const { items, loading, error, fetchItems } = useInventory()
  const { createRequest } = useRequests()

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [qty, setQty] = useState(1)
  const [reason, setReason] = useState('')

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
  }, [items, query])

  function openRequest(item) {
    setSelected(item)
    setQty(1)
    setReason('')
  }

  function submitRequest() {
    if (!selected) return

    createRequest({
      itemId: selected.id,
      qty,
      reason,
    })

    setSelected(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inventory</h1>
          <p className="text-sm text-slate-600">Items are loaded from the backend API.</p>
        </div>

        <div className="flex gap-2">
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-sky-500 sm:w-80"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items…"
          />
          <button
            type="button"
            onClick={fetchItems}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && <div className="text-sm text-slate-600">Loading inventory…</div>}
      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {isAdmin ? (
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
          Admins can view inventory, but stocking happens only by approving Purchase requests.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="whitespace-nowrap px-4 py-3">Item</th>
                <th className="whitespace-nowrap px-4 py-3">Category</th>
                <th className="whitespace-nowrap px-4 py-3">Stock</th>
                <th className="whitespace-nowrap px-4 py-3" />
              </tr>
            </thead>
          <tbody className="divide-y">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-slate-500">Brand: {item.manufacturer}</div>
                </td>
                <td className="px-4 py-3 text-slate-700">{item.category}</td>
                <td className="px-4 py-3">
                  <span className={["inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", stockBadge(item)].join(' ')}>
                    {item.stockQty} in stock
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {!isAdmin ? (
                    <button
                      type="button"
                      onClick={() => openRequest(item)}
                      className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
                    >
                      Request Purchase
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}

            {!loading && filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-slate-600" colSpan={4}>
                  {query.trim()
                    ? 'No items match your search.'
                    : 'No inventory items found yet.'}
                </td>
              </tr>
            ) : null}
          </tbody>
          </table>
        </div>
      </div>

      {selected && !isAdmin ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold">Purchase request</div>
                <div className="text-sm text-slate-600">{selected.name}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  type="number"
                  min={1}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Current stock</label>
                <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  {selected.stockQty}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Reason</label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Why do we need this item?"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitRequest}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
              >
                Submit request
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
