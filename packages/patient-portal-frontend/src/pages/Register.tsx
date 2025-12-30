import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button, Panel, Alert, TextInput } from '@lahim/components'
import { Container, Row, Col } from 'react-bootstrap'

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { registerPatient } = useAuth()

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

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
      await registerPatient({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth || undefined,
        phone: formData.phone || undefined,
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Panel title="Registration Successful">
              <Alert color="success" message="Your account has been created. Redirecting..." />
            </Panel>
          </Col>
        </Row>
      </Container>
    )
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Panel title="Register as Patient">
            {error && <Alert color="danger" message={error} />}
            <form onSubmit={handleSubmit}>
              <TextInput
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                disabled={loading}
              />
              <TextInput
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                disabled={loading}
              />
              <TextInput
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
                disabled={loading}
              />
              <TextInput
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                disabled={loading}
              />
              <TextInput
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                disabled={loading}
              />
              <TextInput
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                disabled={loading}
              />
              <TextInput
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={loading}
              />
              <div style={{ marginTop: '20px' }}>
                <Button type="submit" color="primary" disabled={loading} block>
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </div>
            </form>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <Link to="/login">Already have an account? Login</Link>
            </div>
          </Panel>
        </Col>
      </Row>
    </Container>
  )
}


