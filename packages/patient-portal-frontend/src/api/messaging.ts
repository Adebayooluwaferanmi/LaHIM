import { apiClient } from './client'

export interface Message {
  id: string
  threadId: string
  senderUserId: string
  body: string
  createdAt: string
}

export interface MessageThread {
  id: string
  caseId: string
  subject?: string
  createdAt: string
  messages: Message[]
}

export interface SendMessageRequest {
  body: string
  threadId?: string
}

export const messagingApi = {
  getMessages: async (consultationId: string): Promise<{ items: MessageThread[] }> => {
    return apiClient.fetch<{ items: MessageThread[] }>(`/consultations/${consultationId}/messages`)
  },

  sendMessage: async (consultationId: string, data: SendMessageRequest): Promise<Message> => {
    return apiClient.fetch<Message>(`/consultations/${consultationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}


