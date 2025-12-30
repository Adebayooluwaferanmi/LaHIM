const API_BASE = import.meta.env.VITE_PORTAL_API_URL || 'http://localhost:4001'

export interface ApiError {
  error: string
  message?: string
}

class ApiClient {
  private accessToken: string | null = null
  private refreshToken: string | null = null

  setTokens(accessToken: string | null, refreshToken: string | null) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken)
    } else {
      localStorage.removeItem('accessToken')
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
    } else {
      localStorage.removeItem('refreshToken')
    }
  }

  getTokens() {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('accessToken')
    }
    if (!this.refreshToken) {
      this.refreshToken = localStorage.getItem('refreshToken')
    }
    return { accessToken: this.accessToken, refreshToken: this.refreshToken }
  }

  async fetch<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const { accessToken } = this.getTokens()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    })

    if (!response.ok) {
      if (response.status === 401 && accessToken) {
        // Try to refresh token
        const { refreshToken } = this.getTokens()
        if (refreshToken) {
          try {
            const refreshResponse = await this.fetch<{ tokens: { accessToken: string; refreshToken: string } }>(
              '/auth/refresh',
              {
                method: 'POST',
                body: JSON.stringify({ refreshToken }),
              },
            )
            this.setTokens(refreshResponse.tokens.accessToken, refreshResponse.tokens.refreshToken)
            // Retry original request
            headers.Authorization = `Bearer ${refreshResponse.tokens.accessToken}`
            const retryResponse = await fetch(`${API_BASE}${path}`, {
              ...options,
              headers,
              credentials: 'include',
            })
            if (!retryResponse.ok) {
              const errorText = await retryResponse.text()
              throw new Error(errorText || retryResponse.statusText)
            }
            return retryResponse.json() as Promise<T>
          } catch (refreshError) {
            // Refresh failed, clear tokens
            this.setTokens(null, null)
            throw new Error('Session expired. Please login again.')
          }
        }
      }
      const errorText = await response.text()
      let error: ApiError
      try {
        error = JSON.parse(errorText)
      } catch {
        error = { error: errorText || response.statusText }
      }
      throw error
    }

    return response.json() as Promise<T>
  }
}

export const apiClient = new ApiClient()


