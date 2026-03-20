# Skill: System Architecture → Relational Schema (AI Agents)

Use this skill when the user provides **system architecture**, **product decomposition** (features, epics, tasks), and ideally **API design**, and wants a **clear, normalized, implementation-ready** relational schema—typically **PostgreSQL** with an ORM such as **Prisma**.

**Goal**: A data model engineers can implement **without guesswork**: explicit entities, keys, FKs, integrity rules, and indexes tied to **real query patterns**—aligned to APIs and architecture (no orphan tables, no silent feature drops).

## Pipeline position

| | |
|--|--|
| **Runs after** | [`decomposition-to-system-architecture.md`](decomposition-to-system-architecture.md) (+ decomposition for context). |
| **Feeds** | [`architecture-to-execution-plan.md`](architecture-to-execution-plan.md) and [`structured-task-to-production-code.md`](structured-task-to-production-code.md) (per task). |
| **Primary output** | Tables, relationships, indexes, integrity rules; optional **Prisma** / **SQL DDL**. |

---

## Principles

- **Clarity and integrity first**: Every table answers “what real-world thing is this?” Relationships are **explicit** (FKs), not implied.
- **Practical normalization**: Prefer **3NF** for core domain; allow **targeted denormalization** only when justified (read path, audit, reporting)—call out the **tradeoff**.
- **No over-engineering**: No generic “property bag” tables, no speculative abstractions, no parallel models for the same concept.
- **Naming**: **`snake_case`** for tables and columns; **singular table names** *or* **plural**—pick **one** convention per document and state it in **Assumptions** (PostgreSQL ecosystem often uses plural `users`, `orders`; Prisma often maps model `User` → table `User` or `users`—**state the mapping** when giving Prisma).
- **PostgreSQL-first types**: Use PG types (`uuid`, `timestamptz`, `text`, `boolean`, `jsonb` for truly semistructured payloads (variable shape, not queried by field in hot paths—see indexing section for when GIN applies)), appropriate precisions for numerics, `citext` only if case-insensitive email/login is required (note extension).
- **API alignment**: Every **resource** or **persistent concept** implied by endpoints should **map** to tables/columns or be explicitly **out of DB** (e.g., ephemeral cache only).

---

## Typical input

- Features / epics / tasks (especially **database** and **integration** tasks).
- Architecture doc: services, auth, data flow, integrations.
- API table: paths, methods, entities implied by request/response.

---

## When architecture or APIs are incomplete or inconsistent

Ask **focused** questions (or deliver **v1 schema + Assumptions**):

- **Tenancy**: Single-tenant vs multi-tenant (`tenant_id` on all tenant-bound rows?).
- **Identity**: User vs account vs organization; guest/anonymous data?
- **Lifecycle**: Soft delete (`deleted_at`) vs hard delete; retention/legal hold?
- **Money / quantities**: Currency, precision, rounding rules?
- **Auditing**: Who changed what, immutability, append-only events?
- **Idempotency**: API keys for retries—persist where?
- **Integrations**: Source of truth per entity (local copy vs remote ID only)?

**Conflicts**: Endpoint exposes fields with no entity, or two endpoints model the same noun differently—**flag** and pick **one** canonical model.

---

## Output structure (use these sections in order)

### 0. Conventions (short)

- **PK style**: `uuid` vs `bigserial`—justify (distributed IDs vs simplicity).
- **Timestamps**: `created_at`, `updated_at` as `timestamptz` where applicable.
- **Table naming**: plural vs singular—state choice.

### 1. Tables

For **each** table, provide:

- **Table name** (`snake_case`)
- **Description**: what real-world **entity** or **association** it represents
- **Columns** (table per column or compact list):

| Column | PostgreSQL type | Constraints | Notes |
|--------|-----------------|-------------|-------|
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | … |

- **Constraints**: `NOT NULL`, `UNIQUE`, `DEFAULT`, `CHECK` (when they encode domain rules), composite uniqueness
- **Relationships**:
  - List **foreign keys** with `REFERENCES parent_table(column)`
  - State **cardinality**: one-to-one, one-to-many, many-to-many (M2M → junction table in section 2)

**Relationship clarity**

- **One-to-many**: FK on the “many” side unless 1:1 optional profile pattern (FK + `UNIQUE` on FK column).
- **Many-to-many**: Always a **junction** table; no comma-separated IDs in a column.

### 2. Junction tables (if needed)

For each M2M (or ordered M2M with attributes):

- **Name**, **purpose**, **columns** (usually composite `PRIMARY KEY` or surrogate PK + `UNIQUE` pair)
- **FKs** and **cascade** behavior
- Extra columns on junction when the link has state (e.g., `role`, `invited_at`)

### 3. Enums (if applicable)

| Enum name | Values | Used in (table.column) |
|-----------|--------|-------------------------|

Prefer PostgreSQL **native enums** *or* `text` + `CHECK` for MVP flexibility—**state tradeoff**. For Prisma, map to `enum` in schema or `String` + app validation—note choice.

### 4. Indexing strategy

