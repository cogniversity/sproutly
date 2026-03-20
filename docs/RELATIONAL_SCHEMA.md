# Sproutly — Relational schema

**Skill:** [`skills/architecture-to-relational-schema.md`](../skills/architecture-to-relational-schema.md)  
**Implements:** [`SYSTEM_ARCHITECTURE.md`](./SYSTEM_ARCHITECTURE.md)

---

## Conventions

- **PK:** `cuid()` via Prisma (URL-safe; fine for MVP).  
- **Timestamps:** `createdAt`, `updatedAt` on mutable entities.  
- **DB engine:** **PostgreSQL** (17+ in cloud). Prisma `datasource` uses `DATABASE_URL`.  
- **Table names:** Prisma default quoted identifiers (`"User"`, etc.).

---

## Tables (MVP slice)

### `User`

| Column | Type | Notes |
|--------|------|-------|
| id | cuid PK | |
| email | string UNIQUE | |
| passwordHash | string | bcrypt |
| name | string | display |
| createdAt | datetime | |
| updatedAt | datetime | |

### `Session`

| Column | Type | Notes |
|--------|------|-------|
| id | cuid PK | |
| tokenHash | string UNIQUE | SHA-256 of opaque session cookie value |
| userId | FK → User | onDelete Cascade |
| expiresAt | datetime | |
| createdAt | datetime | |

### `Workspace`

| Column | Type | Notes |
|--------|------|-------|
| id | cuid PK | |
| name | string | |
| slug | string UNIQUE | |
| createdAt | datetime | |
| updatedAt | datetime | |

### `Membership`

| Column | Type | Notes |
|--------|------|-------|
| id | cuid PK | |
| userId | FK → User | |
| workspaceId | FK → Workspace | |
| role | enum ADMIN, EDITOR, VIEWER | |
| UNIQUE | (userId, workspaceId) | |

### `Plot`

| Column | Type | Notes |
|--------|------|-------|
| id | cuid PK | |
| workspaceId | FK → Workspace | |
| name | string | |
| description | string? | |
| timelineLabel | string? | e.g. Q3'27; horizon bucket derived in app |
| sortOrder | int default 0 | |
| createdAt | datetime | |
| updatedAt | datetime | |

**Index:** `(workspaceId)`

### `Sprout`

| Column | Type | Notes |
|--------|------|-------|
| id | cuid PK | |
| plotId | FK → Plot | onDelete Cascade |
| title | string | |
| description | string? | |
| status | enum | see below |
| timelineLabel | string? | e.g. Q1'28 |
| targetCompletionAt | datetime? | optional concrete target date |
| ownerUserId | FK → User? | nullable |
| createdAt | datetime | |
| updatedAt | datetime | |

**Status enum (MVP):** `BACKLOG`, `IN_PROGRESS`, `PAUSED`, `DEPRIORITIZED`, `BLOCKED`, `DONE`  
**Planning:** no fixed horizon enum; `timelineLabel` + `targetCompletionAt` drive a **derived** bucket (day/week/quarter/year) in the UI.

**Index:** `(plotId)`, `(ownerUserId)`, `(targetCompletionAt)`

---

### `Sprout` (additions)

| Column | Type | Notes |
|--------|------|-------|
| parentSproutId | FK → Sprout? | optional sub-sprouts from AI elaboration |

### `Initiative`, `InitiativePlot`, `InitiativeSprout`

Cross-plot programs; M2M to `Plot` and `Sprout`. Optional `driUserId` → `User`. Optional `timelineLabel`, `targetCompletionAt`, `startDate`, `endDate`.

### `Harvest`, `HarvestSprout`

Release container; M2M to `Sprout`.

### `WorkspaceAiSettings`

One row per workspace (`workspaceId` unique): `enabled`, `provider` (enum), `apiKey` (server-only).

### `EmailTemplate`

Per workspace: `kind` (INVITE | DIGEST | GENERIC), `subject`, `bodyHtml` (merge fields e.g. `{{workspaceName}}`, `{{digestHtml}}`).

---

## Prisma schema file

Implemented in `prisma/schema.prisma` (source of truth after generation).

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-20 | MVP tables for auth + plots + sprouts |
| 2026-03-20 | **PostgreSQL** datasource; Initiatives, Harvests, `WorkspaceAiSettings`, `EmailTemplate`; Sprout `parentSproutId`; session **tokenHash** |
| 2026-03-21 | Replaced Sprout `horizon` enum with `timelineLabel` + `targetCompletionAt`; Plot `timelineLabel`; Initiative planning fields |
