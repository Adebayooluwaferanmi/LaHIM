import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messagingApi } from '../api/messaging'
import { Panel, Button, TextInput, Spinner, Alert } from '@lahim/components'
import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'

interface MessageThreadProps {
  consultationId: string
}

export default function MessageThread({ consultationId }: MessageThreadProps) {
  const { user } = useAuth()
  const [messageBody, setMessageBody] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['messages', consultationId],
    queryFn: () => messagingApi.getMessages(consultationId),
  })

  const sendMutation = useMutation({
    mutationFn: (body: string) => messagingApi.sendMessage(consultationId, { body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', consultationId] })
      setMessageBody('')
    },
  })

  const threads = data?.items || []
  const mainThread = threads[0] || null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (messageBody.trim()) {
      sendMutation.mutate(messageBody.trim())
    }
  }

  return (
    <Panel title="Messages" style={{ marginTop: '20px' }}>
      {isLoading ? (
        <Spinner color="primary" />
      ) : mainThread ? (
        <div>
          <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
            {(mainThread?.messages ?? []).map((message) => {
              const isOwnMessage = message.senderUserId === user?.id
              return (
                <div
                  key={message.id}
                  style={{
                    marginBottom: '15px',
                    padding: '10px',
                    backgroundColor: isOwnMessage ? '#e3f2fd' : '#f5f5f5',
                    borderRadius: '5px',
                    marginLeft: isOwnMessage ? '20%' : '0',
                    marginRight: isOwnMessage ? '0' : '20%',
                  }}
                >
                  <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '5px' }}>
                    {format(new Date(message.createdAt), 'MMM dd, yyyy HH:mm')}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{message.body}</div>
                </div>
              )
            })}
          </div>

          <form onSubmit={handleSubmit}>
            <TextInput
              as="textarea"
              rows={3}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="Type your message..."
              disabled={sendMutation.isPending}
            />
            <div style={{ marginTop: '10px' }}>
              <Button type="submit" color="primary" disabled={sendMutation.isPending || !messageBody.trim()}>
                {sendMutation.isPending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
            {sendMutation.isError && (
              <Alert
                color="danger"
                message={(sendMutation.error as any)?.error || 'Failed to send message'}
              />
            )}
          </form>
        </div>
      ) : (
        <div>
          <p>No messages yet. Start the conversation:</p>
          <form onSubmit={handleSubmit}>
            <TextInput
              as="textarea"
              rows={3}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="Type your message..."
              disabled={sendMutation.isPending}
            />
            <div style={{ marginTop: '10px' }}>
              <Button type="submit" color="primary" disabled={sendMutation.isPending || !messageBody.trim()}>
                {sendMutation.isPending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </Panel>
  )
}


