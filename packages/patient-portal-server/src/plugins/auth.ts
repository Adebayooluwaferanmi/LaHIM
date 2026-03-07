// @ts-ignore
import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
// @ts-ignore
import fastifyJwt from '@fastify/jwt'

// @ts-ignore - @fastify/jwt module augmentation
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
  // @ts-ignore - FastifyInstance type parameters
  interface FastifyInstance {
    authenticate(request: any, reply: any): Promise<void>
  }
}

const authPlugin: FastifyPluginAsync = async (fastify: any) => {
  const secret = process.env.PATIENT_PORTAL_JWT_SECRET || process.env.JWT_SECRET || 'change-me-in-prod'

  await fastify.register(fastifyJwt, {
    secret,
    sign: {
      expiresIn: '15m',
    },
  })

  fastify.decorate(
    'authenticate',
    async (request: any, reply: any): Promise<void> => {
      try {
        // @ts-ignore - jwtVerify is added by @fastify/jwt
        await request.jwtVerify()
      } catch (err) {
        reply.code(401).send({ error: 'Unauthorized' })
      }
    },
  )
}

// @ts-ignore - fastify-plugin types
export default fp(authPlugin, {
  name: 'patient-portal-auth',
})


