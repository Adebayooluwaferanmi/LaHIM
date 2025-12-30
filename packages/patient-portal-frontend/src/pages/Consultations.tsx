import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { patientsApi } from '../api/patients'
import { Panel, Spinner, Alert } from '@lahim/components'
import { Table } from 'react-bootstrap'
import { format } from 'date-fns'

export default function Consultations() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['consultations'],
    queryFn: () => patientsApi.getConsultations(),
  })

  if (isLoading) {
    return <Spinner color="primary" />
  }

  if (error) {
    return <Alert color="danger" message="Failed to load consultations" />
  }

  const consultations = data?.items || []

  return (
    <div>
      <h1>My Consultations</h1>
      <Panel title="Consultations">
        {consultations.length === 0 ? (
          <Alert color="info" message="No consultations found" />
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Specialty</th>
                <th>Created</th>
                <th>Scheduled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((consultation) => (
                <tr key={consultation.id}>
                  <td>
                    <Link to={`/consultations/${consultation.id}`}>
                      {consultation.title || 'Consultation'}
                    </Link>
                  </td>
                  <td>{consultation.status}</td>
                  <td>{consultation.consultant?.specialty || consultation.referral?.requestedSpecialty || '-'}</td>
                  <td>{format(new Date(consultation.createdAt), 'MMM dd, yyyy')}</td>
                  <td>
                    {consultation.scheduledAt
                      ? format(new Date(consultation.scheduledAt), 'MMM dd, yyyy')
                      : '-'}
                  </td>
                  <td>
                    <Link to={`/consultations/${consultation.id}`} className="btn btn-sm btn-primary">
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


