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

export interface ProposeSlotRequest {
  start: string
  end: string
}

export interface CompleteConsultationRequest {
  notes?: string
}

export const consultationsApi = {
  list: async (): Promise<{ items: ConsultationDetail[] }> => {
    return apiClient.fetch<{ items: ConsultationDetail[] }>('/consultations')
  },

  get: async (id: string): Promise<ConsultationDetail> => {
    return apiClient.fetch<ConsultationDetail>(`/consultations/${id}`)
  },

  proposeSlot: async (id: string, data: ProposeSlotRequest): Promise<any> => {
    return apiClient.fetch(`/consultations/${id}/slots`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  complete: async (id: string, data: CompleteConsultationRequest): Promise<ConsultationDetail> => {
    return apiClient.fetch<ConsultationDetail>(`/consultations/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}


