# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-user grocery list web application built with Next.js (App Router) and PostgreSQL. Users sign in via Google OAuth, manage their own grocery list, and can invite other users to share it. Shared users can check off items from the Shopping View. Targeted for Vercel deployment.

## Tech Stack

- **Frontend:** React 19, Next.js 16 (App Router), Tailwind CSS 4, TypeScript
- **Backend:** Next.js API Routes (Node.js)
- **Auth:** Auth.js v5 (NextAuth) with Google OpenID Connect provider
- **Database:** PostgreSQL via Prisma 7 ORM with row-level security (RLS)
- **Testing:** Jest 30, React Testing Library

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma migrate dev --name <name>  # Create and apply a migration
```

## Architecture

### Pages
- `src/app/page.tsx` — Add Items view (owner's grocery list CRUD)
- `src/app/shopping/page.tsx` — Shopping View with list selector (own + shared lists)
- `src/app/share/page.tsx` — Share management (invite by email, remove shares)
- `src/app/auth/signin/page.tsx` — Google OAuth sign-in page

### API Routes
- `src/app/api/grocery-items/route.ts` — GET (list items, filterable by listId) and POST (create item on own list)
- `src/app/api/grocery-items/[id]/route.ts` — PATCH (toggle purchase, owners + shared users) and DELETE (owners only)
- `src/app/api/lists/route.ts` — GET own list and shared lists with items
- `src/app/api/lists/[id]/shares/route.ts` — GET/POST shares (owner only)
- `src/app/api/lists/[id]/shares/[shareId]/route.ts` — DELETE share (owner only)
- `src/app/api/auth/[...nextauth]/route.ts` — Auth.js route handler

### Key Modules
- `src/lib/auth.ts` — Auth.js v5 config (Google provider, Prisma adapter, auto-creates GroceryList on signup)
- `src/lib/session.ts` — `requireSession()` helper for API route authentication
- `src/lib/rls.ts` — `withRLS()` helper that sets `app.current_user_id` for PostgreSQL RLS in each transaction
- `src/lib/prisma.ts` — Singleton PrismaClient with PrismaPg adapter
- `src/lib/rate-limit.ts` — In-memory sliding window rate limiter

### RBAC Model
- **List owner:** Can add/delete items, toggle purchase, invite/remove shared users
- **Shared user:** Can view items and toggle purchase status only
- PostgreSQL RLS enforces row-level isolation; application layer enforces column-level restrictions (shared users cannot modify name/quantity)

### Database Schema (Prisma)
- `User`, `Account`, `Session`, `VerificationToken` — Auth.js managed tables
- `GroceryList` — One per user (`ownerId` is `@unique`), auto-created on signup
- `GroceryItem` — Belongs to a GroceryList via `listId`
- `ListShare` — Join table granting a user read+toggle access to a list
- RLS policies are in `prisma/sql/rls_policies.sql` (applied separately after Prisma migrations)

## Prisma 7 Notes

- Database URL is configured in `prisma.config.ts`, NOT in `schema.prisma`
- PrismaClient requires a `PrismaPg` adapter from `@prisma/adapter-pg`
- Generated client output is in `src/generated/prisma/` (gitignored, regenerate with `npx prisma generate`)
- Import from `@/generated/prisma/client` (not `@/generated/prisma` — no index file in Prisma 7)

## Environment Variables

See `.env.example` for all required variables:
- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — Auth.js secret (generate with `npx auth secret`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth credentials
