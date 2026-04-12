# Change Log

## 0.3.0 - 2026-04-12

### Fixed
- API key comparison now uses constant-time `crypto.timingSafeEqual` to prevent timing attacks
- Rate limiter extracts rightmost `X-Forwarded-For` IP (proxy-appended) instead of leftmost (client-spoofable)
- API routes return 400 for malformed JSON bodies instead of crashing with 500
- PATCH and DELETE routes validate UUID format on `id` parameter, returning 400 for invalid IDs
- Deduplicated `RATE_LIMIT` / `MAX_REQUESTS` constant between middleware and rate-limit module
- Removed `.write-test` debugging artifact from repository

### Added
- Pagination on `GET /api/grocery-items` with `limit` (max 100) and `offset` query parameters
- Reverse proxy configuration requirements documented in DEPLOY.md
- Unit tests for auth, rate-limit, and middleware modules (15 new tests, 29 total)

## 0.2.0 - 2026-04-12

### Added
- Docker deployment support with multi-stage Dockerfile
- X-Api-Key authentication on all `/api/grocery-items` routes
- IP-based rate limiting (60 requests/minute sliding window)
- HTTP security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy)
- Health check endpoint at `/api/health`
- P2025 not-found error handling on PATCH and DELETE routes
- Input validation: 255-char max on item name, boolean check on `purchased` field
- `@hono/node-server` override to address GHSA-92pp-h63x-v22m
- DEPLOY.md with environment variable documentation

## 0.1.0 - 2026-04-12

### Added
- Initial project setup with Next.js 16, TypeScript, Tailwind CSS 4, and Prisma 7
- GroceryItem database model with name, quantity, date_entered, and last_purchase_date fields
- REST API routes for creating, listing, deleting, and toggling purchase status of grocery items
- Add Items view for entering grocery items one at a time with name and quantity
- Shopping View with checkboxes to mark items as purchased (stores last_purchase_date timestamp)
- Navigation bar to switch between Grocery List and Shopping View
- Unit tests for AddItemForm, GroceryList, and ShoppingList components (14 tests)
