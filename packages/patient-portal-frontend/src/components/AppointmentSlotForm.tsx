import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { consultationsApi } from '../api/consultations'
import { Panel, Button, Alert } from '@lahim/components'
import { TextInput } from '@lahim/components'

interface AppointmentSlotFormProps {
  consultationId: string
}

export default function AppointmentSlotForm({ consultationId }: AppointmentSlotFormProps) {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const queryClient = useQueryClient()

  const proposeMutation = useMutation({
    mutationFn: (data: { start: string; end: string }) => consultationsApi.proposeSlot(consultationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation', consultationId] })
      setStart('')
      setEnd('')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (start && end) {
      proposeMutation.mutate({ start, end })
    }
  }

  return (
    <Panel title="Propose Appointment Slot" style={{ marginTop: '20px' }}>
      {proposeMutation.isError && (
        <Alert
          color="danger"
          message={(proposeMutation.error as any)?.error || 'Failed to propose slot'}
        />
      )}
      {proposeMutation.isSuccess && <Alert color="success" message="Slot proposed successfully" />}

      <form onSubmit={handleSubmit}>
        <TextInput
          label="Start Date & Time"
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          required
          disabled={proposeMutation.isPending}
        />
        <TextInput
          label="End Date & Time"
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          required
          disabled={proposeMutation.isPending}
        />
        <div style={{ marginTop: '15px' }}>
          <Button type="submit" color="primary" disabled={proposeMutation.isPending || !start || !end}>
            {proposeMutation.isPending ? 'Proposing...' : 'Propose Slot'}
          </Button>
        </div>
      </form>
    </Panel>
  )
}


