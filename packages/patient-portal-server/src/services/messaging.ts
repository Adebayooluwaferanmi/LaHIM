import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'

interface CreateMessageBody {
  body: string
}

const idParamsSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string', format: 'uuid' } },
  },
}

const createMessageSchema = {
  ...idParamsSchema,
  body: {
    type: 'object',
    required: ['body'],
    properties: {
      body: { type: 'string', minLength: 1 },
    },
  },
}

const messagingService: FastifyPluginAsync = async (fastify: any) => {
  const ensureAccessToCase = async (userId: string, role: string, caseId: string) => {
    const consultation = await fastify.prisma.consultationCase.findUnique({
      where: { id: caseId },
      include: {
        patientProfile: true,
        consultant: true,
      },
    })

    if (!consultation) {
      return { allowed: false, reason: 'not-found' as const }
    }

    if (role === 'PATIENT') {
      const patient = await fastify.prisma.patientProfile.findFirst({
        where: { id: consultation.patientProfileId, userId },
      })
      if (!patient) {
        return { allowed: false, reason: 'forbidden' as const }
      }
    }

    if (role === 'EXTERNAL_CONSULTANT') {
      const consultant = await fastify.prisma.externalConsultant.findFirst({
        where: { id: consultation.consultantId ?? '', userId },
      })
      if (!consultant) {
        return { allowed: false, reason: 'forbidden' as const }
      }
    }

    return { allowed: true, consultation }
  }

  fastify.get(
    '/consultations/:id/messages',
    {
      schema: idParamsSchema,
      preHandler: fastify.authenticate.bind(fastify),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = request.user as { sub: string; role: string }
      const { id } = request.params as { id: string }

      const access = await ensureAccessToCase(currentUser.sub, currentUser.role, id)
      if (!access.allowed) {
        if (access.reason === 'not-found') {
          reply.code(404).send({ error: 'Consultation not found' })
        } else {
          reply.code(403).send({ error: 'Access denied' })
        }
        return
      }

      const thread = await fastify.prisma.messageThread.findFirst({
        where: { caseId: id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      })

      if (!thread) {
        reply.send({ items: [] })
        return
      }

      reply.send({
        items: [{ id: thread.id, messages: thread.messages }],
      })
    },
  )

  fastify.post(
    '/consultations/:id/messages',
    {
      schema: createMessageSchema,
      preHandler: fastify.authenticate.bind(fastify),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = request.user as { sub: string; role: string }
      const { id } = request.params as { id: string }
      const msgBody = request.body as CreateMessageBody

      const access = await ensureAccessToCase(currentUser.sub, currentUser.role, id)
      if (!access.allowed) {
        if (access.reason === 'not-found') {
          reply.code(404).send({ error: 'Consultation not found' })
        } else {
          reply.code(403).send({ error: 'Access denied' })
        }
        return
      }

      const thread = await fastify.prisma.messageThread.upsert({
        where: { caseId: id },
        update: {},
        create: {
          caseId: id,
          subject: `Consultation ${id}`,
        },
      })

      const message = await fastify.prisma.message.create({
        data: {
          threadId: thread.id,
          senderUserId: currentUser.sub,
          body: msgBody.body,
        },
      })

      if (fastify.emailService && access.consultation) {
        const caseWithParties = await fastify.prisma.consultationCase.findUnique({
          where: { id },
          include: {
            consultant: { include: { user: true } },
            patientProfile: { include: { user: true } },
          },
        })
        const title = caseWithParties?.title || `Consultation ${id}`
        const recipientEmail =
          currentUser.role === 'PATIENT'
            ? caseWithParties?.consultant?.user?.email
            : caseWithParties?.patientProfile?.user?.email
        if (recipientEmail) {
          const senderUser = await fastify.prisma.portalUser.findUnique({
            where: { id: currentUser.sub },
            include: { patientProfile: true, consultantProfile: true },
          })
          const senderName =
            senderUser?.patientProfile
              ? [senderUser.patientProfile.firstName, senderUser.patientProfile.lastName].filter(Boolean).join(' ') || senderUser.email
              : senderUser?.consultantProfile
                ? senderUser.email
                : senderUser?.email || 'Someone'
          const messagePreview = msgBody.body.substring(0, 200) + (msgBody.body.length > 200 ? '...' : '')
          await fastify.emailService
            .sendNewMessageNotification(recipientEmail, title, senderName, messagePreview)
            .catch((err: any) => {
              fastify.log.warn({ error: err }, 'Failed to send new message notification')
            })
        }
      }

      reply.code(201).send(message)
    },
  )
}

export default messagingService
