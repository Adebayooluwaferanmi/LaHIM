import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Panel, Alert, TextInput } from '@lahim/components'
import { Container, Row, Col } from 'react-bootstrap'
import { authApi } from '../api/auth'

export default function RequestPasswordReset() {
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await authApi.requestPasswordReset(email)
      setSuccess(true)
    } catch (err: any) {
      setError(err.error || 'Failed to request password reset')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Panel title="Password Reset Requested">
              <Alert
                color="success"
                message="If an account exists with that email, a password reset link has been sent."
              />
              <Link to="/login">
                <Button color="primary" block>
                  Back to Login
                </Button>
              </Link>
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
          <Panel title="Request Password Reset">
            {error && <Alert color="danger" message={error} />}
            <form onSubmit={handleSubmit}>
              <TextInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <div style={{ marginTop: '20px' }}>
                <Button type="submit" color="primary" disabled={loading} block>
                  {loading ? 'Sending...' : 'Send Reset Link'}
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


