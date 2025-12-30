import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, User } from '../api/auth'
import { apiClient } from '../api/client'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  registerPatient: (data: any) => Promise<void>
  activateInvite: (data: any) => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check for stored tokens and restore session
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    
    if (accessToken && refreshToken) {
      apiClient.setTokens(accessToken, refreshToken)
      // Try to get user profile to verify token
      // For now, we'll just set loading to false
      // In a real app, you might want to call a /me endpoint
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    apiClient.setTokens(response.tokens.accessToken, response.tokens.refreshToken)
    setUser(response.user)
    navigate(user?.role === 'EXTERNAL_CONSULTANT' ? '/consultant/dashboard' : '/')
  }

  const logout = () => {
    apiClient.setTokens(null, null)
    setUser(null)
    navigate('/login')
  }

  const registerPatient = async (data: any) => {
    const response = await authApi.registerPatient(data)
    apiClient.setTokens(response.tokens.accessToken, response.tokens.refreshToken)
    setUser(response.user)
    navigate('/')
  }

  const activateInvite = async (data: any) => {
    const response = await authApi.activateInvite(data)
    apiClient.setTokens(response.tokens.accessToken, response.tokens.refreshToken)
    setUser(response.user)
    navigate('/consultant/dashboard')
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    registerPatient,
    activateInvite,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


