# Sproutly — Execution plan

**Plan mode:** MVP (first vertical slice)  
**Assumed team size:** 1–2  
**Skills:** [`architecture-to-execution-plan.md`](../skills/architecture-to-execution-plan.md), [`structured-task-to-production-code.md`](../skills/structured-task-to-production-code.md)

**Inputs:** [`ENGINEERING_DECOMPOSITION.md`](./ENGINEERING_DECOMPOSITION.md), [`SYSTEM_ARCHITECTURE.md`](./SYSTEM_ARCHITECTURE.md), [`RELATIONAL_SCHEMA.md`](./RELATIONAL_SCHEMA.md)

---

## Phase 1 — Foundation

**Goal:** DB + Prisma + env documented; app builds.

| Title | Description | Type | Dependencies | Output |
|-------|-------------|------|--------------|--------|
| Add Prisma + dependencies | `prisma`, `@prisma/client`, `bcryptjs`, `zod`; `.env.example` with `DATABASE_URL` | setup | none | `package.json`, `prisma/schema.prisma` |
| Initial migration | Users, Sessions, Workspaces, Memberships, Plots, Sprouts | database | Prisma init | `prisma/migrations/*` |
| Prisma client singleton | `src/lib/prisma.ts` | backend | migration | importable client |

---

## Phase 2 — Auth API

**Goal:** Register/login/logout/me working via cookie.

| Title | Description | Type | Dependencies | Output |
|-------|-------------|------|--------------|--------|
| Auth helpers | hash/verify password; create session; parse cookie | backend | Phase 1 | `src/lib/auth.ts` |
| Auth route handlers | register/login/logout/me per API table | backend | Auth helpers | `src/app/api/auth/*/route.ts` |
| Authz helpers | `requireUser`, `requireEditor(workspaceId)` | backend | Auth helpers | `src/lib/authz.ts` |

---

## Phase 3 — Domain API + UI shell

**Goal:** Authenticated user can CRUD Plots and Sprouts in browser.

| Title | Description | Type | Dependencies | Output |
|-------|-------------|------|--------------|--------|
| Plot + Sprout services | Validation + Prisma calls | backend | Phase 2 | `src/lib/services/*` |
| Plot + Sprout route handlers | Per SYSTEM_ARCHITECTURE API | backend | Services | `src/app/api/**` |
| App layout + nav | Sproutly branding; sign out | frontend | Phase 2 | `src/app/(app)/app/layout.tsx` |
| Plots pages | List/create; detail with sprouts | frontend | APIs | `src/app/(app)/app/plots/**` |
| Home redirect | `/` → `/app` or marketing | frontend | — | `src/app/page.tsx` |

---

## Phase 4 — Hardening (quick)

| Title | Description | Type | Dependencies | Output |
|-------|-------------|------|--------------|--------|
| ESLint clean | Fix any new issues | setup | Phase 3 | `npm run lint` |
| Build verify | `npm run build` | setup | Phase 3 | green build |

---

## Recommended build order

1. Add Prisma + dependencies **CP**  
2. Initial migration **CP**  
3. Prisma client singleton  
4. Auth helpers  
5. Auth route handlers **CP**  
6. Authz helpers  
7. Plot + Sprout services  
8. Plot + Sprout route handlers **CP**  
9. App layout + nav  
10. Plots pages **CP**  
11. Home redirect  
12. Lint + build  

**Parallelizable after 6:** Services (7) can be drafted in parallel with layout (9) if API contracts frozen.

---

## Folder structure (target)

```
prisma/
  schema.prisma
  migrations/
src/
  app/
    (auth)/login/page.tsx
    (auth)/register/page.tsx
    (app)/app/
      layout.tsx
      page.tsx
      plots/page.tsx
      plots/[plotId]/page.tsx
    api/auth/...
    api/workspaces/[workspaceId]/plots/route.ts
    api/plots/[plotId]/route.ts
    api/plots/[plotId]/sprouts/route.ts
    api/sprouts/[sproutId]/route.ts
  lib/
    prisma.ts
    auth.ts
    authz.ts
    services/plots.ts
    services/sprouts.ts
```

---

## Deferred (post-MVP)

- Initiatives, Harvests, leadership status, email templates, AI, integrations — per decomposition F4–F9.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-20 | Initial plan for MVP slice |
| 2026-03-20 | **Phases 1–3 implemented** in repo: Prisma+SQLite, auth API + cookie sessions, Plots/Sprouts API, `/app` UI (`/login`, `/register`, `/app/plots`, `/app/plots/[plotId]`) |
