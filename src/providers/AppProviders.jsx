import { InventoryProvider } from '../contexts/InventoryContext'
import { RequestsProvider } from '../contexts/RequestsContext'

export function AppProviders({ children }) {
  return (
    <InventoryProvider>
      <RequestsProvider>{children}</RequestsProvider>
    </InventoryProvider>
  )
}
