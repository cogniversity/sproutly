# Sproutly

A modern product management platform built with Next.js (React, TypeScript, Tailwind CSS).

## Cursor Cloud specific instructions

### Services

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| Next.js dev server | `npm run dev` | 3000 | Serves both frontend and API routes |

### Common commands

- **Install deps:** `npm install`
- **Dev server:** `npm run dev` (starts on http://localhost:3000)
- **Lint:** `npm run lint` (ESLint with Next.js + TypeScript config)
- **Build:** `npm run build`
- **Start prod:** `npm start` (requires build first)

### Caveats

- The project uses Next.js 16 with Turbopack for development (enabled by default).
- ESLint config is in `eslint.config.mjs` (flat config format, not `.eslintrc`).
- Path alias `@/*` maps to `./src/*` (configured in `tsconfig.json`).
- No database or external services are required for basic frontend development.
