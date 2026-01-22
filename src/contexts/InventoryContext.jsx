import { createContext, useCallback, useMemo, useState } from 'react'
import { fetchItems as fetchInventoryItems } from '../api/inventoryApi'

const InventoryContext = createContext(null)

function toPositiveNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function InventoryProvider({ children }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchItems = useCallback(() => {
    setLoading(true)
    setError(null)

    return fetchInventoryItems()
      .then((rows) => {
        setItems(Array.isArray(rows) ? rows : [])
        return rows
      })
      .catch(() => {
        setError('Failed to load inventory')
        return []
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const deleteItem = useCallback((itemId) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId))
  }, [])

  const adjustStock = useCallback((itemId, delta) => {
    const change = toPositiveNumber(delta)
    if (change == null) return

    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== itemId) return i

        const current = Number(i.stockQty) || 0
        const next = Math.max(0, current + change)
        return { ...i, stockQty: next }
      }),
    )
  }, [])

  const consumeStock = useCallback((itemId, qty) => {
    const quantity = toPositiveNumber(qty)
    if (quantity == null) return
    adjustStock(itemId, -quantity)
  }, [adjustStock])

  const restock = useCallback((itemId, qty) => {
    const quantity = toPositiveNumber(qty)
    if (quantity == null) return
    adjustStock(itemId, quantity)
  }, [adjustStock])

  const value = useMemo(
    () => ({
      items,
      loading,
      error,
      fetchItems,
      deleteItem,
      consumeStock,
      restock,
    }),
    [items, loading, error, fetchItems, deleteItem, consumeStock, restock],
  )

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

export default InventoryContext
