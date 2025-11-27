import { useQuery } from '@tanstack/react-query'

const apiUrl = process.env.REACT_APP_HOSPITALRUN_API || 'http://localhost:3000'

export interface LabOrder {
  id?: string
  _id?: string
  orderNumber?: string
  patientId?: string
  patientName?: string
  orderedBy?: string
  orderedDate?: string
  status?: 'pending' | 'collected' | 'received' | 'processing' | 'completed' | 'cancelled'
  priority?: 'routine' | 'urgent' | 'stat'
  tests?: Array<{
    testCode?: string
    testName?: string
    section?: string
  }>
  specimenId?: string
  notes?: string
}

interface UseLabOrdersParams {
  status?: string
  priority?: string
  patientId?: string
  search?: string
}

export const useLabOrders = (params: UseLabOrdersParams = {}) => {
  const queryParams = new URLSearchParams()
  if (params.status) queryParams.append('status', params.status)
  if (params.priority) queryParams.append('priority', params.priority)
  if (params.patientId) queryParams.append('patientId', params.patientId)
  if (params.search) queryParams.append('search', params.search)

  const queryString = queryParams.toString()
  const url = `${apiUrl}/lab-orders${queryString ? `?${queryString}` : ''}`

  return useQuery<LabOrder[]>({
    queryKey: ['lab-orders', params],
    queryFn: async () => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch lab orders: ${response.statusText}`)
      }
      const data = await response.json()
      return Array.isArray(data) ? data : data.orders || []
    },
  })
}

export const useLabOrder = (id: string | undefined) => {
  return useQuery<LabOrder>({
    queryKey: ['lab-order', id],
    queryFn: async () => {
      if (!id) throw new Error('Lab order ID is required')
      const response = await fetch(`${apiUrl}/lab-orders/${id}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch lab order: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: !!id,
  })
}

