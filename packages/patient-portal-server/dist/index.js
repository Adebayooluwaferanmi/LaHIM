"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("make-promises-safe");
const Fastify = require('fastify');
const patientPortalApp = require("./app");
const port = Number(process.env.PORTAL_PORT || process.env.PORT || 4001);
const host = process.env.PORTAL_HOST || process.env.IP || '0.0.0.0';
const fastify = Fastify(patientPortalApp.options || { logger: true });
fastify.register(patientPortalApp);
fastify.listen({ port, host }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info({ address }, 'Patient Portal API service listening');
});
//# sourceMappingURL=index.js.map