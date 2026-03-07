"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const emailPlugin = async (fastify) => {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser || 'noreply@lahim.io';
    const frontendUrl = process.env.PATIENT_PORTAL_FRONTEND_URL || 'http://localhost:3002';
    let transporter = null;
    if (smtpHost && smtpUser && smtpPass) {
        transporter = nodemailer_1.default.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });
        transporter.verify().then(() => {
            fastify.log.info('Email service configured and verified');
        }).catch((error) => {
            fastify.log.warn({ error }, 'Email service configuration failed - emails will not be sent');
            transporter = null;
        });
    }
    else {
        fastify.log.warn('Email service not configured - SMTP credentials missing');
    }
    const emailService = {
        async sendConsultantInvite(email, inviteLink, consultantName) {
            if (!transporter) {
                fastify.log.info({ email, inviteLink }, 'Would send consultant invite email (email service not configured)');
                return;
            }
            const subject = 'Invitation to Join LaHIM Patient Portal as External Consultant';
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
      `;
            await transporter.sendMail({
                from: smtpFrom,
                to: email,
                subject,
                html,
            });
            fastify.log.info({ email }, 'Consultant invite email sent');
        },
        async sendPasswordResetEmail(email, resetLink) {
            if (!transporter) {
                fastify.log.info({ email, resetLink }, 'Would send password reset email (email service not configured)');
                return;
            }
            const subject = 'Password Reset Request - LaHIM Patient Portal';
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
      `;
            await transporter.sendMail({
                from: smtpFrom,
                to: email,
                subject,
                html,
            });
            fastify.log.info({ email }, 'Password reset email sent');
        },
        async sendConsultationStatusUpdate(email, consultationTitle, status, details) {
            if (!transporter) {
                fastify.log.info({ email, consultationTitle, status }, 'Would send consultation status update (email service not configured)');
                return;
            }
            const subject = `Consultation Update: ${consultationTitle}`;
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
      `;
            await transporter.sendMail({
                from: smtpFrom,
                to: email,
                subject,
                html,
            });
            fastify.log.info({ email, consultationTitle, status }, 'Consultation status update email sent');
        },
        async sendNewMessageNotification(email, consultationTitle, senderName, messagePreview) {
            if (!transporter) {
                fastify.log.info({ email, consultationTitle, senderName }, 'Would send new message notification (email service not configured)');
                return;
            }
            const subject = `New Message: ${consultationTitle}`;
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
      `;
            await transporter.sendMail({
                from: smtpFrom,
                to: email,
                subject,
                html,
            });
            fastify.log.info({ email, consultationTitle, senderName }, 'New message notification email sent');
        },
    };
    fastify.decorate('emailService', emailService);
};
exports.default = (0, fastify_plugin_1.default)(emailPlugin, {
    name: 'email-service',
    dependencies: [],
});
//# sourceMappingURL=email.js.map