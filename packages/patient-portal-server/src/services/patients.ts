import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'

const updateProfileSchema = {
  body: {
    type: 'object',
    properties: {
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      phone: { type: 'string' },
      communicationPreferences: { type: 'string' },
    },
  },
}

const patientsService: FastifyPluginAsync = async (fastify: any) => {
  fastify.get(
    '/patients/me',
    {
      preHandler: fastify.authenticate.bind(fastify),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = request.user as { sub: string }

      const user = await fastify.prisma.portalUser.findUnique({
        where: { id: currentUser.sub },
        include: { patientProfile: true },
      })

      if (!user || !user.patientProfile) {
        reply.code(404).send({ error: 'Patient profile not found' })
        return
      }

      reply.send({
        id: user.id,
        email: user.email,
        role: user.role,
        patientProfile: user.patientProfile,
      })
    },
  )

  fastify.patch(
    '/patients/me',
    {
      schema: updateProfileSchema,
      preHandler: fastify.authenticate.bind(fastify),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = request.user as { sub: string }
      const body = request.body as {
        firstName?: string
        lastName?: string
        phone?: string
        communicationPreferences?: string
      }

      const user = await fastify.prisma.portalUser.findUnique({
        where: { id: currentUser.sub },
        include: { patientProfile: true },
      })

      if (!user || !user.patientProfile) {
        reply.code(404).send({ error: 'Patient profile not found' })
        return
      }

      const data: Record<string, string> = {}

      if (typeof body.firstName === 'string') data.firstName = body.firstName
      if (typeof body.lastName === 'string') data.lastName = body.lastName
      if (typeof body.phone === 'string') data.phone = body.phone
      if (typeof body.communicationPreferences === 'string') {
        data.communicationPreferences = body.communicationPreferences
      }

      const updatedProfile = await fastify.prisma.patientProfile.update({
        where: { id: user.patientProfile.id },
        data,
      })

      reply.send({
        id: user.id,
        email: user.email,
        role: user.role,
        patientProfile: updatedProfile,
      })
    },
  )

  fastify.get(
    '/patients/me/consultations',
    {
      preHandler: fastify.authenticate.bind(fastify),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = request.user as { sub: string }

      const user = await fastify.prisma.portalUser.findUnique({
        where: { id: currentUser.sub },
        include: { patientProfile: true },
      })

      if (!user || !user.patientProfile) {
        reply.code(404).send({ error: 'Patient profile not found' })
        return
      }

      const cases = await fastify.prisma.consultationCase.findMany({
        where: { patientProfileId: user.patientProfile.id },
        include: {
          referral: true,
          consultant: {
            include: { user: true },
          },
          slots: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      const result = cases.map((c: any) => ({
        id: c.id,
        status: c.status,
        title: c.title,
        notes: c.notes,
        scheduledAt: c.scheduledAt,
        completedAt: c.completedAt,
        referral: c.referral,
        consultant: c.consultant
          ? {
              id: c.consultant.id,
              specialty: c.consultant.specialty,
              organization: c.consultant.organization,
              user: c.consultant.user
                ? { id: c.consultant.user.id, email: c.consultant.user.email }
                : null,
            }
          : null,
        slots: c.slots,
      }))

      reply.send({ items: result })
    },
  )

  fastify.get(
    '/patients/me/appointments',
    {
      preHandler: fastify.authenticate.bind(fastify),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = request.user as { sub: string }

      const user = await fastify.prisma.portalUser.findUnique({
        where: { id: currentUser.sub },
        include: { patientProfile: true },
      })

      if (!user || !user.patientProfile) {
        reply.code(404).send({ error: 'Patient profile not found' })
        return
      }

      const slots = await fastify.prisma.appointmentSlot.findMany({
        where: {
          consultationCase: {
            patientProfileId: user.patientProfile.id,
          },
        },
        include: {
          consultationCase: {
            include: { consultant: true },
          },
        },
        orderBy: { start: 'asc' },
      })

      const result = slots.map((slot: any) => ({
        id: slot.id,
        caseId: slot.caseId,
        start: slot.start,
        end: slot.end,
        status: slot.status,
        consultation: slot.consultationCase
          ? {
              id: slot.consultationCase.id,
              status: slot.consultationCase.status,
              title: slot.consultationCase.title,
              consultantId: slot.consultationCase.consultantId,
            }
          : null,
      }))

      reply.send({ items: result })
    },
  )

  fastify.post(
    '/patients/me/external-access-requests',
    {
      schema: {
        body: {
          type: 'object',
          required: ['recipientEmail', 'type'],
          properties: {
            recipientEmail: { type: 'string', format: 'email' },
            type: { type: 'string', enum: ['VIEW_RECORD', 'UPDATE_LABS'] },
          },
        },
      },
      preHandler: fastify.authenticate.bind(fastify),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = request.user as { sub: string }
      const body = request.body as { recipientEmail: string; type: 'VIEW_RECORD' | 'UPDATE_LABS' }

      const user = await fastify.prisma.portalUser.findUnique({
        where: { id: currentUser.sub },
        include: { patientProfile: true },
      })

      if (!user || !user.patientProfile) {
        reply.code(404).send({ error: 'Patient profile not found' })
        return
      }

      const corePatientId = user.patientProfile.corePatientId
      if (!corePatientId) {
        reply.code(400).send({ error: 'Patient is not linked to a core record (missing corePatientId)' })
        return
      }

      const coreUrl = process.env.LAHIM_CORE_API_URL || 'http://localhost:3000'
      const serviceToken = process.env.PORTAL_SERVICE_TOKEN || process.env.EXTERNAL_ACCESS_SERVICE_TOKEN

      if (!serviceToken) {
        fastify.log.warn('PORTAL_SERVICE_TOKEN or EXTERNAL_ACCESS_SERVICE_TOKEN not set')
        reply.code(503).send({ error: 'Service not configured for external access requests' })
        return
      }

      try {
        const res = await fetch(`${coreUrl}/external-access-requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Service-Token': serviceToken,
          },
          body: JSON.stringify({
            corePatientId,
            recipientEmail: body.recipientEmail.toLowerCase().trim(),
            type: body.type,
            requestedBy: currentUser.sub,
          }),
        })

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}))
          reply.code(res.status).send({ error: (errBody as { error?: string }).error || res.statusText })
          return
        }

        const data = await res.json()
        reply.code(201).send(data)
      } catch (err: unknown) {
        fastify.log.error({ err }, 'external-access-request.create_failed')
        reply.code(502).send({ error: 'Failed to create external access request' })
      }
    },
  )
}

export default patientsService
