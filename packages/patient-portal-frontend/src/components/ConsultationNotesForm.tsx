import { useState } from 'react'
import { Panel, Button, Alert, TextInput } from '@lahim/components'

interface ConsultationNotesFormProps {
  consultationId: string
  onComplete: (notes: string) => void
  isSubmitting: boolean
}

export default function ConsultationNotesForm({
  consultationId,
  onComplete,
  isSubmitting,
}: ConsultationNotesFormProps) {
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (window.confirm('Are you sure you want to complete this consultation?')) {
      onComplete(notes)
    }
  }

  return (
    <Panel title="Complete Consultation" style={{ marginTop: '20px' }}>
      <form onSubmit={handleSubmit}>
        <TextInput
          as="textarea"
          rows={6}
          label="Consultation Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter consultation notes, findings, recommendations..."
          disabled={isSubmitting}
        />
        <div style={{ marginTop: '15px' }}>
          <Button type="submit" color="success" disabled={isSubmitting}>
            {isSubmitting ? 'Completing...' : 'Complete Consultation'}
          </Button>
        </div>
      </form>
    </Panel>
  )
}


