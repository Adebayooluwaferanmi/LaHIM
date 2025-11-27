import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LabOrder } from './useLabOrders'

const apiUrl = process.env.REACT_APP_HOSPITALRUN_API || 'http://localhost:3000'

interface CreateLabOrderData {
  patientId: string
  patientName?: string
  orderedBy?: string
  priority?: 'routine' | 'urgent' | 'stat'
  tests: Array<{
    testCode: string
    testName: string
    section?: string
  }>
  notes?: string
}

export const useCreateLabOrder = () => {
  const queryClient = useQueryClient()

  return useMutation<LabOrder, Error, CreateLabOrderData>({
    mutationFn: async (data) => {
      const response = await fetch(`${apiUrl}/lab-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || `Failed to create lab order: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-orders'] })
    },
  })
}

