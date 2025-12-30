import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button, Panel, Alert, TextInput } from '@lahim/components'
import { Container, Row, Col } from 'react-bootstrap'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.error || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Panel title="Login to Patient Portal">
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
              <TextInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <div style={{ marginTop: '20px' }}>
                <Button type="submit" color="primary" disabled={loading} block>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            </form>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <Link to="/request-reset">Forgot password?</Link>
              <br />
              <Link to="/register">Don't have an account? Register</Link>
            </div>
          </Panel>
        </Col>
      </Row>
    </Container>
  )
}


