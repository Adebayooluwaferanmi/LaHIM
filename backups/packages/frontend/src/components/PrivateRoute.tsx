import React from 'react'
import { Navigate } from 'react-router-dom'

interface PrivateRouteProps {
  children: React.ReactElement
  isAuthenticated?: boolean
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, isAuthenticated = true }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute

