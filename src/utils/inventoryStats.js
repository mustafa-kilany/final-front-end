export function computeInventoryStats(items) {
  const totalItems = items.length
  const totalUnits = items.reduce((sum, i) => sum + (Number(i.stockQty) || 0), 0)
  const lowStockItems = items.filter((i) => (Number(i.stockQty) || 0) <= (Number(i.reorderLevel) || 0))
  const outOfStockItems = items.filter((i) => (Number(i.stockQty) || 0) === 0)

  const byCategory = new Map()
  for (const item of items) {
    const category = item.category || 'supplies'
    const prev = byCategory.get(category) || {
      category,
      itemCount: 0,
      totalUnits: 0,
      lowCount: 0,
      outCount: 0,
    }

    const stockQty = Number(item.stockQty) || 0
    const reorderLevel = Number(item.reorderLevel) || 0

    let lowIncrement = 0
    if (stockQty <= reorderLevel) {
      lowIncrement = 1
    }
    let outIncrement = 0
    if (stockQty === 0) {
      outIncrement = 1
    }

    const next = {
      ...prev,
      itemCount: prev.itemCount + 1,
      totalUnits: prev.totalUnits + stockQty,
      lowCount: prev.lowCount + lowIncrement,
      outCount: prev.outCount + outIncrement,
    }

    byCategory.set(category, next)
  }

  const categories = Array.from(byCategory.values()).sort((a, b) => b.totalUnits - a.totalUnits)

  return {
    totalItems,
    totalUnits,
    lowStockCount: lowStockItems.length,
    outOfStockCount: outOfStockItems.length,
    lowStockItems,
    outOfStockItems,
    categories,
  }
}
