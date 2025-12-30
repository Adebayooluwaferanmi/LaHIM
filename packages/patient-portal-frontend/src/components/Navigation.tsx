import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Navbar, Nav } from 'react-bootstrap'
import { Button } from '@lahim/components'

export default function Navigation() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
  }

  if (!user) {
    return null
  }

  const isPatient = user.role === 'PATIENT'
  const isConsultant = user.role === 'EXTERNAL_CONSULTANT'

  return (
    <Navbar bg="light" expand="lg" style={{ marginBottom: '20px' }}>
      <Navbar.Brand as={Link} to="/">
        LaHIM Patient Portal
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          {isPatient && (
            <>
              <Nav.Link as={Link} to="/" active={location.pathname === '/'}>
                Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/profile" active={location.pathname === '/profile'}>
                Profile
              </Nav.Link>
              <Nav.Link as={Link} to="/consultations" active={location.pathname.startsWith('/consultations')}>
                My Consultations
              </Nav.Link>
            </>
          )}
          {isConsultant && (
            <>
              <Nav.Link
                as={Link}
                to="/consultant/dashboard"
                active={location.pathname === '/consultant/dashboard'}
              >
                Dashboard
              </Nav.Link>
            </>
          )}
        </Nav>
        <Nav className="ml-auto">
          <Nav.Item style={{ marginRight: '10px', display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px' }}>{user.email}</span>
          </Nav.Item>
          <Button color="secondary" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}


