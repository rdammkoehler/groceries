# VibeDeploy Runtime Environment

## Required environment variables

| Variable       | Required        | Description                                                  |
|----------------|-----------------|--------------------------------------------------------------|
| `DATABASE_URL`        | Yes (app only)  | PostgreSQL connection string, e.g. `postgresql://user:pass@host:5432/db` |
| `NODE_ENV`            | Yes             | Must be `production` for the production image                |
| `AUTH_SECRET`         | Yes             | Auth.js session secret (generate with `npx auth secret`)     |
| `GOOGLE_CLIENT_ID`    | Yes             | Google OAuth client ID from Google Cloud Console             |
| `GOOGLE_CLIENT_SECRET`| Yes             | Google OAuth client secret from Google Cloud Console         |

## Optional environment variables

| Variable                  | Default | Description                             |
|---------------------------|---------|-----------------------------------------|
| `PORT`                    | `3000`  | Port the Next.js server listens on      |
| `HOSTNAME`                | `0.0.0.0` | Bind address inside the container      |
| `NEXT_TELEMETRY_DISABLED` | `1`     | Disables Next.js telemetry (set in image) |

## Reverse proxy requirements

The application's rate limiter extracts client IPs from the **rightmost** entry in the `X-Forwarded-For` header (the value appended by the last trusted proxy). For this to work correctly:

- The reverse proxy (Traefik, Nginx, Vercel, etc.) **must append** the real client IP to `X-Forwarded-For` rather than passing through an untrusted client-supplied header.
- In Traefik, this is the default behaviour. In Nginx, use `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`.
- If there is no reverse proxy, the app falls back to `X-Real-Ip` and then `"unknown"`.
- Without a properly configured proxy, clients can spoof their IP to bypass rate limiting.

## Notes

- `DATABASE_URL` is **not** required at image build time. It must be injected by the orchestrator (Docker Swarm secret / env var) at container startup.
- The `/api/health` endpoint (`GET /api/health`) returns `{"status":"ok"}` with HTTP 200 **without** requiring a database connection. This is the health-check path for the VibeDeploy health-check worker.
- Prisma 7 reads `DATABASE_URL` from `prisma.config.ts` at runtime via `process.env.DATABASE_URL`.
