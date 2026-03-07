import Fastify, { FastifyInstance } from 'fastify'

interface MockPrisma {
  portalUser: Record<string, ReturnType<typeof vi.fn>>
  patientProfile: Record<string, ReturnType<typeof vi.fn>>
  externalConsultant: Record<string, ReturnType<typeof vi.fn>>
  consultationCase: Record<string, ReturnType<typeof vi.fn>>
  consultationReferral: Record<string, ReturnType<typeof vi.fn>>
  appointmentSlot: Record<string, ReturnType<typeof vi.fn>>
  messageThread: Record<string, ReturnType<typeof vi.fn>>
  message: Record<string, ReturnType<typeof vi.fn>>
  consultationDocument: Record<string, ReturnType<typeof vi.fn>>
  $transaction: ReturnType<typeof vi.fn>
}

import { vi } from 'vitest'

export function createMockPrisma(): MockPrisma {
  const methods = ['findUnique', 'findFirst', 'findMany', 'create', 'update', 'updateMany', 'upsert', 'delete']
  const createModel = () => Object.fromEntries(methods.map((m) => [m, vi.fn()]))

  return {
    portalUser: createModel(),
    patientProfile: createModel(),
    externalConsultant: createModel(),
    consultationCase: createModel(),
    consultationReferral: createModel(),
    appointmentSlot: createModel(),
    messageThread: createModel(),
    message: createModel(),
    consultationDocument: createModel(),
    $transaction: vi.fn(),
  } as MockPrisma
}

export async function buildTestApp(
  servicePlugin: any,
  mockPrisma: MockPrisma,
  options: { withAuth?: boolean; mockUser?: { sub: string; role: string } } = {},
): Promise<FastifyInstance> {
  const app = Fastify({ logger: false })

  app.decorate('prisma', mockPrisma)

  app.decorate('emailService', {
    sendConsultantInvite: vi.fn().mockResolvedValue(undefined),
    sendPatientInvite: vi.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
    sendConsultationStatusUpdate: vi.fn().mockResolvedValue(undefined),
    sendNewMessageNotification: vi.fn().mockResolvedValue(undefined),
  })

  if (options.withAuth !== false) {
    const mockUser = options.mockUser || { sub: 'user-1', role: 'PATIENT' }
    app.decorate('authenticate', async (request: any) => {
      request.user = mockUser
    })
  }

  await app.register(servicePlugin)
  await app.ready()

  return app
}
