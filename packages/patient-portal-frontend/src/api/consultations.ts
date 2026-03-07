import { apiClient } from './client'

export interface ConsultationDetail {
  id: string
  title?: string
  status: string
  notes?: string
  scheduledAt?: string
  completedAt?: string
  createdAt: string
  patientProfile?: {
    firstName?: string
    lastName?: string
  }
  consultant?: {
    specialty?: string
    organization?: string
  }
  referral?: {
    reason?: string
    requestedSpecialty?: string
  }
  slots?: Array<{
    id: string
    start: string
    end: string
    status: string
  }>
}

export const consultationsApi = {
  list: async (): Promise<{ items: ConsultationDetail[] }> => {
    return apiClient.fetch<{ items: ConsultationDetail[] }>('/consultations')
  },

  get: async (id: string): Promise<ConsultationDetail> => {
    return apiClient.fetch<ConsultationDetail>(`/consultations/${id}`)
  },
}


