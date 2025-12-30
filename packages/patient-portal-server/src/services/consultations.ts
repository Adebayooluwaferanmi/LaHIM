import { FastifyPluginAsync } from 'fastify'

interface CompleteConsultationBody {
  notes?: string
}

interface CreateSlotBody {
  start: string
  end: string
}

const consultationsService: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/consultations',
    {
      preHandler: fastify.authenticate.bind(fastify),
    },
    async (request, reply) => {
      const currentUser = request.user as { sub: string; role: string }

      let where: any = {}

      if (currentUser.role === 'EXTERNAL_CONSULTANT') {
        const consultant = await fastify.prisma.externalConsultant.findFirst({
          where: {
            userId: currentUser.sub,
          },
        })

        if (!consultant) {
          reply.send({ items: [] })
          return
        }

        where.consultantId = consultant.id
      } else if (currentUser.role === 'PATIENT') {
        const patient = await fastify.prisma.patientProfile.findFirst({
          where: {
            userId: currentUser.sub,
          },
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
        patient: c.patientProfile,
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
    '/consultations/:id',
    {
      preHandler: fastify.authenticate.bind(fastify),
    },
    async (request, reply) => {
      const currentUser = request.user as { sub: string; role: string }
      const { id } = request.params as { id: string }

      const consultation = await fastify.prisma.consultationCase.findUnique({
        where: { id },
        include: {
          referral: true,
          patientProfile: true,
          consultant: {
            include: {
              user: true,
            },
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
          where: {
            id: consultation.patientProfileId,
            userId: currentUser.sub,
          },
        })

        if (!patient) {
          reply.code(403).send({ error: 'Access denied' })
          return
        }
      }

      if (currentUser.role === 'EXTERNAL_CONSULTANT') {
        const consultant = await fastify.prisma.externalConsultant.findFirst({
          where: {
            id: consultation.consultantId ?? '',
            userId: currentUser.sub,
          },
        })

        if (!consultant) {
          reply.code(403).send({ error: 'Access denied' })
          return
        }
      }

      reply.send(consultation)
    },
  )

  fastify.post(
    '/consultations/:id/slots',
    {
      preHandler: fastify.authenticate.bind(fastify),
    },
    async (request, reply) => {
      const currentUser = request.user as { sub: string; role: string }

      if (currentUser.role !== 'EXTERNAL_CONSULTANT') {
        reply.code(403).send({ error: 'Only external consultants can propose slots' })
        return
      }

      const { id } = request.params as { id: string }
      const body = request.body as CreateSlotBody

      if (!body.start || !body.end) {
        reply.code(400).send({ error: 'start and end are required' })
        return
      }

      const consultation = await fastify.prisma.consultationCase.findUnique({
        where: { id },
        include: { consultant: true },
      })

      if (!consultation) {
        reply.code(404).send({ error: 'Consultation not found' })
        return
      }

      const consultant = await fastify.prisma.externalConsultant.findFirst({
        where: {
          id: consultation.consultantId ?? '',
          userId: currentUser.sub,
        },
      })

      if (!consultant) {
        reply.code(403).send({ error: 'Access denied' })
        return
      }

      const slot = await fastify.prisma.appointmentSlot.create({
        data: {
          caseId: consultation.id,
          start: new Date(body.start),
          end: new Date(body.end),
          status: 'proposed',
        },
      })

      reply.code(201).send(slot)
    },
  )

  fastify.post(
    '/consultations/:id/complete',
    {
      preHandler: fastify.authenticate.bind(fastify),
    },
    async (request, reply) => {
      const currentUser = request.user as { sub: string; role: string }

      if (currentUser.role !== 'EXTERNAL_CONSULTANT') {
        reply.code(403).send({ error: 'Only external consultants can complete consultations' })
        return
      }

      const { id } = request.params as { id: string }
      const body = request.body as CompleteConsultationBody

      const consultation = await fastify.prisma.consultationCase.findUnique({
        where: { id },
        include: { consultant: true },
      })

      if (!consultation) {
        reply.code(404).send({ error: 'Consultation not found' })
        return
      }

      const consultant = await fastify.prisma.externalConsultant.findFirst({
        where: {
          id: consultation.consultantId ?? '',
          userId: currentUser.sub,
        },
      })

      if (!consultant) {
        reply.code(403).send({ error: 'Access denied' })
        return
      }

      const updated = await fastify.prisma.consultationCase.update({
        where: { id: consultation.id },
        data: {
          status: 'completed',
          notes: body.notes ?? consultation.notes,
          completedAt: new Date(),
        },
      })

      // Notify LaHIM core when a consultation is completed
      const lahimCoreUrl = process.env.LAHIM_CORE_API_URL || 'http://localhost:3000'
      const webhookToken = process.env.PORTAL_WEBHOOK_TOKEN

      // Get documents for this consultation
      const documents = await fastify.prisma.consultationDocument.findMany({
        where: { caseId: updated.id },
        select: {
          id: true,
          type: true,
          title: true,
          filename: true,
        },
      })

      try {
        await fetch(`${lahimCoreUrl}/webhooks/consultation-completed`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(webhookToken ? { 'X-Webhook-Token': webhookToken } : {}),
          },
          body: JSON.stringify({
            consultationId: updated.id,
            portalReferralId: consultation.referralId,
            notes: updated.notes,
            documents: documents,
          }),
        }).catch((err) => {
          fastify.log.warn({ error: err }, 'Failed to notify LaHIM core of consultation completion')
        })
      } catch (err) {
        fastify.log.warn({ error: err }, 'Error calling LaHIM core webhook')
      }

      reply.send(updated)
    },
  )
}

export default consultationsService


