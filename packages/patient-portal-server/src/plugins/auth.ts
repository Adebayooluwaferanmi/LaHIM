import fp from 'fastify-plugin'
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import fastifyJwt from '@fastify/jwt'

declare module '@fastify/jwt' {
  // Payload stored in tokens
  interface FastifyJWT {
    payload: {
      sub: string
      role: string
      type?: 'access' | 'refresh'
    }
    user: {
      sub: string
      role: string
      type?: 'access' | 'refresh'
    }
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  const secret = process.env.PATIENT_PORTAL_JWT_SECRET || process.env.JWT_SECRET || 'change-me-in-prod'

  await fastify.register(fastifyJwt, {
    secret,
    sign: {
      expiresIn: '15m',
    },
  })

  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      try {
        await request.jwtVerify()
      } catch (err) {
        reply.code(401).send({ error: 'Unauthorized' })
      }
    },
  )
}

export default fp(authPlugin, {
  name: 'patient-portal-auth',
})


