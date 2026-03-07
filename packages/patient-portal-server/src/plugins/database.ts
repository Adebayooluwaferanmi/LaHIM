import { FastifyPluginAsync } from 'fastify'
import { PrismaClient } from '@prisma/client'
// @ts-ignore
import fp from 'fastify-plugin'

declare module 'fastify' {
  // @ts-ignore - FastifyInstance type parameters
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

const databasePlugin: FastifyPluginAsync = async (fastify: any) => {
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  try {
    await prisma.$connect()
    // @ts-ignore - logger methods exist at runtime
    fastify.log.info('Patient Portal PostgreSQL connection established via Prisma')
  } catch (error) {
    // @ts-ignore - logger methods exist at runtime
    fastify.log.error({ error }, 'Failed to connect to Patient Portal PostgreSQL database')
    throw error
  }

  fastify.decorate('prisma', prisma)

  // @ts-ignore - addHook exists at runtime
  fastify.addHook('onClose', async () => {
    try {
      await prisma.$disconnect()
      // @ts-ignore - logger methods exist at runtime
      fastify.log.info('Patient Portal PostgreSQL connection closed')
    } catch (error) {
      // @ts-ignore - logger methods exist at runtime
      fastify.log.warn({ error }, 'Error disconnecting Patient Portal PostgreSQL')
    }
  })
}

// @ts-ignore - fastify-plugin types
export default fp(databasePlugin, {
  name: 'patient-portal-database',
})


