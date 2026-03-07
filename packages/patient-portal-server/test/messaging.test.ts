import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMockPrisma, buildTestApp } from './helpers'
import messagingService from '../src/services/messaging'

describe('messaging service', () => {
  let mockPrisma: ReturnType<typeof createMockPrisma>

  beforeEach(() => {
    mockPrisma = createMockPrisma()
    vi.clearAllMocks()
  })

  describe('GET /consultations/:id/messages', () => {
    it('returns messages for a consultation', async () => {
      const app = await buildTestApp(messagingService, mockPrisma, {
        mockUser: { sub: 'patient-user-1', role: 'PATIENT' },
      })

      const caseId = '550e8400-e29b-41d4-a716-446655440000'

      mockPrisma.consultationCase.findUnique.mockResolvedValue({
        id: caseId,
        patientProfileId: 'profile-1',
      })
      mockPrisma.patientProfile.findFirst.mockResolvedValue({ id: 'profile-1', userId: 'patient-user-1' })
      mockPrisma.messageThread.findFirst.mockResolvedValue({
        id: 'thread-1',
        messages: [
          { id: 'msg-1', body: 'Hello', senderUserId: 'patient-user-1', createdAt: new Date() },
        ],
      })

      const response = await app.inject({
        method: 'GET',
        url: `/consultations/${caseId}/messages`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.threadId).toBe('thread-1')
      expect(body.items).toHaveLength(1)

      await app.close()
    })

    it('returns empty when no thread exists', async () => {
      const app = await buildTestApp(messagingService, mockPrisma, {
        mockUser: { sub: 'patient-user-1', role: 'PATIENT' },
      })

      const caseId = '550e8400-e29b-41d4-a716-446655440000'

      mockPrisma.consultationCase.findUnique.mockResolvedValue({
        id: caseId,
        patientProfileId: 'profile-1',
      })
      mockPrisma.patientProfile.findFirst.mockResolvedValue({ id: 'profile-1', userId: 'patient-user-1' })
      mockPrisma.messageThread.findFirst.mockResolvedValue(null)

      const response = await app.inject({
        method: 'GET',
        url: `/consultations/${caseId}/messages`,
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.body)).toEqual({ items: [] })

      await app.close()
    })
  })

  describe('POST /consultations/:id/messages', () => {
    it('creates a message and upserts thread', async () => {
      const app = await buildTestApp(messagingService, mockPrisma, {
        mockUser: { sub: 'patient-user-1', role: 'PATIENT' },
      })

      const caseId = '550e8400-e29b-41d4-a716-446655440000'

      mockPrisma.consultationCase.findUnique.mockResolvedValue({
        id: caseId,
        patientProfileId: 'profile-1',
      })
      mockPrisma.patientProfile.findFirst.mockResolvedValue({ id: 'profile-1', userId: 'patient-user-1' })
      mockPrisma.messageThread.upsert.mockResolvedValue({ id: 'thread-1' })
      mockPrisma.message.create.mockResolvedValue({
        id: 'msg-1',
        threadId: 'thread-1',
        senderUserId: 'patient-user-1',
        body: 'Test message',
        createdAt: new Date(),
      })

      const response = await app.inject({
        method: 'POST',
        url: `/consultations/${caseId}/messages`,
        payload: { body: 'Test message' },
      })

      expect(response.statusCode).toBe(201)
      expect(JSON.parse(response.body).body).toBe('Test message')
      expect(mockPrisma.messageThread.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { caseId },
        }),
      )

      await app.close()
    })

    it('rejects empty message body', async () => {
      const app = await buildTestApp(messagingService, mockPrisma, {
        mockUser: { sub: 'patient-user-1', role: 'PATIENT' },
      })

      const caseId = '550e8400-e29b-41d4-a716-446655440000'

      const response = await app.inject({
        method: 'POST',
        url: `/consultations/${caseId}/messages`,
        payload: { body: '' },
      })

      expect(response.statusCode).toBe(400)

      await app.close()
    })

    it('returns 404 for non-existent consultation', async () => {
      const app = await buildTestApp(messagingService, mockPrisma, {
        mockUser: { sub: 'patient-user-1', role: 'PATIENT' },
      })

      const caseId = '550e8400-e29b-41d4-a716-446655440000'

      mockPrisma.consultationCase.findUnique.mockResolvedValue(null)

      const response = await app.inject({
        method: 'POST',
        url: `/consultations/${caseId}/messages`,
        payload: { body: 'Test message' },
      })

      expect(response.statusCode).toBe(404)

      await app.close()
    })
  })
})
