import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const apiUrl = process.env.REACT_APP_HOSPITALRUN_API || 'http://localhost:3000'

export interface Report {
  id?: string
  _id?: string
  reportNumber?: string
  patientId?: string
  patientName?: string
  reportDate?: string
  status?: 'draft' | 'final' | 'signed' | 'delivered' | 'cancelled'
  signedBy?: string
  signedDate?: string
  deliveredBy?: string
  deliveredDate?: string
  deliveryMethod?: string
  results?: any[]
}

interface UseReportsParams {
  status?: string
  patientId?: string
  dateFrom?: string
  dateTo?: string
}

export const useReports = (params: UseReportsParams = {}) => {
  const queryParams = new URLSearchParams()
  if (params.status) queryParams.append('status', params.status)
  if (params.patientId) queryParams.append('patientId', params.patientId)
  if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom)
  if (params.dateTo) queryParams.append('dateTo', params.dateTo)

  const queryString = queryParams.toString()
  const url = `${apiUrl}/reports${queryString ? `?${queryString}` : ''}`

  return useQuery<Report[]>({
    queryKey: ['reports', params],
    queryFn: async () => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.statusText}`)
      }
      const data = await response.json()
      return Array.isArray(data) ? data : data.reports || []
    },
  })
}

export const useReport = (id: string | undefined) => {
  return useQuery<Report>({
    queryKey: ['report', id],
    queryFn: async () => {
      if (!id) throw new Error('Report ID is required')
      const response = await fetch(`${apiUrl}/reports/${id}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch report: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: !!id,
  })
}

export const useGenerateReport = () => {
  const queryClient = useQueryClient()

  return useMutation<Report, Error, { patientId: string; resultIds?: string[]; format?: string }>({
    mutationFn: async (data) => {
      const response = await fetch(`${apiUrl}/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || `Failed to generate report: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export const useSignReport = () => {
  const queryClient = useQueryClient()

  return useMutation<Report, Error, { id: string; signedBy: string }>({
    mutationFn: async ({ id, signedBy }) => {
      const response = await fetch(`${apiUrl}/reports/${id}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signedBy }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || `Failed to sign report: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export const useDeliverReport = () => {
  const queryClient = useQueryClient()

  return useMutation<Report, Error, { id: string; method: string; recipient?: string }>({
    mutationFn: async ({ id, method, recipient }) => {
      const response = await fetch(`${apiUrl}/reports/${id}/deliver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ method, recipient }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || `Failed to deliver report: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

