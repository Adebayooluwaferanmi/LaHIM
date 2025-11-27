import { useQuery } from '@tanstack/react-query'

const apiUrl = process.env.REACT_APP_HOSPITALRUN_API || 'http://localhost:3000'

export interface Instrument {
  id?: string
  _id?: string
  name?: string
  manufacturer?: string
  model?: string
  serialNumber?: string
  section?: string
  status?: 'active' | 'maintenance' | 'calibration' | 'inactive'
  lastCalibration?: string
  nextCalibration?: string
  location?: string
}

export const useInstruments = () => {
  return useQuery<Instrument[]>({
    queryKey: ['instruments'],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/instruments`)
      if (!response.ok) {
        throw new Error(`Failed to fetch instruments: ${response.statusText}`)
      }
      const data = await response.json()
      return Array.isArray(data) ? data : data.instruments || []
    },
  })
}

export const useInstrument = (id: string | undefined) => {
  return useQuery<Instrument>({
    queryKey: ['instrument', id],
    queryFn: async () => {
      if (!id) throw new Error('Instrument ID is required')
      const response = await fetch(`${apiUrl}/instruments/${id}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch instrument: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: !!id,
  })
}

