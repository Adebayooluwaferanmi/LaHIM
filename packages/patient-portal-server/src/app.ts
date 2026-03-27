import { join } from 'path'
import AutoLoad from '@fastify/autoload'
import { FastifyInstance } from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import rateLimit from '@fastify/rate-limit'

async function PatientPortalApp(fastify: FastifyInstance, opts: any) {
  const frontendUrl =
    process.env.PATIENT_PORTAL_FRONTEND_URL ||
    process.env.FRONTEND_URL ||
    'http://localhost:3002'

  const allowedOrigins = [
    frontendUrl,
    'http://localhost:3002',
    'http://127.0.0.1:3002',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
  ]

  fastify.register(cors, {
    origin: (origin: string | undefined, callback: any) => {
      if (!origin) {
        callback(null, true)
        return
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'), false)
      }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Service-Token'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  fastify.register(helmet)

  fastify.register(rateLimit, {
    global: false,
  })

  fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  })

  fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: { ...opts },
  } as any)

  fastify.register(AutoLoad, {
    dir: join(__dirname, 'services'),
    options: { ...opts },
  } as any)
}

PatientPortalApp.options = {
  logger: true,
  ignoreTrailingSlash: true,
}

export default PatientPortalApp


