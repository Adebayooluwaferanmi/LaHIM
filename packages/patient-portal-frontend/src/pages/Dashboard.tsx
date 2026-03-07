import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { patientsApi } from '../api/patients'
import { Panel, Spinner, Alert, Button } from '@lahim/components'
import { Row, Col, Table, Form } from 'react-bootstrap'
import { format } from 'date-fns'

export default function Dashboard() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [recipientEmail, setRecipientEmail] = useState('')
  const [accessType, setAccessType] = useState<'VIEW_RECORD' | 'UPDATE_LABS'>('VIEW_RECORD')

  const createRequestMutation = useMutation({
    mutationFn: (body: { recipientEmail: string; type: 'VIEW_RECORD' | 'UPDATE_LABS' }) =>
      patientsApi.createExternalAccessRequest(body),
    onSuccess: () => {
      setRecipientEmail('')
      queryClient.invalidateQueries({ queryKey: [] })
    },
  })

  const handleShareSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipientEmail.trim()) return
    createRequestMutation.mutate({ recipientEmail: recipientEmail.trim(), type: accessType })
  }

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

      <Row className="mb-4">
        <Col md={12}>
          <Panel title="Share my record (one-time link)">
            <p className="text-muted small">
              Request a 24-hour one-time link for an external doctor to view your record, or for a lab to update your results. Your facility admin must approve the request; then the link is sent to the email below.
            </p>
            <Form onSubmit={handleShareSubmit}>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label>Recipient email</Form.Label>
                    <Form.Control
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="doctor@example.com"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label>Access type</Form.Label>
                    <Form.Select
                      value={accessType}
                      onChange={(e) => setAccessType(e.target.value as 'VIEW_RECORD' | 'UPDATE_LABS')}
                    >
                      <option value="VIEW_RECORD">View my record (doctor)</option>
                      <option value="UPDATE_LABS">Update lab results (lab)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  <Button
                    type="submit"
                    color="primary"
                    disabled={createRequestMutation.isPending}
                  >
                    {createRequestMutation.isPending ? 'Sending...' : 'Request link'}
                  </Button>
                </Col>
              </Row>
              {createRequestMutation.isSuccess && (
                <Alert color="success" className="mt-2">
                  Request sent. Your facility will approve it and the recipient will receive the link by email.
                </Alert>
              )}
              {createRequestMutation.isError && (
                <Alert color="danger" className="mt-2">
                  {(createRequestMutation.error as { error?: string }).error || 'Request failed'}
                </Alert>
              )}
            </Form>
          </Panel>
        </Col>
      </Row>

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


