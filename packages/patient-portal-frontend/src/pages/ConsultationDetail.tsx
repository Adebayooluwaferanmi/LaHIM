import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { consultationsApi } from '../api/consultations'
import { Panel, Spinner, Alert } from '@lahim/components'
import { Row, Col } from 'react-bootstrap'
import MessageThread from '../components/MessageThread'
import DocumentList from '../components/DocumentList'
import { format } from 'date-fns'

export default function ConsultationDetail() {
  const { id } = useParams<{ id: string }>()

  const { data: consultation, isLoading, error } = useQuery({
    queryKey: ['consultation', id],
    queryFn: () => consultationsApi.get(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return <Spinner color="primary" />
  }

  if (error || !consultation) {
    return <Alert color="danger" message="Failed to load consultation" />
  }

  return (
    <div>
      <h1>{consultation.title || 'Consultation'}</h1>

      <Row>
        <Col md={8}>
          <Panel title="Consultation Details">
            <p>
              <strong>Status:</strong> {consultation.status}
            </p>
            {consultation.referral?.reason && (
              <p>
                <strong>Reason:</strong> {consultation.referral.reason}
              </p>
            )}
            {consultation.consultant && (
              <p>
                <strong>Consultant:</strong> {consultation.consultant.specialty}
                {consultation.consultant.organization && ` - ${consultation.consultant.organization}`}
              </p>
            )}
            {consultation.scheduledAt && (
              <p>
                <strong>Scheduled:</strong> {format(new Date(consultation.scheduledAt), 'MMM dd, yyyy HH:mm')}
              </p>
            )}
            {consultation.completedAt && (
              <p>
                <strong>Completed:</strong> {format(new Date(consultation.completedAt), 'MMM dd, yyyy')}
              </p>
            )}
            {consultation.notes && (
              <div>
                <strong>Notes:</strong>
                <p style={{ whiteSpace: 'pre-wrap' }}>{consultation.notes}</p>
              </div>
            )}
          </Panel>

          <MessageThread consultationId={id!} />
        </Col>

        <Col md={4}>
          <DocumentList consultationId={id!} />
        </Col>
      </Row>
    </div>
  )
}


