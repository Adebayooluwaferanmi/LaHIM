# LaHIM

Laboratory & Health Information Management System.

LaHIM is a laboratory-first healthcare platform built around structured diagnostics, operational workflow tracking, interoperability, analytics, and patient-facing access. The current codebase is organized as a multi-package workspace with a staff application, backend APIs, a patient portal, shared UI packages, and shared domain/schema packages.

## Core Packages

- `@lahim/server` - Main Fastify API for LIMS, operations, workflow, reporting, and integrations.
- `@lahim/frontend` - Staff-facing React application.
- `@lahim/patient-portal-server` - Patient and external consultation API service.
- `@lahim/patient-portal-frontend` - Patient portal React application.
- `@lahim/core` - Shared schemas, models, and CouchDB design-document references.
- `@lahim/components` - Primary React 18 component library for LaHIM.
- `@lahim/components-legacy` - Legacy compatibility component package retained for migration support.
- `@lahim/cli` - CLI tooling for design-document workflows and developer utilities.
- `@lahim/loinc` - LOINC lookup and search package.

## Architecture

The target platform is:

- React 18 + Vite on the frontend.
- Fastify + TypeScript on the backend.
- PostgreSQL + Prisma as the main production data model.
- Redis for cache and supporting infrastructure.
- Modern observability, eventing, and workflow services around the LIMS core.

Detailed architecture lives in [ARCHITECTURE_AND_DESIGN.md](/mnt/e/Alixa/LaHIM/ARCHITECTURE_AND_DESIGN.md).

## Local Development

1. Clone the repository and install dependencies.
2. Copy environment files for the packages you want to run.
3. Start supporting services such as CouchDB if you are working on legacy/offline paths.
4. Run the API and frontend packages you need.

Common commands:

```bash
yarn install
yarn dev:db
yarn dev:server
yarn dev:frontend
yarn dev:portal-server
yarn dev:portal-frontend
```

Seed example vocabulary data:

```bash
yarn workspace @lahim/server seed:vocabularies
```

## Publishable Packages

- `@lahim/core`
- `@lahim/components`
- `@lahim/components-legacy`
- `@lahim/cli`
- `@lahim/loinc`

Each package README contains package-specific usage and publishing details.

## Direction

LaHIM is being positioned as an independently owned platform with LaHIM-controlled repositories, package names, documentation, and deployment flows. Legacy compatibility layers may remain temporarily where they reduce migration risk, but the active direction is a fully LaHIM-branded and LaHIM-owned stack.

## License

Released under the [MIT License](LICENSE).
