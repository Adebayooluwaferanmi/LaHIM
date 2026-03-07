"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const crypto_1 = require("crypto");
const documentsService = async (fastify) => {
    const ensureCaseAccess = async (userId, role, caseId) => {
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
    fastify.get('/consultations/:id/documents', {
        preHandler: fastify.authenticate.bind(fastify),
    }, async (request, reply) => {
        const currentUser = request.user;
        const { id } = request.params;
        const access = await ensureCaseAccess(currentUser.sub, currentUser.role, id);
        if (!access.allowed) {
            if (access.reason === 'not-found') {
                reply.code(404).send({ error: 'Consultation not found' });
            }
            else {
                reply.code(403).send({ error: 'Access denied' });
            }
            return;
        }
        const docs = await fastify.prisma.consultationDocument.findMany({
            where: { caseId: id },
            orderBy: { createdAt: 'desc' },
        });
        reply.send({ items: docs });
    });
    fastify.post('/consultations/:id/documents', {
        preHandler: fastify.authenticate.bind(fastify),
    }, async (request, reply) => {
        const currentUser = request.user;
        const { id } = request.params;
        const body = request.body;
        if (!body.type) {
            reply.code(400).send({ error: 'type is required' });
            return;
        }
        const access = await ensureCaseAccess(currentUser.sub, currentUser.role, id);
        if (!access.allowed) {
            if (access.reason === 'not-found') {
                reply.code(404).send({ error: 'Consultation not found' });
            }
            else {
                reply.code(403).send({ error: 'Access denied' });
            }
            return;
        }
        const created = await fastify.prisma.consultationDocument.create({
            data: {
                caseId: id,
                type: body.type,
                title: body.title,
                filename: body.filename,
                storageKey: body.storageKey,
                contentType: body.contentType,
                size: body.size ?? null,
                uploadedByUserId: currentUser.sub,
            },
        });
        reply.code(201).send(created);
    });
    fastify.get('/documents/:id/download', {
        preHandler: fastify.authenticate.bind(fastify),
    }, async (request, reply) => {
        const currentUser = request.user;
        const { id } = request.params;
        const doc = await fastify.prisma.consultationDocument.findUnique({
            where: { id },
            include: {
                consultationCase: true,
            },
        });
        if (!doc || !doc.consultationCase) {
            reply.code(404).send({ error: 'Document not found' });
            return;
        }
        const access = await ensureCaseAccess(currentUser.sub, currentUser.role, doc.consultationCase.id);
        if (!access.allowed) {
            if (access.reason === 'not-found') {
                reply.code(404).send({ error: 'Consultation not found' });
            }
            else {
                reply.code(403).send({ error: 'Access denied' });
            }
            return;
        }
        if (doc.storageKey) {
            const uploadsDir = (0, path_1.join)(process.cwd(), 'uploads', 'consultations');
            const filePath = (0, path_1.join)(uploadsDir, doc.storageKey);
            if ((0, fs_1.existsSync)(filePath)) {
                const fileBuffer = (0, fs_1.readFileSync)(filePath);
                reply
                    .header('Content-Type', doc.contentType || 'application/octet-stream')
                    .header('Content-Disposition', `attachment; filename="${doc.filename || 'document'}"`)
                    .send(fileBuffer);
                return;
            }
        }
        reply.send({
            id: doc.id,
            type: doc.type,
            title: doc.title,
            filename: doc.filename,
            storageKey: doc.storageKey,
            contentType: doc.contentType,
            size: doc.size,
        });
    });
    fastify.post('/consultations/:id/documents/upload', {
        preHandler: fastify.authenticate.bind(fastify),
    }, async (request, reply) => {
        const currentUser = request.user;
        const { id } = request.params;
        const access = await ensureCaseAccess(currentUser.sub, currentUser.role, id);
        if (!access.allowed) {
            if (access.reason === 'not-found') {
                reply.code(404).send({ error: 'Consultation not found' });
            }
            else {
                reply.code(403).send({ error: 'Access denied' });
            }
            return;
        }
        const data = await request.file();
        if (!data) {
            reply.code(400).send({ error: 'No file uploaded' });
            return;
        }
        const uploadsDir = (0, path_1.join)(process.cwd(), 'uploads', 'consultations');
        if (!(0, fs_1.existsSync)(uploadsDir)) {
            (0, fs_1.mkdirSync)(uploadsDir, { recursive: true });
        }
        const fileExtension = data.filename?.split('.').pop() || '';
        const storageKey = `${(0, crypto_1.randomBytes)(16).toString('hex')}.${fileExtension}`;
        const filePath = (0, path_1.join)(uploadsDir, storageKey);
        const buffer = await data.toBuffer();
        const writeStream = (0, fs_1.createWriteStream)(filePath);
        writeStream.write(buffer);
        writeStream.end();
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
        const created = await fastify.prisma.consultationDocument.create({
            data: {
                caseId: id,
                type: data.fieldname || 'document',
                title: data.filename,
                filename: data.filename,
                storageKey,
                contentType: data.mimetype || 'application/octet-stream',
                size: buffer.length || null,
                uploadedByUserId: currentUser.sub,
            },
        });
        reply.code(201).send(created);
    });
};
exports.default = documentsService;
//# sourceMappingURL=documents.js.map