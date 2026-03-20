# Sproutly — Relational schema

**Skill:** [`skills/architecture-to-relational-schema.md`](../skills/architecture-to-relational-schema.md)  
**Implements:** [`SYSTEM_ARCHITECTURE.md`](./SYSTEM_ARCHITECTURE.md)

---

## Conventions

- **PK:** `cuid()` via Prisma (URL-safe; fine for MVP).  
- **Timestamps:** `createdAt`, `updatedAt` on mutable entities.  
- **Table names:** Prisma default mapping (`User` → `User` table in SQLite; pluralization off — use `@@map` if Postgres style desired later).

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
| token | string UNIQUE | opaque bearer equals cookie value |
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
| horizon | enum | optional planning |
| ownerUserId | FK → User? | nullable |
| createdAt | datetime | |
| updatedAt | datetime | |

**Status enum (MVP):** `BACKLOG`, `IN_PROGRESS`, `PAUSED`, `DEPRIORITIZED`, `BLOCKED`, `DONE`  
**Horizon enum:** `NONE`, `DAY`, `WEEK`, `MONTH`, `QUARTER`, `YEAR` — typo MONTH as MONTH in prisma `MONTH`

**Index:** `(plotId)`, `(ownerUserId)`

---

## Junction tables (later)

- `Initiative`, `InitiativePlot`, `InitiativeSprout`  
- `Harvest`, `HarvestSprout`

---

## Prisma schema file

Implemented in `prisma/schema.prisma` (source of truth after generation).

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-20 | MVP tables for auth + plots + sprouts |
