# VibeDeploy Runtime Environment

## Required environment variables

| Variable       | Required        | Description                                                  |
|----------------|-----------------|--------------------------------------------------------------|
| `DATABASE_URL` | Yes (app only)  | PostgreSQL connection string, e.g. `postgresql://user:pass@host:5432/db` |
| `NODE_ENV`     | Yes             | Must be `production` for the production image                |
| `API_KEY`      | Yes             | Secret key for `X-Api-Key` header authentication on all `/api/grocery-items` routes |

## Optional environment variables

| Variable                  | Default | Description                             |
|---------------------------|---------|-----------------------------------------|
| `PORT`                    | `3000`  | Port the Next.js server listens on      |
| `HOSTNAME`                | `0.0.0.0` | Bind address inside the container      |
| `NEXT_TELEMETRY_DISABLED` | `1`     | Disables Next.js telemetry (set in image) |

## Notes

- `DATABASE_URL` is **not** required at image build time. It must be injected by the orchestrator (Docker Swarm secret / env var) at container startup.
- The `/api/health` endpoint (`GET /api/health`) returns `{"status":"ok"}` with HTTP 200 **without** requiring a database connection. This is the health-check path for the VibeDeploy health-check worker.
- Prisma 7 reads `DATABASE_URL` from `prisma.config.ts` at runtime via `process.env.DATABASE_URL`.
