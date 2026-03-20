# Sproutly

A modern product management platform built with Next.js (React, TypeScript, Tailwind CSS).

## Cursor Cloud specific instructions

### Services

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| Next.js dev server | `npm run dev` | 3000 | Serves both frontend and API routes |

### Common commands

- **Install deps:** `npm install`
- **Database:** Set `DATABASE_URL` to your **PostgreSQL 17+** connection string (e.g. Neon). In Cursor Cloud, `PG_CONNECTION_STRING` may be injected — use `DATABASE_URL="${PG_CONNECTION_STRING}"` in `.env` if needed. Apply migrations: `DATABASE_URL=... npx prisma migrate deploy` (CI/prod) or `npx prisma migrate dev` (local).
- **Prisma P3006 / shadow DB / `targetCompletionAt`:** A migration folder named like `20260320225325_v0_2` with a timestamp **between** `postgres_full_domain` and `timeline_targets` will run **before** `targetCompletionAt` exists and fail. Remove that folder from `prisma/migrations/` if present, and delete the matching row from `_prisma_migrations` on the database if it was applied. The repo adds `Sprout_targetCompletionAt_idx` in migration `20260322140000_sprout_target_completion_at_idx` (after timeline).
- **Dev server:** `npm run dev` (starts on http://localhost:3000)
- **Lint:** `npm run lint` (ESLint with Next.js + TypeScript config)
- **Build:** `npm run build` (runs `prisma generate` then `next build`)
- **Start prod:** `npm start` (requires build first)
- **DB GUI:** `npm run db:studio`

### Caveats

- The project uses Next.js 16 with Turbopack for development (enabled by default).
- ESLint config is in `eslint.config.mjs` (flat config format, not `.eslintrc`).
- Path alias `@/*` maps to `./src/*` (configured in `tsconfig.json`).
- **Auth, Plots, and Sprouts** require PostgreSQL. Marketing `/` and static pages do not hit the DB until you sign in.
- Engineering pipeline docs: `docs/ENGINEERING_DECOMPOSITION.md`, `docs/SYSTEM_ARCHITECTURE.md`, `docs/EXECUTION_PLAN.md`.
