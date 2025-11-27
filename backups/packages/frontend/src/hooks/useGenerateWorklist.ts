import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Worklist } from './useWorklists'

const apiUrl = process.env.REACT_APP_HOSPITALRUN_API || 'http://localhost:3000'

interface GenerateWorklistData {
  section?: string
  priority?: 'routine' | 'urgent' | 'stat'
  orderIds?: string[]
}

export const useGenerateWorklist = () => {
  const queryClient = useQueryClient()

  return useMutation<Worklist, Error, GenerateWorklistData>({
    mutationFn: async (data) => {
      const response = await fetch(`${apiUrl}/worklists/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || `Failed to generate worklist: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worklists'] })
    },
  })
}

