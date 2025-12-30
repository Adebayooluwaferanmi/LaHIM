import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Public pages
import Login from './pages/Login'
import Register from './pages/Register'
import ActivateInvite from './pages/ActivateInvite'
import RequestPasswordReset from './pages/RequestPasswordReset'
import ResetPassword from './pages/ResetPassword'

// Patient pages
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Consultations from './pages/Consultations'
import ConsultationDetail from './pages/ConsultationDetail'

// Consultant pages
import ConsultantDashboard from './pages/ConsultantDashboard'
import ConsultantConsultationDetail from './pages/ConsultantConsultationDetail'

function App() {
  const { isAuthenticated, user } = useAuth()

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
      <Route path="/activate-invite" element={<ActivateInvite />} />
      <Route path="/request-reset" element={<RequestPasswordReset />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                {/* Patient routes */}
                <Route
                  path="/"
                  element={
                    user?.role === 'PATIENT' ? (
                      <Dashboard />
                    ) : user?.role === 'EXTERNAL_CONSULTANT' ? (
                      <Navigate to="/consultant/dashboard" />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/profile"
                  element={user?.role === 'PATIENT' ? <Profile /> : <Navigate to="/login" />}
                />
                <Route
                  path="/consultations"
                  element={user?.role === 'PATIENT' ? <Consultations /> : <Navigate to="/login" />}
                />
                <Route
                  path="/consultations/:id"
                  element={user?.role === 'PATIENT' ? <ConsultationDetail /> : <Navigate to="/login" />}
                />

                {/* Consultant routes */}
                <Route
                  path="/consultant/dashboard"
                  element={
                    user?.role === 'EXTERNAL_CONSULTANT' ? (
                      <ConsultantDashboard />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/consultant/consultations/:id"
                  element={
                    user?.role === 'EXTERNAL_CONSULTANT' ? (
                      <ConsultantConsultationDetail />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App


