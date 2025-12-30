import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { consultationsApi } from '../api/consultations'
import { Panel, Spinner, Alert } from '@lahim/components'
import { Table } from 'react-bootstrap'
import { format } from 'date-fns'

export default function ConsultantDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['consultations'],
    queryFn: () => consultationsApi.list(),
  })

  if (isLoading) {
    return <Spinner color="primary" />
  }

  if (error) {
    return <Alert color="danger" message="Failed to load consultations" />
  }

  const consultations = data?.items || []

  const pendingConsultations = consultations.filter((c) => c.status === 'pending')
  const activeConsultations = consultations.filter((c) => ['accepted', 'scheduled'].includes(c.status))
  const completedConsultations = consultations.filter((c) => c.status === 'completed')

  return (
    <div>
      <h1>Consultant Dashboard</h1>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <Panel title="Pending" style={{ flex: 1 }}>
          <h3>{pendingConsultations.length}</h3>
        </Panel>
        <Panel title="Active" style={{ flex: 1 }}>
          <h3>{activeConsultations.length}</h3>
        </Panel>
        <Panel title="Completed" style={{ flex: 1 }}>
          <h3>{completedConsultations.length}</h3>
        </Panel>
      </div>

      <Panel title="My Consultations">
        {consultations.length === 0 ? (
          <Alert color="info" message="No consultations assigned" />
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Title</th>
                <th>Status</th>
                <th>Created</th>
                <th>Scheduled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((consultation) => (
                <tr key={consultation.id}>
                  <td>
                    {consultation.patientProfile?.firstName} {consultation.patientProfile?.lastName}
                  </td>
                  <td>
                    <Link to={`/consultant/consultations/${consultation.id}`}>
                      {consultation.title || 'Consultation'}
                    </Link>
                  </td>
                  <td>{consultation.status}</td>
                  <td>{format(new Date(consultation.createdAt), 'MMM dd, yyyy')}</td>
                  <td>
                    {consultation.scheduledAt
                      ? format(new Date(consultation.scheduledAt), 'MMM dd, yyyy')
                      : '-'}
                  </td>
                  <td>
                    <Link
                      to={`/consultant/consultations/${consultation.id}`}
                      className="btn btn-sm btn-primary"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Panel>
    </div>
  )
}


