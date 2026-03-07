"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const authPlugin = async (fastify) => {
    const secret = process.env.PATIENT_PORTAL_JWT_SECRET || process.env.JWT_SECRET || 'change-me-in-prod';
    await fastify.register(jwt_1.default, {
        secret,
        sign: {
            expiresIn: '15m',
        },
    });
    fastify.decorate('authenticate', async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch (err) {
            reply.code(401).send({ error: 'Unauthorized' });
        }
    });
};
exports.default = (0, fastify_plugin_1.default)(authPlugin, {
    name: 'patient-portal-auth',
});
//# sourceMappingURL=auth.js.map