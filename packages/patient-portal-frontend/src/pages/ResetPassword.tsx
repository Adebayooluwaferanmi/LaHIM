import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Button, Panel, Alert, TextInput } from '@lahim/components'
import { Container, Row, Col } from 'react-bootstrap'
import { authApi } from '../api/auth'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  useEffect(() => {
    if (!token) {
      setError('No reset token provided')
      setTokenValid(false)
      return
    }
    // Verify token is valid
    authApi
      .verifyResetToken(token)
      .then((result) => {
        setTokenValid(result.valid)
        if (!result.valid) {
          setError('Invalid or expired reset token')
        }
      })
      .catch(() => {
        setTokenValid(false)
        setError('Invalid or expired reset token')
      })
  }, [token])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!token) {
      setError('No reset token provided')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      await authApi.resetPassword(token, formData.password)
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err: any) {
      setError(err.error || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (tokenValid === false) {
    return (
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Panel title="Invalid Reset Token">
              <Alert color="danger" message={error || 'This reset link is invalid or has expired.'} />
              <Link to="/request-reset">
                <Button color="primary" block>
                  Request New Reset Link
                </Button>
              </Link>
            </Panel>
          </Col>
        </Row>
      </Container>
    )
  }

  if (tokenValid === null) {
    return (
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Panel title="Reset Password">Verifying reset token...</Panel>
          </Col>
        </Row>
      </Container>
    )
  }

  if (success) {
    return (
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Panel title="Password Reset Successful">
              <Alert color="success" message="Your password has been reset. Redirecting to login..." />
            </Panel>
          </Col>
        </Row>
      </Container>
    )
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Panel title="Reset Password">
            {error && <Alert color="danger" message={error} />}
            <form onSubmit={handleSubmit}>
              <TextInput
                label="New Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                disabled={loading}
              />
              <TextInput
                label="Confirm New Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
                disabled={loading}
              />
              <div style={{ marginTop: '20px' }}>
                <Button type="submit" color="primary" disabled={loading} block>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </div>
            </form>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <Link to="/login">Back to Login</Link>
            </div>
          </Panel>
        </Col>
      </Row>
    </Container>
  )
}


