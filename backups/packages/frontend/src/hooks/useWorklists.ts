import { useQuery } from '@tanstack/react-query'

const apiUrl = process.env.REACT_APP_HOSPITALRUN_API || 'http://localhost:3000'

export interface Worklist {
  id?: string
  _id?: string
  worklistNumber?: string
  section?: string
  generatedDate?: string
  generatedBy?: string
  status?: 'active' | 'completed' | 'cancelled'
  items?: Array<{
    id?: string
    testCode?: string
    testName?: string
    specimenId?: string
    accessionNumber?: string
    patientName?: string
    status?: 'pending' | 'in-progress' | 'completed'
    priority?: string
  }>
}

interface UseWorklistsParams {
  section?: string
  status?: string
}

export const useWorklists = (params: UseWorklistsParams = {}) => {
  const queryParams = new URLSearchParams()
  if (params.section) queryParams.append('section', params.section)
  if (params.status) queryParams.append('status', params.status)

  const queryString = queryParams.toString()
  const url = `${apiUrl}/worklists${queryString ? `?${queryString}` : ''}`

  return useQuery<Worklist[]>({
    queryKey: ['worklists', params],
    queryFn: async () => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch worklists: ${response.statusText}`)
      }
      const data = await response.json()
      return Array.isArray(data) ? data : data.worklists || []
    },
  })
}

export const useWorklist = (id: string | undefined) => {
  return useQuery<Worklist>({
    queryKey: ['worklist', id],
    queryFn: async () => {
      if (!id) throw new Error('Worklist ID is required')
      const response = await fetch(`${apiUrl}/worklists/${id}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch worklist: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: !!id,
  })
}

