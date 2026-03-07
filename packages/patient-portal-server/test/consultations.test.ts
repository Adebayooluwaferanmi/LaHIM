import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMockPrisma, buildTestApp } from './helpers'
import consultationsService from '../src/services/consultations'

describe('consultations service', () => {
  let mockPrisma: ReturnType<typeof createMockPrisma>

  beforeEach(() => {
    mockPrisma = createMockPrisma()
    vi.clearAllMocks()
  })

  describe('GET /consultations', () => {
    it('returns patient consultations', async () => {
      const app = await buildTestApp(consultationsService, mockPrisma, {
        mockUser: { sub: 'patient-user-1', role: 'PATIENT' },
      })

      mockPrisma.patientProfile.findFirst.mockResolvedValue({ id: 'profile-1' })
      mockPrisma.consultationCase.findMany.mockResolvedValue([
        {
          id: 'case-1',
          status: 'pending',
          title: 'Test case',
          notes: null,
          scheduledAt: null,
          completedAt: null,
          referral: null,
          patientProfile: { id: 'profile-1' },
          consultant: null,
          slots: [],
        },
      ])

      const response = await app.inject({
        method: 'GET',
        url: '/consultations',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.items).toHaveLength(1)
      expect(body.items[0].id).toBe('case-1')

      await app.close()
    })

    it('returns empty list for patient without profile', async () => {
      const app = await buildTestApp(consultationsService, mockPrisma, {
        mockUser: { sub: 'patient-user-1', role: 'PATIENT' },
      })

      mockPrisma.patientProfile.findFirst.mockResolvedValue(null)

      const response = await app.inject({
        method: 'GET',
        url: '/consultations',
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.body)).toEqual({ items: [] })

      await app.close()
    })
  })

  describe('GET /consultations/:id', () => {
    it('returns 404 for non-existent consultation', async () => {
      const app = await buildTestApp(consultationsService, mockPrisma, {
        mockUser: { sub: 'patient-user-1', role: 'PATIENT' },
      })

      mockPrisma.consultationCase.findUnique.mockResolvedValue(null)

      const response = await app.inject({
        method: 'GET',
        url: '/consultations/550e8400-e29b-41d4-a716-446655440000',
      })

      expect(response.statusCode).toBe(404)

      await app.close()
    })

    it('returns 403 when patient lacks access', async () => {
      const app = await buildTestApp(consultationsService, mockPrisma, {
        mockUser: { sub: 'patient-user-1', role: 'PATIENT' },
      })

      mockPrisma.consultationCase.findUnique.mockResolvedValue({
        id: 'case-1',
        patientProfileId: 'other-profile',
        consultantId: null,
      })
      mockPrisma.patientProfile.findFirst.mockResolvedValue(null)

      const response = await app.inject({
        method: 'GET',
        url: '/consultations/550e8400-e29b-41d4-a716-446655440000',
      })

      expect(response.statusCode).toBe(403)

      await app.close()
    })
  })

  describe('POST /consultations/:id/slots/:slotId/accept', () => {
    it('accepts a proposed slot and declines others', async () => {
      const app = await buildTestApp(consultationsService, mockPrisma, {
        mockUser: { sub: 'patient-user-1', role: 'PATIENT' },
      })

      mockPrisma.consultationCase.findUnique.mockResolvedValue({
        id: 'case-1',
        patientProfileId: 'profile-1',
      })
      mockPrisma.patientProfile.findFirst.mockResolvedValue({ id: 'profile-1', userId: 'patient-user-1' })
      mockPrisma.appointmentSlot.findFirst.mockResolvedValue({
        id: 'slot-1',
        caseId: 'case-1',
        status: 'proposed',
        start: new Date('2026-04-01T10:00:00Z'),
      })
      mockPrisma.$transaction.mockResolvedValue([{}, {}, {}])
      mockPrisma.appointmentSlot.findUnique.mockResolvedValue({
        id: 'slot-1',
        status: 'accepted',
      })

      const caseId = '550e8400-e29b-41d4-a716-446655440000'
      const slotId = '660e8400-e29b-41d4-a716-446655440000'

      mockPrisma.consultationCase.findUnique.mockResolvedValue({
        id: caseId,
        patientProfileId: 'profile-1',
      })
      mockPrisma.appointmentSlot.findFirst.mockResolvedValue({
        id: slotId,
        caseId,
        status: 'proposed',
        start: new Date('2026-04-01T10:00:00Z'),
      })

      const response = await app.inject({
        method: 'POST',
        url: `/consultations/${caseId}/slots/${slotId}/accept`,
      })

      expect(response.statusCode).toBe(200)
      expect(mockPrisma.$transaction).toHaveBeenCalled()

      await app.close()
    })

    it('rejects non-patient users', async () => {
      const app = await buildTestApp(consultationsService, mockPrisma, {
        mockUser: { sub: 'consultant-user-1', role: 'EXTERNAL_CONSULTANT' },
      })

      const response = await app.inject({
        method: 'POST',
        url: '/consultations/550e8400-e29b-41d4-a716-446655440000/slots/660e8400-e29b-41d4-a716-446655440000/accept',
      })

      expect(response.statusCode).toBe(403)

      await app.close()
    })
  })

  describe('POST /consultations/:id/slots/:slotId/decline', () => {
    it('declines a proposed slot', async () => {
      const app = await buildTestApp(consultationsService, mockPrisma, {
        mockUser: { sub: 'patient-user-1', role: 'PATIENT' },
      })

      const caseId = '550e8400-e29b-41d4-a716-446655440000'
      const slotId = '660e8400-e29b-41d4-a716-446655440000'

      mockPrisma.consultationCase.findUnique.mockResolvedValue({
        id: caseId,
        patientProfileId: 'profile-1',
      })
      mockPrisma.patientProfile.findFirst.mockResolvedValue({ id: 'profile-1', userId: 'patient-user-1' })
      mockPrisma.appointmentSlot.findFirst.mockResolvedValue({
        id: slotId,
        caseId,
        status: 'proposed',
      })
      mockPrisma.appointmentSlot.update.mockResolvedValue({
        id: slotId,
        status: 'declined',
      })

      const response = await app.inject({
        method: 'POST',
        url: `/consultations/${caseId}/slots/${slotId}/decline`,
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.body).status).toBe('declined')

      await app.close()
    })
  })

  describe('POST /consultations/:id/complete', () => {
    it('rejects non-consultant users', async () => {
      const app = await buildTestApp(consultationsService, mockPrisma, {
        mockUser: { sub: 'patient-user-1', role: 'PATIENT' },
      })

      const response = await app.inject({
        method: 'POST',
        url: '/consultations/550e8400-e29b-41d4-a716-446655440000/complete',
        payload: { notes: 'done' },
      })

      expect(response.statusCode).toBe(403)

      await app.close()
    })
  })
})
