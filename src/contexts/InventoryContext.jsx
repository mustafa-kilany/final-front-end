import { createContext, useCallback, useMemo, useState } from 'react'
import { fetchItems as fetchInventoryItems } from '../api/inventoryApi'

const InventoryContext = createContext(null)

function toPositiveNumber(value) {
  const n = Number(value)
  if (Number.isFinite(n) && n > 0) {
    return n
  }
  return null
}

export function InventoryProvider({ children }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchItems = useCallback(function() {
    setLoading(true)
    setError(null)

    fetchInventoryItems()
      .then(function(rows) {
        if (Array.isArray(rows)) {
          setItems(rows)
        } else {
          setItems([])
        }
      })
      .catch(function(err) {
        let message = 'Failed to load inventory'
        if (err && err.response && err.response.data && err.response.data.error && err.response.data.error.message) {
          message = err.response.data.error.message
        } else if (err && err.message) {
          message = err.message
        }
        setError(message)
      })
      .finally(function() {
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
