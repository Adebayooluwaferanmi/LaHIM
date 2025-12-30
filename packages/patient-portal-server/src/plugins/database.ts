import { FastifyPluginAsync } from 'fastify'
import { PrismaClient } from '@prisma/client'
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

const databasePlugin: FastifyPluginAsync = async (fastify) => {
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  try {
    await prisma.$connect()
    fastify.log.info('Patient Portal PostgreSQL connection established via Prisma')
  } catch (error) {
    fastify.log.error({ error }, 'Failed to connect to Patient Portal PostgreSQL database')
    throw error
  }

  fastify.decorate('prisma', prisma)

  fastify.addHook('onClose', async () => {
    try {
      await prisma.$disconnect()
      fastify.log.info('Patient Portal PostgreSQL connection closed')
    } catch (error) {
      fastify.log.warn({ error }, 'Error disconnecting Patient Portal PostgreSQL')
    }
  })
}

export default fp(databasePlugin, {
  name: 'patient-portal-database',
})


