import { apiClient } from './client'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterPatientRequest {
  email: string
  password: string
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  phone?: string
  corePatientId?: string
}

export interface ActivateInviteRequest {
  inviteToken: string
  password: string
  firstName?: string
  lastName?: string
  specialty?: string
  organization?: string
}

export interface User {
  id: string
  email: string
  role: 'PATIENT' | 'EXTERNAL_CONSULTANT' | 'INTERNAL'
  patientProfile?: any
  consultantProfile?: any
}

export interface AuthResponse {
  user: User
  tokens: {
    accessToken: string
    refreshToken: string
  }
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiClient.fetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  registerPatient: async (data: RegisterPatientRequest): Promise<AuthResponse> => {
    return apiClient.fetch<AuthResponse>('/auth/register-patient', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  activateInvite: async (data: ActivateInviteRequest): Promise<AuthResponse> => {
    return apiClient.fetch<AuthResponse>('/auth/activate-invite', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    return apiClient.fetch<{ message: string }>('/auth/request-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  verifyResetToken: async (resetToken: string): Promise<{ valid: boolean; email?: string }> => {
    return apiClient.fetch<{ valid: boolean; email?: string }>('/auth/verify-reset-token', {
      method: 'POST',
      body: JSON.stringify({ resetToken }),
    })
  },

  resetPassword: async (resetToken: string, newPassword: string): Promise<{ message: string }> => {
    return apiClient.fetch<{ message: string }>('/auth/reset', {
      method: 'POST',
      body: JSON.stringify({ resetToken, newPassword }),
    })
  },
}


