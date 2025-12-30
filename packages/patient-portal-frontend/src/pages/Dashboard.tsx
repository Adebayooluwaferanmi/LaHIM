import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { patientsApi } from '../api/patients'
import { Panel, Spinner, Alert } from '@lahim/components'
import { Row, Col, Table } from 'react-bootstrap'
import { format } from 'date-fns'

export default function Dashboard() {
  const { user } = useAuth()

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => patientsApi.getAppointments(),
  })

  const { data: consultations, isLoading: consultationsLoading } = useQuery({
    queryKey: ['consultations'],
    queryFn: () => patientsApi.getConsultations(),
  })

  const upcomingAppointments = appointments?.items
    ?.filter((apt) => new Date(apt.start) > new Date())
    .slice(0, 5) || []

  const recentConsultations = consultations?.items?.slice(0, 5) || []

  return (
    <div>
      <h1>Welcome, {user?.patientProfile?.firstName || user?.email}</h1>

      <Row>
        <Col md={6}>
          <Panel title="Upcoming Appointments">
            {appointmentsLoading ? (
              <Spinner color="primary" />
            ) : upcomingAppointments.length === 0 ? (
              <Alert color="info" message="No upcoming appointments" />
            ) : (
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Consultation</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments.map((apt) => (
                    <tr key={apt.id}>
                      <td>{format(new Date(apt.start), 'MMM dd, yyyy HH:mm')}</td>
                      <td>
                        {apt.consultationCase?.title || 'Consultation'}
                        {apt.consultationCase?.consultant?.specialty && (
                          <div style={{ fontSize: '0.85em', color: '#666' }}>
                            {apt.consultationCase.consultant.specialty}
                          </div>
                        )}
                      </td>
                      <td>{apt.status}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            <Link to="/consultations">
              <button className="btn btn-link">View All Consultations</button>
            </Link>
          </Panel>
        </Col>

        <Col md={6}>
          <Panel title="Recent Consultations">
            {consultationsLoading ? (
              <Spinner color="primary" />
            ) : recentConsultations.length === 0 ? (
              <Alert color="info" message="No consultations yet" />
            ) : (
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentConsultations.map((consultation) => (
                    <tr key={consultation.id}>
                      <td>
                        <Link to={`/consultations/${consultation.id}`}>
                          {consultation.title || 'Consultation'}
                        </Link>
                      </td>
                      <td>{consultation.status}</td>
                      <td>{format(new Date(consultation.createdAt), 'MMM dd, yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            <Link to="/consultations">
              <button className="btn btn-link">View All Consultations</button>
            </Link>
          </Panel>
        </Col>
      </Row>
    </div>
  )
}


