"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = require("path");
const autoload_1 = __importDefault(require("@fastify/autoload"));
const helmet = require('@fastify/helmet');
const cors = require('@fastify/cors');
const multipart = require('@fastify/multipart');
function PatientPortalApp(fastify, opts, next) {
    const frontendUrl = process.env.PATIENT_PORTAL_FRONTEND_URL ||
        process.env.FRONTEND_URL ||
        'http://localhost:3002';
    const allowedOrigins = [
        frontendUrl,
        'http://localhost:3002',
        'http://127.0.0.1:3002',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
    ];
    fastify.register(cors, {
        origin: (origin, callback) => {
            if (!origin) {
                callback(null, true);
                return;
            }
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'), false);
            }
        },
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Service-Token'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });
    fastify.register(helmet);
    fastify.register(multipart, {
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    });
    fastify.register(autoload_1.default, {
        dir: (0, path_1.join)(__dirname, 'plugins'),
        options: { ...opts },
    });
    fastify.register(autoload_1.default, {
        dir: (0, path_1.join)(__dirname, 'services'),
        options: { ...opts },
    });
    next();
}
PatientPortalApp.options = {
    logger: true,
    ignoreTrailingSlash: true,
};
module.exports = PatientPortalApp;
//# sourceMappingURL=app.js.map