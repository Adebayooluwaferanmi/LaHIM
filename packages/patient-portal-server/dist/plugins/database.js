"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const databasePlugin = async (fastify) => {
    const prisma = new client_1.PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
    try {
        await prisma.$connect();
        fastify.log.info('Patient Portal PostgreSQL connection established via Prisma');
    }
    catch (error) {
        fastify.log.error({ error }, 'Failed to connect to Patient Portal PostgreSQL database');
        throw error;
    }
    fastify.decorate('prisma', prisma);
    fastify.addHook('onClose', async () => {
        try {
            await prisma.$disconnect();
            fastify.log.info('Patient Portal PostgreSQL connection closed');
        }
        catch (error) {
            fastify.log.warn({ error }, 'Error disconnecting Patient Portal PostgreSQL');
        }
    });
};
exports.default = (0, fastify_plugin_1.default)(databasePlugin, {
    name: 'patient-portal-database',
});
//# sourceMappingURL=database.js.map