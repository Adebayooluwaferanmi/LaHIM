import { Server, IncomingMessage, ServerResponse } from 'http'
import { FastifyError, FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'

type FastifyTypedInstance = FastifyInstance<Server, IncomingMessage, ServerResponse>

interface ReferralPatientPayload {
  corePatientId?: string
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  phone?: string
  email?: string
}

interface ReferralPayload {
  coreReferralId?: string
  requestedSpecialty?: string
  priority?: string
  reason?: string
}

interface CreateReferralBody {
  patient: ReferralPatientPayload
  referral: ReferralPayload
}

interface InviteConsultantBody {
  email: string
  firstName?: string
  lastName?: string
  specialty?: string
  organization?: string
  expiresInHours?: number
}

export default (
  fastify: FastifyTypedInstance,
  _opts: {},
  next: (err?: FastifyError) => void,
) => {
  const verifyServiceToken = (token?: string | string[]) => {
    const expected = process.env.PORTAL_SERVICE_TOKEN || 'change-me-service-token'
    if (!token) return false
    if (Array.isArray(token)) return token.includes(expected)
    return token === expected
  }

  fastify.post('/integrations/referrals', async (request, reply) => {
    const headerToken = request.headers['x-service-token']

    if (!verifyServiceToken(headerToken as any)) {
      reply.code(401).send({ error: 'Invalid service token' })
      return
    }

    const body = request.body as CreateReferralBody
    const { patient, referral } = body

    if (!patient) {
      reply.code(400).send({ error: 'patient payload is required' })
      return
    }

    const corePatientId = patient.corePatientId

    let patientProfile = null

    if (corePatientId) {
      patientProfile = await fastify.prisma.patientProfile.findFirst({
        where: { corePatientId },
      })
    }

    if (!patientProfile) {
      const dateOfBirth =
        patient.dateOfBirth && patient.dateOfBirth.trim().length > 0
          ? new Date(patient.dateOfBirth)
          : null

      // Optionally create a portal user for the patient when an email is provided.
      let portalUser = null
      if (patient.email) {
        const email = patient.email.toLowerCase().trim()
        portalUser = await fastify.prisma.portalUser.upsert({
          where: { email },
          update: {},
          create: {
            email,
            passwordHash: '', // Will be set when patient activates portal account
            role: 'PATIENT',
            status: 'INVITED',
          },
        })
      }

      patientProfile = await fastify.prisma.patientProfile.create({
        data: {
          userId: portalUser ? portalUser.id : randomUUID(),
          corePatientId,
          firstName: patient.firstName,
          lastName: patient.lastName,
          dateOfBirth,
          phone: patient.phone,
        },
      })
    }

    const createdReferral = await fastify.prisma.consultationReferral.create({
      data: {
        coreReferralId: referral?.coreReferralId,
        corePatientId,
        patientProfileId: patientProfile.id,
        requestedSpecialty: referral?.requestedSpecialty,
        priority: referral?.priority,
        reason: referral?.reason,
        status: 'pending',
      },
    })

    const consultation = await fastify.prisma.consultationCase.create({
      data: {
        referralId: createdReferral.id,
        patientProfileId: patientProfile.id,
        status: 'pending',
        title: referral?.reason ?? `Referral ${createdReferral.id}`,
      },
    })

    reply.code(201).send({
      referral: createdReferral,
      consultation,
    })
  })

  fastify.post('/integrations/consultant-invites', async (request, reply) => {
    const headerToken = request.headers['x-service-token']

    if (!verifyServiceToken(headerToken as any)) {
      reply.code(401).send({ error: 'Invalid service token' })
      return
    }

    const body = request.body as InviteConsultantBody

    if (!body.email) {
      reply.code(400).send({ error: 'email is required' })
      return
    }

    const email = body.email.toLowerCase().trim()
    const inviteToken = randomUUID()

    const expiresInHours = body.expiresInHours && body.expiresInHours > 0 ? body.expiresInHours : 72
    const inviteExpiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)

    const user = await fastify.prisma.portalUser.upsert({
      where: { email },
      update: {
        role: 'EXTERNAL_CONSULTANT',
        status: 'INVITED',
        inviteToken,
        inviteExpiresAt,
      },
      create: {
        email,
        passwordHash: '',
        role: 'EXTERNAL_CONSULTANT',
        status: 'INVITED',
        inviteToken,
        inviteExpiresAt,
      },
    })

    const consultant = await fastify.prisma.externalConsultant.upsert({
      where: {
        userId: user.id,
      },
      update: {
        specialty: body.specialty,
        organization: body.organization,
      },
      create: {
        userId: user.id,
        specialty: body.specialty,
        organization: body.organization,
      },
    })

    // Send invite email if email service is configured
    const frontendUrl = process.env.PATIENT_PORTAL_FRONTEND_URL || 'http://localhost:3002'
    const inviteLink = `${frontendUrl}/activate-invite?token=${inviteToken}`

    if (fastify.emailService) {
      await fastify.emailService
        .sendConsultantInvite(user.email, inviteLink, body.name)
        .catch((err) => {
          fastify.log.warn({ error: err, email: user.email }, 'Failed to send consultant invite email')
        })
    } else {
      fastify.log.info({ email: user.email, inviteToken }, 'Consultant invite created but email service not configured')
    }

    reply.code(201).send({
      userId: user.id,
      consultantId: consultant.id,
      inviteToken,
      inviteExpiresAt,
    })
  })

  next()
}


