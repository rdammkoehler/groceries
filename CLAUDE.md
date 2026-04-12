# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Grocery list web application built with Next.js (App Router) and PostgreSQL. Users add grocery items with quantities, then use a Shopping View to check them off during shopping trips. Targeted for Vercel deployment.

## Tech Stack

- **Frontend:** React 19, Next.js 16 (App Router), Tailwind CSS 4, TypeScript
- **Backend:** Next.js API Routes (Node.js)
- **Database:** PostgreSQL via Prisma 7 ORM
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

- `src/app/page.tsx` — Add Items view (client component that manages grocery list CRUD)
- `src/app/shopping/page.tsx` — Shopping View (client component with purchase checkboxes)
- `src/app/api/grocery-items/route.ts` — GET (list all) and POST (create) endpoints
- `src/app/api/grocery-items/[id]/route.ts` — PATCH (toggle purchase) and DELETE endpoints
- `src/components/` — Reusable client components: `AddItemForm`, `GroceryList`, `ShoppingList`, `Navigation`
- `src/lib/prisma.ts` — Singleton PrismaClient instance (prevents hot-reload connection exhaustion)
- `src/types/grocery.ts` — Shared `GroceryItem` TypeScript interface
- `prisma/schema.prisma` — Database schema; single `GroceryItem` model mapped to `grocery_items` table

## Prisma 7 Notes

- Database URL is configured in `prisma.config.ts`, NOT in `schema.prisma` (Prisma 7 breaking change)
- The `datasourceUrl` is passed to the `PrismaClient` constructor in `src/lib/prisma.ts`
- Generated client output is in `src/generated/prisma/` (gitignored, regenerate with `npx prisma generate`)

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (set in `.env`, not committed)