| Index | Table | Columns | Type (BTREE / GIN / partial) | Justification |
|-------|-------|---------|------------------------------|---------------|
| `PRIMARY KEY` | … | … | implicit | … |
| Secondary | … | … | … | Match **stated** query patterns (filters, sorts, joins) |

- **Avoid** indexing every column; justify each secondary index (write amplification).
- **Partial indexes** when filtering soft-deleted or status subsets.
- **`jsonb`**: Use a GIN index only when querying inside the JSON structure (e.g., `payload @> '{"status":"active"}'`). If you never filter by JSON fields, no index needed—but `jsonb` is still fine as a column type for structured payloads.

### 5. Data integrity and constraints

- **ON DELETE / ON UPDATE** per FK: `RESTRICT`, `CASCADE`, `SET NULL`—pick **per relationship** with rationale (e.g., child rows meaningless without parent → `CASCADE`; optional ref → `SET NULL`).
- **Uniqueness**: business keys (`email` per tenant), natural composites
- **Validation assumptions**: what the **DB** enforces vs **app** (e.g., format regex in app, non-null and FK in DB)
- **Soft delete**: if `deleted_at` is used, add a **partial index** on all high-traffic queries filtering `WHERE deleted_at IS NULL` to avoid scanning deleted rows; also ensure `UNIQUE` constraints are partial (e.g., `CREATE UNIQUE INDEX ... WHERE deleted_at IS NULL`) to allow re-creation of logically deleted records.

### 6. Query considerations

- **Common patterns** (bullets): e.g., “list sprouts by `plot_id` ordered by `updated_at`,” “lookup user by `email` + `tenant_id`”
- **Join paths** for hot reads (short notes)
- **Pagination**: keyset vs offset—recommend based on expected table size

### 7. Scalability considerations

- **Growth**: which tables grow fastest; index health; archival candidates
- **Partitioning**: only when clear access pattern (time-series events)—otherwise “not needed for MVP; revisit when …”
- **Denormalization**: if any, **what** is duplicated, **how** kept consistent, **when** to revert to normalized

---

## Alignment checks (mandatory)

- **Feature coverage**: Table or bullet list—each **feature** → tables that persist its state
- **API coverage**: Each **mutating** / **read** endpoint that implies storage → columns/tables referenced (or explicit “served from cache/external system X only”)

---

## Key design decisions and tradeoffs

Include bullets such as:

- **Normalization vs read performance** (e.g., computed/cache table for dashboard)
- **Strict enums vs free text** (migration cost vs validation)
- **Surrogate vs natural keys** (stability of business keys)
- **Soft delete vs hard delete** (compliance vs query complexity)

---

## Assumptions (missing or unclear input)

Bulleted list: every guess about tenancy, IDs, naming, timestamps, money, auth, and out-of-scope persistence.

---

## Future schema extensions

- **Near-term** (next planned increment): tables/columns likely to add; specifically call out additive-only migrations and any planned backfills.
- **Later**: sharding/partitioning, read replicas, event outbox, search index tables—only name these if the architecture document explicitly defers them.

---

## Implementation appendix

Default: provide **B) Prisma schema** for any project using Prisma (check the repo stack). Provide **A) SQL DDL** instead—or in addition—when the project uses raw SQL migrations or a non-Prisma ORM.

### A) SQL DDL (`CREATE TYPE`, `CREATE TABLE`, indexes, FKs)

- Executable **PostgreSQL** DDL; include `CREATE EXTENSION` for any required extensions (e.g., `pgcrypto` for `gen_random_uuid()`, `citext`).
- Comments on non-obvious choices.

### B) Prisma schema

- `generator` / `datasource` block placeholders (`provider = "postgresql"`, `url = env("DATABASE_URL")`)
- `model` definitions with `@id`, `@default`, `@relation`, `enum`, `@@index`, `@@unique`
- After schema changes, the implementation agent must run `prisma migrate dev` (development) or `prisma migrate deploy` (CI/production) and `prisma generate`.
- Note **Prisma migration** caveats (enum renames require manual steps; relation name changes are breaking).

Keep appendix **consistent** with the narrative sections (same tables, columns, relations).

---

## Anti-patterns

- Polymorphic `*_type` + `*_id` without strong discipline (avoid unless documented pattern + constraints)
- Storing lists in strings or `jsonb` when relational structure is stable
- **Redundant** copies of mutable data across tables without sync strategy
- Indexes “just in case” with no query

---

## Handoff checklist

- [ ] **snake_case**; naming convention stated
- [ ] Every FK has **delete/update** behavior chosen
- [ ] M2M only via **junction** tables
- [ ] **Enums** justified or replaced with `text` + check
- [ ] **Indexes** tied to listed query patterns
- [ ] **Features** and **APIs** mapped—no unexplained orphans
- [ ] **Assumptions** and **tradeoffs** explicit
- [ ] **Prisma schema** (or SQL DDL) provided and consistent with narrative sections
- [ ] If soft delete used: partial indexes present and unique constraints are partial
