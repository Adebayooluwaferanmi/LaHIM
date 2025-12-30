import { Server, IncomingMessage, ServerResponse } from 'http'
import { FastifyError, FastifyInstance } from 'fastify'
import { createWriteStream, existsSync, mkdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { randomBytes } from 'crypto'

type FastifyTypedInstance = FastifyInstance<Server, IncomingMessage, ServerResponse>

interface CreateDocumentBody {
  type: string
  title?: string
  filename?: string
  storageKey?: string
  contentType?: string
  size?: number
}

export default (
  fastify: FastifyTypedInstance,
  _opts: {},
  next: (err?: FastifyError) => void,
) => {
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
      preHandler: fastify.authenticate.bind(fastify),
    },
    async (request, reply) => {
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
      preHandler: fastify.authenticate.bind(fastify),
    },
    async (request, reply) => {
      const currentUser = request.user as { sub: string; role: string }
      const { id } = request.params as { id: string }
      const body = request.body as CreateDocumentBody

      if (!body.type) {
        reply.code(400).send({ error: 'type is required' })
        return
      }

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
      preHandler: fastify.authenticate.bind(fastify),
    },
    async (request, reply) => {
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

      // If storage key exists, try to serve the file
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

      // Fallback to metadata if file not found
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

  // File upload endpoint
  fastify.post(
    '/consultations/:id/documents/upload',
    {
      preHandler: fastify.authenticate.bind(fastify),
    },
    async (request, reply) => {
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

      const data = await request.file()
      if (!data) {
        reply.code(400).send({ error: 'No file uploaded' })
        return
      }

      // Ensure uploads directory exists
      const uploadsDir = join(process.cwd(), 'uploads', 'consultations')
      if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true })
      }

      // Generate unique filename
      const fileExtension = data.filename?.split('.').pop() || ''
      const storageKey = `${randomBytes(16).toString('hex')}.${fileExtension}`
      const filePath = join(uploadsDir, storageKey)

      // Write file to disk
      const writeStream = createWriteStream(filePath)
      await data.file.pipe(writeStream)

      // Create document record
      const created = await fastify.prisma.consultationDocument.create({
        data: {
          caseId: id,
          type: data.fieldname || 'document',
          title: data.filename,
          filename: data.filename,
          storageKey,
          contentType: data.mimetype || 'application/octet-stream',
          size: data.file.bytesRead || null,
          uploadedByUserId: currentUser.sub,
        },
      })

      reply.code(201).send(created)
    },
  )

  next()
}


