import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { createWriteStream, existsSync, mkdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { randomBytes } from 'crypto'

interface CreateDocumentBody {
  type: string
  title?: string
  filename?: string
  storageKey?: string
  contentType?: string
  size?: number
}

const caseIdParamsSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string', format: 'uuid' } },
  },
}

const docIdParamsSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string', format: 'uuid' } },
  },
}

const createDocumentSchema = {
  ...caseIdParamsSchema,
  body: {
    type: 'object',
    required: ['type'],
    properties: {
      type: { type: 'string', minLength: 1 },
      title: { type: 'string' },
      filename: { type: 'string' },
      storageKey: { type: 'string' },
      contentType: { type: 'string' },
      size: { type: 'integer', minimum: 0 },
    },
  },
}

const documentsService: FastifyPluginAsync = async (fastify: any) => {
  const ensureCaseAccess = async (userId: string, role: string, caseId: string) => {
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
    '/consultations/:id/documents',
    {
      schema: caseIdParamsSchema,
      preHandler: fastify.authenticate.bind(fastify),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = request.user as { sub: string; role: string }
      const { id } = request.params as { id: string }

      const access = await ensureCaseAccess(currentUser.sub, currentUser.role, id)
      if (!access.allowed) {
        if (access.reason === 'not-found') {
          reply.code(404).send({ error: 'Consultation not found' })
        } else {
          reply.code(403).send({ error: 'Access denied' })
        }
        return
      }

      const docs = await fastify.prisma.consultationDocument.findMany({
        where: { caseId: id },
        orderBy: { createdAt: 'desc' },
      })

      reply.send({ items: docs })
    },
  )

  fastify.post(
    '/consultations/:id/documents',
    {
      schema: createDocumentSchema,
      preHandler: fastify.authenticate.bind(fastify),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = request.user as { sub: string; role: string }
      const { id } = request.params as { id: string }
      const body = request.body as CreateDocumentBody

      const access = await ensureCaseAccess(currentUser.sub, currentUser.role, id)
      if (!access.allowed) {
        if (access.reason === 'not-found') {
          reply.code(404).send({ error: 'Consultation not found' })
        } else {
          reply.code(403).send({ error: 'Access denied' })
        }
        return
      }

      const created = await fastify.prisma.consultationDocument.create({
        data: {
          caseId: id,
          type: body.type,
          title: body.title,
          filename: body.filename,
          storageKey: body.storageKey,
          contentType: body.contentType,
          size: body.size ?? null,
          uploadedByUserId: currentUser.sub,
        },
      })

      reply.code(201).send(created)
    },
  )

  fastify.get(
    '/documents/:id/download',
    {
      schema: docIdParamsSchema,
      preHandler: fastify.authenticate.bind(fastify),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = request.user as { sub: string; role: string }
      const { id } = request.params as { id: string }

      const doc = await fastify.prisma.consultationDocument.findUnique({
        where: { id },
        include: {
          consultationCase: true,
        },
      })

      if (!doc || !doc.consultationCase) {
        reply.code(404).send({ error: 'Document not found' })
        return
      }

      const access = await ensureCaseAccess(
        currentUser.sub,
        currentUser.role,
        doc.consultationCase.id,
      )
      if (!access.allowed) {
        if (access.reason === 'not-found') {
          reply.code(404).send({ error: 'Consultation not found' })
        } else {
          reply.code(403).send({ error: 'Access denied' })
        }
        return
      }

      if (doc.storageKey) {
        const uploadsDir = join(process.cwd(), 'uploads', 'consultations')
        const filePath = join(uploadsDir, doc.storageKey)

        if (existsSync(filePath)) {
          const fileBuffer = readFileSync(filePath)
          reply
            .header('Content-Type', doc.contentType || 'application/octet-stream')
            .header('Content-Disposition', `attachment; filename="${doc.filename || 'document'}"`)
            .send(fileBuffer)
          return
        }
      }

      reply.send({
        id: doc.id,
        type: doc.type,
        title: doc.title,
        filename: doc.filename,
        storageKey: doc.storageKey,
        contentType: doc.contentType,
        size: doc.size,
      })
    },
  )

  fastify.post(
    '/consultations/:id/documents/upload',
    {
      preHandler: fastify.authenticate.bind(fastify),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = request.user as { sub: string; role: string }
      const { id } = request.params as { id: string }

      const access = await ensureCaseAccess(currentUser.sub, currentUser.role, id)
      if (!access.allowed) {
        if (access.reason === 'not-found') {
          reply.code(404).send({ error: 'Consultation not found' })
        } else {
          reply.code(403).send({ error: 'Access denied' })
        }
        return
      }

      const data = await (request as any).file()
      if (!data) {
        reply.code(400).send({ error: 'No file uploaded' })
        return
      }

      const uploadsDir = join(process.cwd(), 'uploads', 'consultations')
      if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true })
      }

      const fileExtension = data.filename?.split('.').pop() || ''
      const storageKey = `${randomBytes(16).toString('hex')}.${fileExtension}`
      const filePath = join(uploadsDir, storageKey)

      const buffer = await data.toBuffer()
      const writeStream = createWriteStream(filePath)
      writeStream.write(buffer)
      writeStream.end()

      await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', () => resolve())
        writeStream.on('error', reject)
      })

      const created = await fastify.prisma.consultationDocument.create({
        data: {
          caseId: id,
          type: data.fieldname || 'document',
          title: data.filename,
          filename: data.filename,
          storageKey,
          contentType: data.mimetype || 'application/octet-stream',
          size: buffer.length || null,
          uploadedByUserId: currentUser.sub,
        },
      })

      reply.code(201).send(created)
    },
  )
}

export default documentsService
