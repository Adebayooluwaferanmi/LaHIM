import { apiClient } from './client'

export interface Document {
  id: string
  caseId: string
  type: string
  title?: string
  filename?: string
  contentType?: string
  size?: number
  createdAt: string
}

export interface CreateDocumentRequest {
  type: string
  title?: string
  filename?: string
  storageKey?: string
  contentType?: string
  size?: number
}

export const documentsApi = {
  list: async (consultationId: string): Promise<{ items: Document[] }> => {
    return apiClient.fetch<{ items: Document[] }>(`/consultations/${consultationId}/documents`)
  },

  create: async (consultationId: string, data: CreateDocumentRequest): Promise<Document> => {
    return apiClient.fetch<Document>(`/consultations/${consultationId}/documents`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  upload: async (consultationId: string, file: File): Promise<Document> => {
    const formData = new FormData()
    formData.append('file', file)

    const { accessToken } = apiClient.getTokens()
    const headers: Record<string, string> = {}
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }

    const API_BASE = import.meta.env.VITE_PORTAL_API_URL || 'http://localhost:4001'
    const response = await fetch(`${API_BASE}/consultations/${consultationId}/documents/upload`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || response.statusText)
    }

    return response.json()
  },

  getDownloadUrl: (documentId: string): string => {
    const API_BASE = import.meta.env.VITE_PORTAL_API_URL || 'http://localhost:4001'
    return `${API_BASE}/documents/${documentId}/download`
  },
}


