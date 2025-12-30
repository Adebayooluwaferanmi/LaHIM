import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button, Panel, Alert, TextInput } from '@lahim/components'
import { Container, Row, Col } from 'react-bootstrap'

export default function ActivateInvite() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { activateInvite } = useAuth()

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    specialty: '',
    organization: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!token) {
    return (
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Panel title="Invalid Invite">
              <Alert color="danger" message="No invite token provided in the URL." />
            </Panel>
          </Col>
        </Row>
      </Container>
    )
  }

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
      await activateInvite({
        inviteToken: token!,
        password: formData.password,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        specialty: formData.specialty || undefined,
        organization: formData.organization || undefined,
      })
    } catch (err: any) {
      setError(err.error || 'Activation failed. The invite may be invalid or expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Panel title="Activate Consultant Account">
            {error && <Alert color="danger" message={error} />}
            <form onSubmit={handleSubmit}>
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
                label="Specialty"
                value={formData.specialty}
                onChange={(e) => handleChange('specialty', e.target.value)}
                disabled={loading}
              />
              <TextInput
                label="Organization"
                value={formData.organization}
                onChange={(e) => handleChange('organization', e.target.value)}
                disabled={loading}
              />
              <div style={{ marginTop: '20px' }}>
                <Button type="submit" color="primary" disabled={loading} block>
                  {loading ? 'Activating...' : 'Activate Account'}
                </Button>
              </div>
            </form>
          </Panel>
        </Col>
      </Row>
    </Container>
  )
}


