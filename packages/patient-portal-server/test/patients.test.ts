import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMockPrisma, buildTestApp } from './helpers'
import patientsService from '../src/services/patients'

describe('patients service', () => {
  let mockPrisma: ReturnType<typeof createMockPrisma>

  beforeEach(() => {
    mockPrisma = createMockPrisma()
    vi.clearAllMocks()
  })

  describe('GET /patients/me', () => {
    it('returns current patient profile', async () => {
      const app = await buildTestApp(patientsService, mockPrisma, {
        mockUser: { sub: 'user-1', role: 'PATIENT' },
      })

      mockPrisma.portalUser.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'patient@test.com',
        role: 'PATIENT',
        patientProfile: {
          id: 'profile-1',
          firstName: 'Jane',
          lastName: 'Doe',
        },
      })

      const response = await app.inject({
        method: 'GET',
        url: '/patients/me',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.email).toBe('patient@test.com')
      expect(body.patientProfile.firstName).toBe('Jane')

      await app.close()
    })

    it('returns 404 when profile not found', async () => {
      const app = await buildTestApp(patientsService, mockPrisma, {
        mockUser: { sub: 'user-1', role: 'PATIENT' },
      })

      mockPrisma.portalUser.findUnique.mockResolvedValue(null)

      const response = await app.inject({
        method: 'GET',
        url: '/patients/me',
      })

      expect(response.statusCode).toBe(404)

      await app.close()
    })
  })

  describe('PATCH /patients/me', () => {
    it('updates patient profile fields', async () => {
      const app = await buildTestApp(patientsService, mockPrisma, {
        mockUser: { sub: 'user-1', role: 'PATIENT' },
      })

      mockPrisma.portalUser.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'patient@test.com',
        role: 'PATIENT',
        patientProfile: { id: 'profile-1' },
      })
      mockPrisma.patientProfile.update.mockResolvedValue({
        id: 'profile-1',
        firstName: 'Updated',
        lastName: 'Name',
        phone: '+1234567890',
      })

      const response = await app.inject({
        method: 'PATCH',
        url: '/patients/me',
        payload: {
          firstName: 'Updated',
          lastName: 'Name',
          phone: '+1234567890',
        },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.patientProfile.firstName).toBe('Updated')

      await app.close()
    })
  })

  describe('GET /patients/me/consultations', () => {
    it('returns patient consultations', async () => {
      const app = await buildTestApp(patientsService, mockPrisma, {
        mockUser: { sub: 'user-1', role: 'PATIENT' },
      })

      mockPrisma.portalUser.findUnique.mockResolvedValue({
        id: 'user-1',
        patientProfile: { id: 'profile-1' },
      })
      mockPrisma.consultationCase.findMany.mockResolvedValue([
        {
          id: 'case-1',
          status: 'pending',
          title: 'Referral',
          notes: null,
          scheduledAt: null,
          completedAt: null,
          referral: null,
          consultant: null,
          slots: [],
        },
      ])

      const response = await app.inject({
        method: 'GET',
        url: '/patients/me/consultations',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.items).toHaveLength(1)

      await app.close()
    })
  })

  describe('GET /patients/me/appointments', () => {
    it('returns patient appointment slots', async () => {
      const app = await buildTestApp(patientsService, mockPrisma, {
        mockUser: { sub: 'user-1', role: 'PATIENT' },
      })

      mockPrisma.portalUser.findUnique.mockResolvedValue({
        id: 'user-1',
        patientProfile: { id: 'profile-1' },
      })
      mockPrisma.appointmentSlot.findMany.mockResolvedValue([
        {
          id: 'slot-1',
          caseId: 'case-1',
          start: new Date(),
          end: new Date(),
          status: 'proposed',
          consultationCase: {
            id: 'case-1',
            status: 'pending',
            title: 'Test',
            consultantId: null,
          },
        },
      ])

      const response = await app.inject({
        method: 'GET',
        url: '/patients/me/appointments',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.items).toHaveLength(1)

      await app.close()
    })
  })
})
