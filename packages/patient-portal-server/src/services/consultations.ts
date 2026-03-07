import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'

const idParamsSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string', format: 'uuid' } },
  },
}

const consultationsService: FastifyPluginAsync = async (fastify: any) => {
  fastify.get(
    '/consultations',
    {
      preHandler: fastify.authenticate.bind(fastify),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = request.user as { sub: string; role: string }

      let where: any = {}

      if (currentUser.role === 'EXTERNAL_CONSULTANT') {
        const consultant = await fastify.prisma.externalConsultant.findFirst({
          where: { userId: currentUser.sub },
        })

        if (!consultant) {
          reply.send({ items: [] })
          return
        }

        where.consultantId = consultant.id
      } else if (currentUser.role === 'PATIENT') {
        const patient = await fastify.prisma.patientProfile.findFirst({
          where: { userId: currentUser.sub },
        })

        if (!patient) {
          reply.send({ items: [] })
          return
        }

        where.patientProfileId = patient.id
      }

      const cases = await fastify.prisma.consultationCase.findMany({
        where,
        include: {
          referral: true,
          patientProfile: true,
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
        patient: c.patientProfile,
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
    '/consultations/:id',
    {
      schema: idParamsSchema,
      preHandler: fastify.authenticate.bind(fastify),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = request.user as { sub: string; role: string }
      const { id } = request.params as { id: string }

      const consultation = await fastify.prisma.consultationCase.findUnique({
        where: { id },
        include: {
          referral: true,
          patientProfile: true,
          consultant: {
            include: { user: true },
          },
          slots: true,
        },
      })

      if (!consultation) {
        reply.code(404).send({ error: 'Consultation not found' })
        return
      }

      if (currentUser.role === 'PATIENT') {
        const patient = await fastify.prisma.patientProfile.findFirst({
          where: { id: consultation.patientProfileId, userId: currentUser.sub },
        })
        if (!patient) {
          reply.code(403).send({ error: 'Access denied' })
          return
        }
      }

      if (currentUser.role === 'EXTERNAL_CONSULTANT') {
        const consultant = await fastify.prisma.externalConsultant.findFirst({
          where: { id: consultation.consultantId ?? '', userId: currentUser.sub },
        })
        if (!consultant) {
          reply.code(403).send({ error: 'Access denied' })
          return
        }
      }

      reply.send(consultation)
    },
  )
}

export default consultationsService
