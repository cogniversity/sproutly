# Sproutly — Engineering decomposition (BRD → Features → Epics → Tasks)

**Source:** [`BUSINESS_REQUIREMENTS_DOCUMENT.md`](./BUSINESS_REQUIREMENTS_DOCUMENT.md) v4  
**Decomposition mode:** Hybrid — **MVP vertical slice first** (auth + workspace + Plots + Sprouts + minimal UI), then phased delivery of Initiatives, Harvests, leadership views, AI, email.  
**Assumed team size:** TBD (1–3)  
**Skill:** [`skills/brd-engineering-decomposition.md`](../skills/brd-engineering-decomposition.md)

---

## Feature F1 — Identity, sessions & RBAC

**Description:** Custom DB users, password auth, roles (Admin / Editor / Viewer), session handling. FR-013.  
**Business value:** Unblocks every other capability; enforces admin-only AI settings later.

### Epic F1.E1 — Auth core

| Title | Description | Type | Priority | Effort | Dependencies |
|-------|-------------|------|----------|--------|----------------|
| Add Prisma + baseline schema for `users`, `sessions`, `workspaces`, `memberships` | SQLite dev / Postgres prod compatible `schema.prisma`; migrations committed; `src/lib/prisma.ts` singleton | database | high | M | none |
| Password hashing + validation helpers | bcryptjs; zod schemas for register/login; no plaintext passwords logged | backend | high | S | Prisma schema |
| POST `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, GET `/api/auth/me` | Create user + default workspace + ADMIN membership on register; opaque session token in httpOnly cookie; JSON errors | backend | high | M | Password helpers |
| Server-side session resolution | `getSession()` reads cookie, loads user + memberships; use in RSC layouts and API handlers | backend | high | S | Login route |
| Login and register UI | `app/(auth)/login`, `register`; forms POST to API or server actions; Tailwind | frontend | high | M | Auth API |

### Epic F1.E2 — Authorization middleware pattern

| Title | Description | Type | Priority | Effort | Dependencies |
|-------|-------------|------|----------|--------|----------------|
| Require role for mutating routes | Helpers `requireEditor`, `requireAdmin`; 403 on violation; FR-013 | backend | high | S | Session resolution |
| Protect `/app/*` routes | Layout or middleware: unauthenticated → `/login` | frontend | high | S | Session resolution |

---

## Feature F2 — Workspace & tenancy

**Description:** FR-014 — workspace boundary; users see only authorized workspaces.  
**Business value:** Enterprise-ready data isolation.

### Epic F2.E1 — Workspace MVP

| Title | Description | Type | Priority | Effort | Dependencies |
|-------|-------------|------|----------|--------|----------------|
| Default workspace on register | Single workspace “My workspace” + membership; slug unique per env | backend | high | S | F1 schema |
| GET workspace context API | Current workspace for session (MVP: first membership or query param later) | backend | medium | S | F1 |

---

## Feature F3 — Plots & Sprouts (core domain)

**Description:** FR-001, FR-002 — Sprout lifecycle; primary Plot per Sprout.  
**Business value:** Core product metaphor.

### Epic F3.E1 — Plot CRUD

| Title | Description | Type | Priority | Effort | Dependencies |
|-------|-------------|------|----------|--------|----------------|
| `plots` table + API GET/POST `/api/workspaces/[wsId]/plots` | List/create Plots scoped to workspace; Editor+ | backend | high | M | Workspace |
| GET/PATCH/DELETE `/api/plots/[plotId]` | Verify workspace membership; soft delete optional | backend | high | M | Plot list API |
| Plots list + create UI | `/app/plots` | frontend | high | M | Plot API |

### Epic F3.E2 — Sprout CRUD

| Title | Description | Type | Priority | Effort | Dependencies |
|-------|-------------|------|----------|--------|----------------|
| `sprouts` table + lifecycle/horizon enums | Maps to FR-005/FR-006/FR-007 minimal set | database | high | M | Plots |
| Sprout API scoped by Plot | GET/POST per plot; GET/PATCH/DELETE by id; Editor+ | backend | high | M | Sprouts table |
| Sprout list/detail UI | Under plot route `/app/plots/[plotId]` | frontend | high | M | Sprout API |

---

## Feature F4 — Initiatives (cross-Plot)

**Description:** FR-003.  
**Business value:** Customer visits, infra programs.

### Epic F4.E1 — Initiative model & UI

| Title | Description | Type | Priority | Effort | Dependencies |
|-------|-------------|------|----------|--------|----------------|
| `initiatives`, junction `initiative_plots`, `initiative_sprouts` | M2M per BRD | database | medium | L | F3 |
| Initiative CRUD + link APIs | Admin/Editor | backend | medium | L | Junction tables |
| Initiative screens | Create, link plots, link sprouts | frontend | medium | L | APIs |

---

## Feature F5 — Harvests & release scope

**Description:** FR-008.  
**Business value:** Release tracking.

### Epic F5.E1 — Harvest entities

| Title | Description | Type | Priority | Effort | Dependencies |
|-------|-------------|------|----------|--------|----------------|
| `harvests`, `harvest_sprouts` | Target/shipped dates; scoped sprouts | database | medium | M | F3 |
| Harvest API + minimal UI | | backend / frontend | medium | L | Schema |

---

## Feature F6 — Leadership status & digest

**Description:** FR-018, FR-019, FR-017.  
**Business value:** Executive clarity.

### Epic F6.E1 — Status aggregation

| Title | Description | Type | Priority | Effort | Dependencies |
|-------|-------------|------|----------|--------|----------------|
| Shared query: in progress / recent done / on hold / stuck | Single source for UI + email preview; “stuck” rule per OQ-6 | backend | medium | L | F3 enums + optional `blockedAt` |
| Leadership status page | `/app/status` Viewer+ | frontend | medium | M | Aggregation |
| Email template + digest preview | FR-017/019; no SMTP | frontend / backend | low | L | Aggregation |

---

## Feature F7 — AI assist (admin-configured)

**Description:** FR-011, FR-012.  
**Business value:** Task breakdown.

### Epic F7.E1 — Admin AI settings + elaboration API

| Title | Description | Type | Priority | Effort | Dependencies |
|-------|-------------|------|----------|--------|----------------|
| `workspace_ai_settings` table | provider enum, encrypted key ref; admin-only API | database / backend | medium | L | F1 admin |
| Elaborate endpoint | Server calls LLM with server-stored key; generic errors to editors | backend | medium | L | AI settings |

---

## Feature F8 — Email infrastructure

**Description:** FR-017 extended.  
**Business value:** Future SMTP; previews first.

### Epic F8.E1 — Templates

| Title | Description | Type | Priority | Effort | Dependencies |
|-------|-------------|------|----------|--------|----------------|
| `email_templates` + preview API | Store body/subject; merge fields | backend | low | M | F1 |

---

## Feature F9 — Integrations

**Description:** FR-015 phased.  
**Deferred** after core domain stable.

---

## Critical path (MVP)

1. Add Prisma + baseline schema for `users`, `sessions`, `workspaces`, `memberships`
2. Password hashing + validation helpers
3. POST `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, GET `/api/auth/me`
4. Server-side session resolution
5. `plots` table + Plot APIs
6. `sprouts` table + Sprout APIs
7. Login/register UI + protect `/app/*` + Plots/Sprouts UI

---

## Parallel tracks

**After** session resolution lands:

- **Track A:** Plot API + Plots UI  
- **Track B:** Sprout schema migration + API (depends on plots existing)

**After** F3 stable:

- Initiative schema (F4) ∥ Harvest schema (F5) with separate migrations

---

## Open engineering questions

- **OQ-6 (BRD):** Default “stuck” = explicit `blocked` flag only for MVP?  
- **Postgres vs SQLite:** Prod target Postgres — use `DATABASE_URL` switch; document in AGENTS.  
- **Session strategy:** Opaque DB token vs JWT — MVP uses opaque token + `sessions` table.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-20 | Initial decomposition from BRD v4 |
