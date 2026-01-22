import { useContext } from 'react'
import RequestsContext from '../contexts/RequestsContext'

export function useRequests() {
  const ctx = useContext(RequestsContext)
  if (!ctx) throw new Error('useRequests must be used within <RequestsProvider>')
  return ctx
}
