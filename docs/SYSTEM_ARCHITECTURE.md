# Sproutly — System architecture

**Source:** [`ENGINEERING_DECOMPOSITION.md`](./ENGINEERING_DECOMPOSITION.md)  
**Skill:** [`skills/decomposition-to-system-architecture.md`](../skills/decomposition-to-system-architecture.md)  
**Stack mandate:** Next.js 16 App Router (repo) + Prisma + SQL database (`DATABASE_URL`).

---

## 1. System overview

- **Actors:** Workspace members (Admin / Editor / Viewer) use the web app; admins configure AI keys (later).
- **Outcomes:** Manage Plots and Sprouts inside a workspace; authenticate with DB-backed users; future Initiatives/Harvests/status digests.

**Subsystems**

| Subsystem | Responsibility |
|-----------|----------------|
| **Next.js UI** | Server Components + minimal Client Components; forms; `/app` authenticated shell |
| **Route Handlers** | `/api/*` REST JSON; auth, CRUD |
| **Prisma + DB** | Persistence, relations, migrations |
| **Session store** | `sessions` table; opaque token in httpOnly cookie |

**Boundaries:** CI/CD and hosting details out of scope here.

**Coverage**

| Feature (decomposition) | Primary subsystem |
|-------------------------|-------------------|
| F1 Identity | API + DB + UI auth |
| F2 Workspace | DB + API |
| F3 Plots/Sprouts | DB + API + UI |
| F4–F9 | Deferred modules same pattern |

---

## 2. Frontend architecture

- **Framework:** Next.js App Router, React 19, TypeScript, Tailwind 4.
- **Routing**

| Route | Feature | Notes |
|-------|---------|-------|
| `/` | Marketing | Public |
| `/login`, `/register` | F1 | Public |
| `/app` | Dashboard | Auth required |
| `/app/plots` | F3 | List/create plots |
| `/app/plots/[plotId]` | F3 | Sprouts for plot |

- **State:** Server-first; `fetch` to same-origin `/api` from server components; revalidatePath after mutations (or client fetch + router.refresh).
- **Auth in UI:** RSC `getSession()` in `(app)/app/layout.tsx`; redirect to `/login` if absent.

---

## 3. Backend architecture

- **Style:** Monolith — route handlers in `src/app/api/**/route.ts`.
- **Layers:** Handler → zod validate → **service** functions in `src/lib/services/*` → Prisma.
- **AuthN:** Register/login creates `Session` row; cookie `sproutly_session` = raw token (store only hash in DB) or store token id — **MVP: store token in DB as unique string, cookie holds same string** (simpler; HTTPS only in prod).
- **AuthZ:** `requireUser`, `requireEditor(workspaceId)`, `requireAdmin(workspaceId)` in `src/lib/authz.ts`.

**Request path:** `route.ts` → parse JSON → zod → authz → service → Prisma → JSON response.

---

## 4. API design

**Versioning:** Unversioned `/api/*` for MVP (same origin).

| Path | Method | Purpose | Feature |
|------|--------|---------|---------|
| `/api/auth/register` | POST | Create user, workspace, membership, session | F1 |
| `/api/auth/login` | POST | Create session | F1 |
| `/api/auth/logout` | POST | Delete session | F1 |
| `/api/auth/me` | GET | Current user + workspaces | F1 |
| `/api/workspaces/[workspaceId]/plots` | GET, POST | List / create plots | F3 |
| `/api/plots/[plotId]` | GET, PATCH, DELETE | Plot CRUD | F3 |
| `/api/plots/[plotId]/sprouts` | GET, POST | List / create sprouts | F3 |
| `/api/sprouts/[sproutId]` | GET, PATCH, DELETE | Sprout CRUD | F3 |

**Contract (register POST):** `{ "email": string, "password": string, "name": string }`  
**Response 201:** `{ "user": { id, email, name }, "workspace": { id, name, slug } }` + `Set-Cookie`.

**Contract (login POST):** `{ "email": string, "password": string }`  
**Response 200:** user + workspace summary + cookie.

**Contract (me GET):** `{ "user": {...}, "workspaces": [{ id, name, slug, role }] }`

**Plot POST:** `{ "name": string, "description"?: string }`  
**Sprout POST:** `{ "title": string, "description"?: string, "status"?: enum, "timelineLabel"?: string, "targetCompletionAt"?: string }` plus `POST .../ai/enrich` for AI-filled drafts.

**Errors:** JSON `{ "error": string }`; 400 validation, 401 unauthenticated, 403 forbidden, 404 not found.

---

## 5. Data flow (login)

1. User submits email/password → POST `/api/auth/login`.  
2. Handler finds `User` by email, verifies bcrypt password.  
3. Creates `Session` (token, expiry, userId).  
4. Sets httpOnly cookie; returns user JSON.  
5. Subsequent GET `/app/plots`: layout calls `getSession()` → read cookie → load Session + User → render.

**Failures:** 401 invalid credentials; 500 logged server-side without leaking stack to client.

---

## 6. Integrations

**None** for MVP slice. F7 will add OpenAI/Anthropic/Google HTTP clients server-side only.

---

## 7. Non-functional (MVP)

| Area | Stance |
|------|--------|
| Performance | Index FKs (`workspaceId`, `plotId`, `userId`); paginate lists later |
| Security | bcrypt cost ≥ 10; httpOnly cookie; `SameSite=Lax`; CSRF: same-site POST only for MVP |
| Reliability | Prisma errors → 500 + log correlation id (optional) |

---

## 8. Tech stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 16, React 19, Tailwind 4 |
| Backend | Next.js Route Handlers |
| ORM / DB | Prisma; SQLite file dev; Postgres prod |

---

## 9. Key decisions

- **Monolith** until deploy pain — BRD allows phased services later.  
- **REST** over GraphQL — simpler for small team.  
- **Workspace-scoped URLs** — `/api/workspaces/:id/plots` for create/list; plot by id for detail to avoid leaking IDs.  
- **Tenancy:** `workspace_id` on Plots; membership gates access.

---

## 10. Evolution

- Add read replicas / caching when SLO misses.  
- Extract worker for emails/AI when load requires.  
- Version public API (`/api/v1`) if mobile/third parties appear.
