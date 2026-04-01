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

There are now two supported local paths, depending on what you need:

- Container parity and smoke checks: use [BOOT_FIRST_RUNBOOK.md](/mnt/e/Alixa/LaHIM/BOOT_FIRST_RUNBOOK.md)
- Easy host-side debugging: keep only infra in Docker, then run the app processes directly from the workspace

### Recommended Debug Workflow

Use this path when you want faster iteration, Node inspector support, and Vite hot reload without rebuilding app images:

```bash
./scripts/check-debug-host.sh
npm install
cp .env.docker.example .env.docker
cp .env.debug.example .env.debug
npm run debug:infra
```

Start the API in one terminal:

```bash
npm run debug:server
```

Start the staff frontend in a second terminal:

```bash
npm run debug:frontend
```

Optional when working on the shared React component package in parallel:

```bash
npm run debug:components
```

Useful endpoints for the debug flow:

- Core API: `http://localhost:3000/health`
- Staff frontend: `http://localhost:3001`
- CouchDB: `http://localhost:5984/_utils`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

The server debug script already runs Node with `--inspect`, so you can attach your IDE debugger directly.
Install Node/NPM inside Linux or WSL for this flow. A Windows Node install exposed through `/mnt/c/Program Files/nodejs` is not reliable here and already fails in this shell.

### Container Baseline

The strict boot-first container flow remains the right path for container parity checks of:

- `postgres`
- `redis`
- `couchdb`
- `lahim-server`
- `staff-frontend`

Portal services, observability services, and non-startup cleanup are intentionally out of scope until the core baseline is stable.

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
