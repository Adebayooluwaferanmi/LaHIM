"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messagingService = async (fastify) => {
    const ensureAccessToCase = async (userId, role, caseId) => {
        const consultation = await fastify.prisma.consultationCase.findUnique({
            where: { id: caseId },
            include: {
                patientProfile: true,
                consultant: true,
            },
        });
        if (!consultation) {
            return { allowed: false, reason: 'not-found' };
        }
        if (role === 'PATIENT') {
            const patient = await fastify.prisma.patientProfile.findFirst({
                where: { id: consultation.patientProfileId, userId },
            });
            if (!patient) {
                return { allowed: false, reason: 'forbidden' };
            }
        }
        if (role === 'EXTERNAL_CONSULTANT') {
            const consultant = await fastify.prisma.externalConsultant.findFirst({
                where: { id: consultation.consultantId ?? '', userId },
            });
            if (!consultant) {
                return { allowed: false, reason: 'forbidden' };
            }
        }
        return { allowed: true, consultation };
    };
    fastify.get('/consultations/:id/messages', {
        preHandler: fastify.authenticate.bind(fastify),
    }, async (request, reply) => {
        const currentUser = request.user;
        const { id } = request.params;
        const access = await ensureAccessToCase(currentUser.sub, currentUser.role, id);
        if (!access.allowed) {
            if (access.reason === 'not-found') {
                reply.code(404).send({ error: 'Consultation not found' });
            }
            else {
                reply.code(403).send({ error: 'Access denied' });
            }
            return;
        }
        const thread = await fastify.prisma.messageThread.findFirst({
            where: { caseId: id },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!thread) {
            reply.send({ items: [] });
            return;
        }
        reply.send({
            threadId: thread.id,
            items: thread.messages,
        });
    });
    fastify.post('/consultations/:id/messages', {
        preHandler: fastify.authenticate.bind(fastify),
    }, async (request, reply) => {
        const currentUser = request.user;
        const { id } = request.params;
        const body = request.body;
        if (!body.body || body.body.trim().length === 0) {
            reply.code(400).send({ error: 'Message body is required' });
            return;
        }
        const access = await ensureAccessToCase(currentUser.sub, currentUser.role, id);
        if (!access.allowed) {
            if (access.reason === 'not-found') {
                reply.code(404).send({ error: 'Consultation not found' });
            }
            else {
                reply.code(403).send({ error: 'Access denied' });
            }
            return;
        }
        const thread = await fastify.prisma.messageThread.upsert({
            where: {
                caseId: id,
            },
            update: {},
            create: {
                caseId: id,
                subject: `Consultation ${id}`,
            },
        });
        const message = await fastify.prisma.message.create({
            data: {
                threadId: thread.id,
                senderUserId: currentUser.sub,
                body: body.body,
            },
        });
        reply.code(201).send(message);
    });
};
exports.default = messagingService;
//# sourceMappingURL=messaging.js.map