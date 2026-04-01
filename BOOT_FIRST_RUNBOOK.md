# Boot-First Runbook

This runbook is the only supported local startup path for the current LaHIM boot phase.

Goal:

- boot `postgres`
- boot `redis`
- boot `couchdb`
- boot `lahim-server`
- boot `staff-frontend`

Out of scope for this phase:

- `patient-portal-server`
- `patient-portal-frontend`
- `prometheus`
- `grafana`
- any new feature or broad cleanup work

## Prerequisites

- Docker Desktop or another Docker engine available from your shell
- WSL/Linux shell access
- a copied env file:

```bash
cp .env.docker.example .env.docker
```

If your goal is fast day-to-day debugging, prefer the host-run workflow in [README.md](/mnt/e/Alixa/LaHIM/README.md). This runbook is for container baseline checks.

## Authoritative Boot Sequence

Run all commands from the repository root.

1. Build the backend image from the Linux-native workspace:

```bash
./scripts/docker-build-native.sh lahim-server
```

2. Start infrastructure and the backend:

```bash
./scripts/docker-up-native.sh postgres redis couchdb lahim-server
```

3. Verify backend readiness:

```bash
./scripts/verify-core-baseline.sh
```

4. Build the staff frontend:

```bash
./scripts/docker-build-native.sh staff-frontend
```

5. Start the staff frontend:

```bash
./scripts/docker-up-native.sh staff-frontend
```

6. Re-run verification:

```bash
./scripts/verify-core-baseline.sh
```

7. Run the automated staff frontend smoke test:

```bash
npm run --workspace=@lahim/frontend test:smoke
```

## Expected Endpoints

- Core API: `http://localhost:3000/health`
- Staff frontend: `http://localhost:3001`
- CouchDB: `http://localhost:5984`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## Manual Smoke Flow

After the checks pass and the automated smoke test is green:

1. Open `http://localhost:3001`
2. Confirm the UI loads without a startup error screen
3. Navigate to a core workflow page such as lab orders or specimens
4. Confirm the page can fetch API-backed data without crashing

## Troubleshooting

- BuildKit must stay enabled for the current Dockerfiles because they use `RUN --mount=type=cache`
- If Docker Hub metadata fetches time out while building `lahim-server` or `staff-frontend`, switch to the host-run debug workflow in [README.md](/mnt/e/Alixa/LaHIM/README.md) so only Postgres, Redis, and CouchDB need Docker pulls
- If `.env.docker` is missing, create it from `.env.docker.example`
- If the backend fails to start, inspect `/health` first and then container logs
- Do not start portal or observability services until the core baseline is stable
