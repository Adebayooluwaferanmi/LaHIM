import { useQuery } from '@tanstack/react-query'

const apiUrl = process.env.REACT_APP_HOSPITALRUN_API || 'http://localhost:3000'

export interface Specimen {
  id?: string
  _id?: string
  accessionNumber?: string
  specimenType?: string
  collectionDate?: string
  receivedDate?: string
  status?: 'pending' | 'collected' | 'received' | 'processing' | 'completed'
  labOrderId?: string
  patientId?: string
  patientName?: string
  storageLocation?: string
  chainOfCustody?: Array<{
    timestamp: string
    action: string
    performedBy: string
  }>
}

interface UseSpecimensParams {
  status?: string
  specimenType?: string
  search?: string
}

export const useSpecimens = (params: UseSpecimensParams = {}) => {
  const queryParams = new URLSearchParams()
  if (params.status) queryParams.append('status', params.status)
  if (params.specimenType) queryParams.append('specimenType', params.specimenType)
  if (params.search) queryParams.append('search', params.search)

  const queryString = queryParams.toString()
  const url = `${apiUrl}/specimens${queryString ? `?${queryString}` : ''}`

  return useQuery<Specimen[]>({
    queryKey: ['specimens', params],
    queryFn: async () => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch specimens: ${response.statusText}`)
      }
      const data = await response.json()
      return Array.isArray(data) ? data : data.specimens || []
    },
  })
}

export const useSpecimen = (id: string | undefined) => {
  return useQuery<Specimen>({
    queryKey: ['specimen', id],
    queryFn: async () => {
      if (!id) throw new Error('Specimen ID is required')
      const response = await fetch(`${apiUrl}/specimens/${id}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch specimen: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: !!id,
  })
}

