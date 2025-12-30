import { FastifyPluginAsync } from 'fastify'
import { compare, hash } from 'bcryptjs'
import { randomBytes } from 'crypto'

interface RegisterPatientBody {
  email: string
  password: string
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  phone?: string
  corePatientId?: string
}

interface LoginBody {
  email: string
  password: string
}

interface RefreshBody {
  refreshToken: string
}

interface ActivateInviteBody {
  inviteToken: string
  password: string
  firstName?: string
  lastName?: string
  specialty?: string
  organization?: string
}

interface RequestPasswordResetBody {
  email: string
}

interface ResetPasswordBody {
  resetToken: string
  newPassword: string
}

interface VerifyResetTokenBody {
  resetToken: string
}

const authService: FastifyPluginAsync = async (fastify) => {
  const buildTokens = (userId: string, role: string) => {
    const accessToken = fastify.jwt.sign(
      {
        sub: userId,
        role,
        type: 'access',
      },
      {
        expiresIn: '15m',
      },
    )

    const refreshToken = fastify.jwt.sign(
      {
        sub: userId,
        role,
        type: 'refresh',
      },
      {
        expiresIn: '7d',
      },
    )

    return { accessToken, refreshToken }
  }

  fastify.post('/auth/register-patient', async (request, reply) => {
    const body = request.body as RegisterPatientBody

    if (!body.email || !body.password) {
      reply.code(400).send({ error: 'Email and password are required' })
      return
    }

    const email = body.email.toLowerCase().trim()

    const existing = await fastify.prisma.portalUser.findUnique({
      where: { email },
    })

    if (existing) {
      reply.code(409).send({ error: 'A user with this email already exists' })
      return
    }

    const passwordHash = await hash(body.password, 10)

    const patientDateOfBirth =
      body.dateOfBirth && body.dateOfBirth.trim().length > 0
        ? new Date(body.dateOfBirth)
        : null

    const user = await fastify.prisma.portalUser.create({
      data: {
        email,
        passwordHash,
        role: 'PATIENT',
        status: 'ACTIVE',
        patientProfile: {
          create: {
            corePatientId: body.corePatientId,
            firstName: body.firstName,
            lastName: body.lastName,
            dateOfBirth: patientDateOfBirth,
            phone: body.phone,
          },
        },
      },
      include: {
        patientProfile: true,
      },
    })

    const tokens = buildTokens(user.id, user.role)

    reply.send({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        patientProfile: user.patientProfile,
      },
      tokens,
    })
  })

  fastify.post('/auth/login', async (request, reply) => {
    const body = request.body as LoginBody

    if (!body.email || !body.password) {
      reply.code(400).send({ error: 'Email and password are required' })
      return
    }

    const email = body.email.toLowerCase().trim()

    const user = await fastify.prisma.portalUser.findUnique({
      where: { email },
      include: {
        patientProfile: true,
        consultantProfile: true,
      },
    })

    if (!user) {
      reply.code(401).send({ error: 'Invalid email or password' })
      return
    }

    const passwordValid = await compare(body.password, user.passwordHash)
    if (!passwordValid) {
      reply.code(401).send({ error: 'Invalid email or password' })
      return
    }

    if (user.status !== 'ACTIVE') {
      reply.code(403).send({ error: 'User is not active' })
      return
    }

    const tokens = buildTokens(user.id, user.role)

    reply.send({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        patientProfile: user.patientProfile,
        consultantProfile: user.consultantProfile,
      },
      tokens,
    })
  })

  fastify.post('/auth/refresh', async (request, reply) => {
    const body = request.body as RefreshBody

    if (!body.refreshToken) {
      reply.code(400).send({ error: 'refreshToken is required' })
      return
    }

    try {
      const payload = fastify.jwt.verify(body.refreshToken) as {
        sub: string
        role: string
        type?: string
      }

      if (payload.type !== 'refresh') {
        reply.code(400).send({ error: 'Invalid token type' })
        return
      }

      const user = await fastify.prisma.portalUser.findUnique({
        where: { id: payload.sub },
      })

      if (!user || user.status !== 'ACTIVE') {
        reply.code(401).send({ error: 'User not found or not active' })
        return
      }

      const tokens = buildTokens(user.id, user.role)
      reply.send({ tokens })
    } catch (error) {
      fastify.log.warn({ error }, 'auth.refresh_failed')
      reply.code(401).send({ error: 'Invalid or expired refresh token' })
    }
  })

  fastify.post('/auth/activate-invite', async (request, reply) => {
    const body = request.body as ActivateInviteBody

    if (!body.inviteToken || !body.password) {
      reply.code(400).send({ error: 'inviteToken and password are required' })
      return
    }

    const user = await fastify.prisma.portalUser.findFirst({
      where: {
        inviteToken: body.inviteToken,
      },
      include: {
        consultantProfile: true,
      },
    })

    if (!user) {
      reply.code(404).send({ error: 'Invite not found or already used' })
      return
    }

    if (user.status !== 'INVITED') {
      reply.code(400).send({ error: 'Invite is not in a valid state' })
      return
    }

    if (user.inviteExpiresAt && user.inviteExpiresAt < new Date()) {
      reply.code(400).send({ error: 'Invite has expired' })
      return
    }

    const passwordHash = await hash(body.password, 10)

    const updated = await fastify.prisma.portalUser.update({
      where: { id: user.id },
      data: {
        passwordHash,
        status: 'ACTIVE',
        inviteToken: null,
        inviteExpiresAt: null,
        consultantProfile: {
          upsert: {
            create: {
              specialty: body.specialty ?? user.consultantProfile?.specialty,
              organization: body.organization ?? user.consultantProfile?.organization,
              status: 'active',
            },
            update: {
              specialty: body.specialty ?? user.consultantProfile?.specialty,
              organization: body.organization ?? user.consultantProfile?.organization,
              status: 'active',
            },
          },
        },
      },
      include: {
        consultantProfile: true,
      },
    })

    const tokens = buildTokens(updated.id, updated.role)

    reply.send({
      user: {
        id: updated.id,
        email: updated.email,
        role: updated.role,
        consultantProfile: updated.consultantProfile,
      },
      tokens,
    })
  })

  // Password reset endpoints
  fastify.post('/auth/request-reset', async (request, reply) => {
    const body = request.body as RequestPasswordResetBody

    if (!body.email) {
      reply.code(400).send({ error: 'Email is required' })
      return
    }

    const email = body.email.toLowerCase().trim()

    const user = await fastify.prisma.portalUser.findUnique({
      where: { email },
    })

    // Don't reveal if user exists for security
    if (!user || user.status !== 'ACTIVE') {
      reply.send({ message: 'If an account exists, a password reset link has been sent' })
      return
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex')
    const resetTokenExpiresAt = new Date()
    resetTokenExpiresAt.setHours(resetTokenExpiresAt.getHours() + 1) // 1 hour expiry

    await fastify.prisma.portalUser.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiresAt,
      },
    })

    // Send email with reset link
    const emailService = fastify.emailService
    if (emailService) {
      const frontendUrl = process.env.PATIENT_PORTAL_FRONTEND_URL || 'http://localhost:3002'
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`

      await emailService.sendPasswordResetEmail(user.email, resetLink).catch((err) => {
        fastify.log.warn({ error: err, email: user.email }, 'Failed to send password reset email')
      })
    } else {
      fastify.log.warn({ email: user.email }, 'Email service not configured, reset token generated but not sent')
    }

    reply.send({ message: 'If an account exists, a password reset link has been sent' })
  })

  fastify.post('/auth/verify-reset-token', async (request, reply) => {
    const body = request.body as VerifyResetTokenBody

    if (!body.resetToken) {
      reply.code(400).send({ error: 'resetToken is required' })
      return
    }

    const user = await fastify.prisma.portalUser.findFirst({
      where: {
        resetToken: body.resetToken,
      },
    })

    if (!user) {
      reply.code(404).send({ error: 'Invalid or expired reset token' })
      return
    }

    if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      reply.code(400).send({ error: 'Reset token has expired' })
      return
    }

    reply.send({ valid: true, email: user.email })
  })

  fastify.post('/auth/reset', async (request, reply) => {
    const body = request.body as ResetPasswordBody

    if (!body.resetToken || !body.newPassword) {
      reply.code(400).send({ error: 'resetToken and newPassword are required' })
      return
    }

    if (body.newPassword.length < 8) {
      reply.code(400).send({ error: 'Password must be at least 8 characters' })
      return
    }

    const user = await fastify.prisma.portalUser.findFirst({
      where: {
        resetToken: body.resetToken,
      },
    })

    if (!user) {
      reply.code(404).send({ error: 'Invalid or expired reset token' })
      return
    }

    if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      reply.code(400).send({ error: 'Reset token has expired' })
      return
    }

    const passwordHash = await hash(body.newPassword, 10)

    await fastify.prisma.portalUser.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    })

      reply.send({ message: 'Password reset successfully' })
  })
}

export default authService


