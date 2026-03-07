import { FastifyPluginAsync } from 'fastify'
// @ts-ignore
import nodemailer from 'nodemailer'
// @ts-ignore
import fp from 'fastify-plugin'

interface EmailService {
  sendConsultantInvite(email: string, inviteLink: string, consultantName?: string): Promise<void>
  sendPatientInvite(email: string, inviteLink: string, patientName?: string): Promise<void>
  sendPasswordResetEmail(email: string, resetLink: string): Promise<void>
  sendConsultationStatusUpdate(
    email: string,
    consultationTitle: string,
    status: string,
    details?: string,
  ): Promise<void>
  sendNewMessageNotification(
    email: string,
    consultationTitle: string,
    senderName: string,
    messagePreview: string,
  ): Promise<void>
}

declare module 'fastify' {
  // @ts-ignore - FastifyInstance type parameters must match
  interface FastifyInstance {
    emailService: EmailService
  }
}

const emailPlugin: FastifyPluginAsync = async (fastify: any) => {
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10)
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpFrom = process.env.SMTP_FROM || smtpUser || 'noreply@lahim.io'
  const frontendUrl = process.env.PATIENT_PORTAL_FRONTEND_URL || 'http://localhost:3002'

  let transporter: nodemailer.Transporter | null = null

  if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    // Verify connection
    transporter.verify().then(() => {
      fastify.log.info('Email service configured and verified')
    }).catch((error: any) => {
      fastify.log.warn({ error }, 'Email service configuration failed - emails will not be sent')
      transporter = null
    })
  } else {
    fastify.log.warn('Email service not configured - SMTP credentials missing')
  }

  const emailService: EmailService = {
    async sendConsultantInvite(email: string, inviteLink: string, consultantName?: string) {
      if (!transporter) {
        fastify.log.info({ email, inviteLink }, 'Would send consultant invite email (email service not configured)')
        return
      }

      const subject = 'Invitation to Join LaHIM Patient Portal as External Consultant'
      const html = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Consultant Invitation</h2>
            <p>${consultantName ? `Hello ${consultantName},` : 'Hello,'}</p>
            <p>You have been invited to join the LaHIM Patient Portal as an external consultant.</p>
            <p>Please click the link below to activate your account and set your password:</p>
            <p><a href="${inviteLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Activate Account</a></p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${inviteLink}</p>
            <p>This invitation will expire in 7 days.</p>
            <p>If you did not expect this invitation, please ignore this email.</p>
            <hr>
            <p style="font-size: 12px; color: #666;">This is an automated message from LaHIM Patient Portal.</p>
          </body>
        </html>
      `

      await transporter.sendMail({
        from: smtpFrom,
        to: email,
        subject,
        html,
      })

      fastify.log.info({ email }, 'Consultant invite email sent')
    },

    async sendPatientInvite(email: string, inviteLink: string, patientName?: string) {
      if (!transporter) {
        fastify.log.info({ email, inviteLink }, 'Would send patient invite email (email service not configured)')
        return
      }

      const subject = 'Invitation to Join LaHIM Patient Portal'
      const html = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Patient Portal Invitation</h2>
            <p>${patientName ? `Hello ${patientName},` : 'Hello,'}</p>
            <p>Your healthcare provider has set up a consultation for you through the LaHIM Patient Portal.</p>
            <p>Please click the link below to activate your account and set your password:</p>
            <p><a href="${inviteLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Activate Account</a></p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${inviteLink}</p>
            <p>This invitation will expire in 7 days.</p>
            <p>If you did not expect this invitation, please ignore this email.</p>
            <hr>
            <p style="font-size: 12px; color: #666;">This is an automated message from LaHIM Patient Portal.</p>
          </body>
        </html>
      `

      await transporter.sendMail({
        from: smtpFrom,
        to: email,
        subject,
        html,
      })

      fastify.log.info({ email }, 'Patient invite email sent')
    },

    async sendPasswordResetEmail(email: string, resetLink: string) {
      if (!transporter) {
        fastify.log.info({ email, resetLink }, 'Would send password reset email (email service not configured)')
        return
      }

      const subject = 'Password Reset Request - LaHIM Patient Portal'
      const html = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Password Reset Request</h2>
            <p>You have requested to reset your password for your LaHIM Patient Portal account.</p>
            <p>Click the link below to reset your password:</p>
            <p><a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${resetLink}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
            <hr>
            <p style="font-size: 12px; color: #666;">This is an automated message from LaHIM Patient Portal.</p>
          </body>
        </html>
      `

      await transporter.sendMail({
        from: smtpFrom,
        to: email,
        subject,
        html,
      })

      fastify.log.info({ email }, 'Password reset email sent')
    },

    async sendConsultationStatusUpdate(
      email: string,
      consultationTitle: string,
      status: string,
      details?: string,
    ) {
      if (!transporter) {
        fastify.log.info({ email, consultationTitle, status }, 'Would send consultation status update (email service not configured)')
        return
      }

      const subject = `Consultation Update: ${consultationTitle}`
      const html = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Consultation Status Update</h2>
            <p>Your consultation "<strong>${consultationTitle}</strong>" status has been updated to: <strong>${status}</strong></p>
            ${details ? `<p>${details}</p>` : ''}
            <p><a href="${frontendUrl}/consultations" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Consultation</a></p>
            <hr>
            <p style="font-size: 12px; color: #666;">This is an automated message from LaHIM Patient Portal.</p>
          </body>
        </html>
      `

      await transporter.sendMail({
        from: smtpFrom,
        to: email,
        subject,
        html,
      })

      fastify.log.info({ email, consultationTitle, status }, 'Consultation status update email sent')
    },

    async sendNewMessageNotification(
      email: string,
      consultationTitle: string,
      senderName: string,
      messagePreview: string,
    ) {
      if (!transporter) {
        fastify.log.info({ email, consultationTitle, senderName }, 'Would send new message notification (email service not configured)')
        return
      }

      const subject = `New Message: ${consultationTitle}`
      const html = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>New Message</h2>
            <p>You have received a new message in consultation "<strong>${consultationTitle}</strong>" from ${senderName}.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
              <p style="margin: 0;">${messagePreview.substring(0, 200)}${messagePreview.length > 200 ? '...' : ''}</p>
            </div>
            <p><a href="${frontendUrl}/consultations" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Message</a></p>
            <hr>
            <p style="font-size: 12px; color: #666;">This is an automated message from LaHIM Patient Portal.</p>
          </body>
        </html>
      `

      await transporter.sendMail({
        from: smtpFrom,
        to: email,
        subject,
        html,
      })

      fastify.log.info({ email, consultationTitle, senderName }, 'New message notification email sent')
    },
  }

  // Decorate fastify instance with email service
  fastify.decorate('emailService', emailService)
}

// @ts-ignore - fastify-plugin types
export default fp(emailPlugin, {
  name: 'email-service',
  dependencies: [],
})

