# Sproutly

A modern product management platform built with Next.js (React, TypeScript, Tailwind CSS).

## Cursor Cloud specific instructions

### Services

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| Next.js dev server | `npm run dev` | 3000 | Serves both frontend and API routes |

### Common commands

- **Install deps:** `npm install`
- **Database:** Copy `.env.example` → `.env`; default is SQLite at `prisma/dev.db`. Apply migrations: `npx prisma migrate dev` (or `npm run db:migrate`).
- **Dev server:** `npm run dev` (starts on http://localhost:3000)
- **Lint:** `npm run lint` (ESLint with Next.js + TypeScript config)
- **Build:** `npm run build` (runs `prisma generate` then `next build`)
- **Start prod:** `npm start` (requires build first)
- **DB GUI:** `npm run db:studio`

### Caveats

- The project uses Next.js 16 with Turbopack for development (enabled by default).
- ESLint config is in `eslint.config.mjs` (flat config format, not `.eslintrc`).
- Path alias `@/*` maps to `./src/*` (configured in `tsconfig.json`).
- **Auth, Plots, and Sprouts** require a database (SQLite locally). Marketing `/` and static pages do not hit the DB until you sign in.
- Engineering pipeline docs: `docs/ENGINEERING_DECOMPOSITION.md`, `docs/SYSTEM_ARCHITECTURE.md`, `docs/EXECUTION_PLAN.md`.
