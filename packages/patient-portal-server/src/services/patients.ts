import { FastifyPluginAsync } from 'fastify'

const patientsService: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/patients/me',
    {
      preHandler: fastify.authenticate.bind(fastify),
    },
    async (request, reply) => {
      const currentUser = request.user as { sub: string }

      const user = await fastify.prisma.portalUser.findUnique({
        where: { id: currentUser.sub },
        include: {
          patientProfile: true,
        },
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
      preHandler: fastify.authenticate.bind(fastify),
    },
    async (request, reply) => {
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

      const data: any = {}

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
    async (request, reply) => {
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
        where: {
          patientProfileId: user.patientProfile.id,
        },
        include: {
          referral: true,
          consultant: {
            include: {
              user: true,
            },
          },
          slots: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      const result = cases.map((c) => ({
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
                ? {
                    id: c.consultant.user.id,
                    email: c.consultant.user.email,
                  }
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
    async (request, reply) => {
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
            include: {
              consultant: true,
            },
          },
        },
        orderBy: {
          start: 'asc',
        },
      })

      const result = slots.map((slot) => ({
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

}

export default patientsService


