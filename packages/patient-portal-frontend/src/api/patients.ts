import { apiClient } from './client'

export interface PatientProfile {
  id: string
  userId: string
  corePatientId?: string
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  phone?: string
  communicationPreferences?: string
}

export interface UpdatePatientProfileRequest {
  firstName?: string
  lastName?: string
  phone?: string
  communicationPreferences?: string
}

export interface Appointment {
  id: string
  start: string
  end: string
  status: string
  consultationCase?: {
    id: string
    title?: string
    consultant?: {
      specialty?: string
      organization?: string
    }
  }
}

export interface Consultation {
  id: string
  title?: string
  status: string
  createdAt: string
  scheduledAt?: string
  completedAt?: string
  consultant?: {
    specialty?: string
    organization?: string
  }
  referral?: {
    reason?: string
    requestedSpecialty?: string
  }
}

export const patientsApi = {
  getProfile: async (): Promise<PatientProfile> => {
    return apiClient.fetch<PatientProfile>('/patients/me')
  },

  updateProfile: async (data: UpdatePatientProfileRequest): Promise<PatientProfile> => {
    return apiClient.fetch<PatientProfile>('/patients/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  getAppointments: async (): Promise<{ items: Appointment[] }> => {
    return apiClient.fetch<{ items: Appointment[] }>('/patients/me/appointments')
  },

  getConsultations: async (): Promise<{ items: Consultation[] }> => {
    return apiClient.fetch<{ items: Consultation[] }>('/patients/me/consultations')
  },

  createExternalAccessRequest: async (body: {
    recipientEmail: string
    type: 'VIEW_RECORD' | 'UPDATE_LABS'
  }): Promise<{ id: string; status: string }> => {
    return apiClient.fetch<{ id: string; status: string }>('/patients/me/external-access-requests', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },
}


