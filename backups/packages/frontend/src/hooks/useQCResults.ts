import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const apiUrl = process.env.REACT_APP_HOSPITALRUN_API || 'http://localhost:3000'

export interface QCMaterial {
  id?: string
  _id?: string
  materialName?: string
  lotNumber?: string
  testCode?: any
  testName?: string
  targetValue?: number
  sd?: number
  unit?: string
  acceptableRange?: {
    min?: number
    max?: number
  }
}

export interface QCResult {
  id?: string
  _id?: string
  testCode?: any
  testName?: string
  materialId?: string
  materialName?: string
  materialLot?: string
  instrumentId?: string
  instrumentName?: string
  measuredValue?: number
  targetValue?: number
  status?: 'pass' | 'fail' | 'warning'
  runDate?: string
  runNumber?: string
  notes?: string
}

export interface UseQCResultsParams {
  testCode?: string
  status?: string
  materialId?: string
  instrumentId?: string
}

export const useQCResults = (params: UseQCResultsParams = {}) => {
  const queryParams = new URLSearchParams()
  if (params.testCode) queryParams.append('testCode', params.testCode)
  if (params.status) queryParams.append('status', params.status)
  if (params.materialId) queryParams.append('materialId', params.materialId)
  if (params.instrumentId) queryParams.append('instrumentId', params.instrumentId)

  const queryString = queryParams.toString()
  const url = `${apiUrl}/qc-results${queryString ? `?${queryString}` : ''}`

  return useQuery<QCResult[]>({
    queryKey: ['qc-results', params],
    queryFn: async () => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch QC results: ${response.statusText}`)
      }
      const data = await response.json()
      return Array.isArray(data) ? data : data.results || []
    },
  })
}

export const useQCResult = (id: string | undefined) => {
  return useQuery<QCResult>({
    queryKey: ['qc-result', id],
    queryFn: async () => {
      if (!id) throw new Error('QC result ID is required')
      const response = await fetch(`${apiUrl}/qc-results/${id}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch QC result: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: !!id,
  })
}

export const useQCMaterials = (params: { active?: boolean } = {}) => {
  const queryParams = new URLSearchParams()
  if (params.active !== undefined) queryParams.append('active', String(params.active))

  const queryString = queryParams.toString()
  const url = `${apiUrl}/qc-materials${queryString ? `?${queryString}` : ''}`

  return useQuery<QCMaterial[]>({
    queryKey: ['qc-materials', params],
    queryFn: async () => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch QC materials: ${response.statusText}`)
      }
      const data = await response.json()
      return Array.isArray(data) ? data : data.materials || []
    },
  })
}

export const useCreateQCResult = () => {
  const queryClient = useQueryClient()

  return useMutation<QCResult, Error, Partial<QCResult>>({
    mutationFn: async (data) => {
      const response = await fetch(`${apiUrl}/qc-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || `Failed to create QC result: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qc-results'] })
    },
  })
}

