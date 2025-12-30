import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { consultationsApi } from '../api/consultations'
import { Panel, Spinner, Alert } from '@lahim/components'
import { Row, Col } from 'react-bootstrap'
import MessageThread from '../components/MessageThread'
import DocumentList from '../components/DocumentList'
import AppointmentSlotForm from '../components/AppointmentSlotForm'
import ConsultationNotesForm from '../components/ConsultationNotesForm'
import { format } from 'date-fns'

export default function ConsultantConsultationDetail() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data: consultation, isLoading, error } = useQuery({
    queryKey: ['consultation', id],
    queryFn: () => consultationsApi.get(id!),
    enabled: !!id,
  })

  const completeMutation = useMutation({
    mutationFn: (notes: string) => consultationsApi.complete(id!, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation', id] })
      queryClient.invalidateQueries({ queryKey: ['consultations'] })
    },
  })

  if (isLoading) {
    return <Spinner color="primary" />
  }

  if (error || !consultation) {
    return <Alert color="danger" message="Failed to load consultation" />
  }

  const canProposeSlots = consultation.status === 'pending' || consultation.status === 'accepted'
  const canComplete = consultation.status === 'scheduled' || consultation.status === 'accepted'

  return (
    <div>
      <h1>{consultation.title || 'Consultation'}</h1>

      <Row>
        <Col md={8}>
          <Panel title="Consultation Details">
            <p>
              <strong>Patient:</strong> {consultation.patientProfile?.firstName}{' '}
              {consultation.patientProfile?.lastName}
            </p>
            <p>
              <strong>Status:</strong> {consultation.status}
            </p>
            {consultation.referral?.reason && (
              <p>
                <strong>Reason:</strong> {consultation.referral.reason}
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

          {canProposeSlots && (
            <AppointmentSlotForm consultationId={id!} />
          )}

          {consultation.slots && consultation.slots.length > 0 && (
            <Panel title="Appointment Slots" style={{ marginTop: '20px' }}>
              <ul>
                {consultation.slots.map((slot) => (
                  <li key={slot.id}>
                    {format(new Date(slot.start), 'MMM dd, yyyy HH:mm')} -{' '}
                    {format(new Date(slot.end), 'HH:mm')} ({slot.status})
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {canComplete && (
            <ConsultationNotesForm
              consultationId={id!}
              onComplete={(notes) => completeMutation.mutate(notes)}
              isSubmitting={completeMutation.isPending}
            />
          )}

          <MessageThread consultationId={id!} />
        </Col>

        <Col md={4}>
          <DocumentList consultationId={id!} showUpload={true} />
        </Col>
      </Row>
    </div>
  )
}


