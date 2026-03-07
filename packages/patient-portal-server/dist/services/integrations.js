"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const integrationsService = async (fastify) => {
    const verifyServiceToken = (token) => {
        const expected = process.env.PORTAL_SERVICE_TOKEN || 'change-me-service-token';
        if (!token)
            return false;
        if (Array.isArray(token))
            return token.includes(expected);
        return token === expected;
    };
    fastify.post('/integrations/referrals', async (request, reply) => {
        const headerToken = request.headers['x-service-token'];
        if (!verifyServiceToken(headerToken)) {
            reply.code(401).send({ error: 'Invalid service token' });
            return;
        }
        const body = request.body;
        const { patient, referral } = body;
        if (!patient) {
            reply.code(400).send({ error: 'patient payload is required' });
            return;
        }
        const corePatientId = patient.corePatientId;
        let patientProfile = null;
        if (corePatientId) {
            patientProfile = await fastify.prisma.patientProfile.findFirst({
                where: { corePatientId },
            });
        }
        if (!patientProfile) {
            const dateOfBirth = patient.dateOfBirth && patient.dateOfBirth.trim().length > 0
                ? new Date(patient.dateOfBirth)
                : null;
            let portalUser = null;
            if (patient.email) {
                const email = patient.email.toLowerCase().trim();
                portalUser = await fastify.prisma.portalUser.upsert({
                    where: { email },
                    update: {},
                    create: {
                        email,
                        passwordHash: '',
                        role: 'PATIENT',
                        status: 'INVITED',
                    },
                });
            }
            patientProfile = await fastify.prisma.patientProfile.create({
                data: {
                    userId: portalUser ? portalUser.id : (0, crypto_1.randomUUID)(),
                    corePatientId,
                    firstName: patient.firstName,
                    lastName: patient.lastName,
                    dateOfBirth,
                    phone: patient.phone,
                },
            });
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
        });
        const consultation = await fastify.prisma.consultationCase.create({
            data: {
                referralId: createdReferral.id,
                patientProfileId: patientProfile.id,
                status: 'pending',
                title: referral?.reason ?? `Referral ${createdReferral.id}`,
            },
        });
        reply.code(201).send({
            referral: createdReferral,
            consultation,
        });
    });
    fastify.post('/integrations/consultant-invites', async (request, reply) => {
        const headerToken = request.headers['x-service-token'];
        if (!verifyServiceToken(headerToken)) {
            reply.code(401).send({ error: 'Invalid service token' });
            return;
        }
        const body = request.body;
        if (!body.email) {
            reply.code(400).send({ error: 'email is required' });
            return;
        }
        const email = body.email.toLowerCase().trim();
        const inviteToken = (0, crypto_1.randomUUID)();
        const expiresInHours = body.expiresInHours && body.expiresInHours > 0 ? body.expiresInHours : 72;
        const inviteExpiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
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
        });
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
        });
        const frontendUrl = process.env.PATIENT_PORTAL_FRONTEND_URL || 'http://localhost:3002';
        const inviteLink = `${frontendUrl}/activate-invite?token=${inviteToken}`;
        if (fastify.emailService) {
            await fastify.emailService
                .sendConsultantInvite(user.email, inviteLink, body.firstName || body.lastName ? `${body.firstName || ''} ${body.lastName || ''}`.trim() : undefined)
                .catch((err) => {
                fastify.log.warn({ error: err, email: user.email }, 'Failed to send consultant invite email');
            });
        }
        else {
            fastify.log.info({ email: user.email, inviteToken }, 'Consultant invite created but email service not configured');
        }
        reply.code(201).send({
            userId: user.id,
            consultantId: consultant.id,
            inviteToken,
            inviteExpiresAt,
        });
    });
};
exports.default = integrationsService;
//# sourceMappingURL=integrations.js.map