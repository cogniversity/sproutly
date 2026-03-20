# Skill: Architecture + Data Model → Engineering Execution Plan (AI Agents)

Use this skill when the user provides **system architecture**, a **relational schema / data model**, and optionally **features, epics, and tasks**, and wants a **step-by-step, MVP-first execution plan** engineers can run without re-decomposing work.

**Goal**: **Setup → core vertical slices → enhancements**, with **actionable tasks**, explicit **dependencies**, **build order**, **API/DB sequencing**, and **environment** guidance—aligned to the architecture and schema (no orphan work, no vague “implement logic” blobs).

## Pipeline position

| | |
|--|--|
| **Runs after** | [`decomposition-to-system-architecture.md`](decomposition-to-system-architecture.md) **and** [`architecture-to-relational-schema.md`](architecture-to-relational-schema.md). |
| **Feeds** | [`structured-task-to-production-code.md`](structured-task-to-production-code.md) — **one task (or parallel independent tasks) per agent run**. |
| **Primary output** | Phased plan, **global build order**, folder layout, API/DB order, env, risks, MVP vs deferred. |

**Agent-oriented sequencing**: Prefer **dependency-correct order** and **contract-before-parallel** work over **calendar estimates**.

---

## Principles

- **MVP first**: Ship a **thin end-to-end path** early (auth stub → one core journey → observability baseline). Defer polish, nice-to-have endpoints, and premature scale work—list deferrals explicitly.
- **Actionable tasks**: Each task has a **verifiable output** (merged PR state, command result, demo path). Ban titles like “Implement feature logic,” “Work on API,” “Hook up UI.”
- **Right-sized work**: Match **S/M/L** semantics from [`brd-engineering-decomposition.md`](brd-engineering-decomposition.md)—each plan task is **one shippable step** for an implementation agent; split when parallelization or unknown integration risk demands it.
- **Alignment**: Every phase/task **maps** to architecture components, schema tables, and (if present) feature/epic IDs or names.
- **Fast feedback**: Order work so **integration and E2E smoke** happen **early** (contract tests, seed data, local docker compose if applicable).
- **Bullets over essays**: Tables and lists; short “why this order” rationale per phase.

---

## Typical input

- Architecture: FE/BE boundaries, auth, integrations, data flows.
- Data model: tables, FKs, enums, indexes (or Prisma schema / DDL).
- Optional: existing decomposition tasks—**merge** into phases instead of duplicating; resolve conflicts explicitly.

---

## When inputs are incomplete or inconsistent

Ask **targeted** questions or ship **v1 plan + Assumptions**:

- **Stack pinned?** (e.g., Next.js, API framework, monorepo tool)
- **Auth**: sessions vs JWT, multi-tenant rules affecting migrations?
- **Environments**: staging, feature flags, secrets management?
- **Integrations**: sandbox keys, webhook URLs, retry requirements?
- **Conflicts**: API exposes entities not in schema, or schema tables with no API—**pick one** resolution path.

---

## Adaptation: team size

| Team size | Plan shape |
|-----------|------------|
| **1 engineer** | Fewer parallel tracks; **vertical slices** inside each phase; minimize context switching. |
| **2–3** | **Parallelize** after shared **foundation** phase (see splitting guidance). |
| **4+** | Strong **contract-first** tasks (OpenAPI/types); separate **tracks** with explicit handoffs. |

---

## Adaptation: scope pressure (not calendar)

| Mode | Behavior |
|------|----------|
| **Tight MVP** | Collapse phases; **stub** integrations (fake adapter + interface); defer nonessential indexes until query paths are proven. |
| **Full breadth** | Keep phases distinct; include hardening, observability, and migration tasks implied by the BRD—still ordered by **dependencies**. |

State at top: `**Plan mode:** MVP | Standard | Full breadth` and `**Assumed team size:** …` (or TBD). **Dates are optional**; **critical path** = tasks that **block downstream agents** or integration, not calendar deadlines.

---

## Output structure (use these sections in order)

### 1. Implementation phases

For **each phase**, provide:

- **Phase name**
- **Goal** (what becomes true when phase completes)
- **Why this order** (dependency on prior phase, risk reduction, unblock parallel work)

Under the phase, list **Tasks** as an array (table or repeated blocks). **Each task**:

| Field | Content |
|-------|---------|
| **Title** | Specific imperative (“Add Prisma migration for `users` + `sessions` tables”) |
| **Description** | What to do, **where** (packages/paths), **how to verify** (tests, curl, UI check) |
| **Type** | One of: `setup`, `frontend`, `backend`, `database`, `integration` |
| **Dependencies** | Other **task titles** and/or **“after Phase N”**; `none` if none |
| **Output** | Concrete artifact: “Migration applied; `GET /health` returns 200; login page renders” |

**Phase ordering pattern (default)**

1. **Foundation / setup** — repo, tooling, CI skeleton, env template, local DB.
2. **Data layer** — baseline migrations for **MVP tables** only; seed for dev.
3. **Core domain API** — auth/session or equivalent + **one** primary resource aligned to top feature.
4. **Core UI slice** — routes/pages consuming that API; happy path + basic errors.
5. **Hardening** — validation, logging, minimal tests, feature flags if needed.
6. **Enhancements / remaining epics** — ordered by **dependency** and **value**.

Adjust labels to match the product; **do not skip** explicit MVP deferrals (see section 8).

### 2. Recommended build order

- **Step-by-step** numbered list of **task titles** across phases (single total order).
- **Critical path**: Mark tasks that **block** later phases or parallel agents if unfinished (e.g., `CP`).
- **Parallelizable**: Group tasks safe to run **concurrently** after named dependency (e.g., “After `OpenAPI v1 for plots` lands: FE list view ∥ BE pagination tests”).

### 3. Folder / project structure

Suggest a **practical** layout aligned to stated stack (default: **monorepo-friendly**):

- **Frontend** (e.g., Next.js `app/` or `pages/`, `components/`, `lib/api`, feature colocation).
- **Backend** (e.g., `src/modules/*`, `routes`, `services`, `db`, `jobs`).
- **Shared** (`packages/types`, OpenAPI-generated clients, zod schemas, shared constants).

Keep depth **reasonable**; note **one** sentence per top-level folder.

### 4. API implementation plan

- **Source of truth**: Use the **API contract** from the architecture document (OpenAPI fragment or per-route field lists) as the authoritative endpoint spec. Do not invent or re-derive endpoint shapes here.
- **Ordered list** of endpoints to build (or endpoint groups), **first to last**.
- **Map** each to **feature / epic** (and related tables).
- **Dependencies**: required migrations, auth middleware, external client ready, feature flags.

### 5. Database implementation plan

- **Table creation / migration order** respecting **FK dependencies** (parents before children; junctions after both sides).
- **Migration sequencing**: one logical migration per risky change vs batched MVP migration—justify brevity.
- **Seed data**: minimal rows for **local dev and smoke** (admin user, sample tenant, fixture plots)—what **not** to seed (PII).

### 6. Environment & setup

- **Project initialization** (create app, lockfile, lint/format, Git hooks if any).
- **Dependencies** (runtime + dev-only).
- **Environment variables** (table: name, purpose, example placeholder, required?).
- **Local dev**: DB start (`docker compose` / native), migrate, seed, run FE/BE, **smoke checklist**.

### 7. Risks & mitigations

| Risk | Type (technical / execution) | Mitigation |
|------|------------------------------|------------|
| … | … | Spike with time-box, contract test, stub adapter, clarify with PM, etc. |

### 8. MVP scope definition

- **Strict MVP**: Bullets—what **must** ship for first meaningful user/stakeholder demo.
- **Deferred**: Bullets—**Post-MVP** with **why** and **dependency** on what MVP learning.
- **Boundary**: One short paragraph: what **excludes** MVP to protect **scope** and **sequencing clarity**.

---

## Iterating after initial implementation

- **Per-cycle rhythm**: After each implementation pass, demo → capture gaps → insert **small** tasks into the **Enhancements** phase. Avoid reopening closed migrations; prefer additive migrations instead.
- **Schema changes**: Prefer **forward-only** migrations; document **backfill** tasks explicitly when needed.
- **API versioning**: When breaking clients, add **v2** tasks explicitly—don’t retrofit silently.
- **Traceability**: Optionally tag tasks with `Feature: …` / `Epic: …` for churn tracking.

---

## Splitting work (parallel tracks in the plan)

This section describes how to **mark** the plan for parallel execution. Actual parallelization decisions are made by whoever runs the agents (human or orchestrator)—not by the plan itself.

- **Safe to parallelize**: Tasks in the "Parallel tracks" build-order group (from [`brd-engineering-decomposition.md`](brd-engineering-decomposition.md)) that do not share output files. Mark these explicitly in the build order section with a note like "After `<foundation task>` lands: Task A ∥ Task B".
- **Serialize these**: Anything touching `schema.prisma`, shared migration files, global config, or shared route registries. Mark these with a `(serialize)` annotation in the build order so a reader knows not to run them in parallel.
- **Handoffs**: Each handoff task must list **consumer** and **deliverable artifact** (committed schema file, OpenAPI snippet, published package, mock server) so the next task knows what to wait for.

---

## Task quality bar

**Bad → Better**

- “Implement dashboard” → “Add `GET /api/v1/metrics/summary` using `plots` + `sprouts` counts; return JSON schema X; unit test service with sqlite/pg test container.”
- “Setup project” → “Initialize pnpm monorepo with `apps/web`, `apps/api`; shared `tsconfig`; `docker compose` for Postgres 16; README **Local dev** section.”

---

## Anti-patterns

- Phases that are **only** “Backend” then **only** “Frontend” with no **slice** delivered until the end.
- Tasks with **no output** or **no verification**.
- Building **all** tables before **any** API (unless legally required)—prefer **slice-aligned** migrations.
- **Critical path** hidden—every plan should surface it.

---

## Handoff checklist

- [ ] Phases ordered with **why**; tasks **typed** and **dependency-aware**
- [ ] **Build order** + **critical path** + **parallel** opportunities
- [ ] **Folder structure** matches chosen stack
- [ ] **API** and **DB** plans match schema and architecture
- [ ] **Env vars** and **local setup** documented
- [ ] **MVP** vs **deferred** explicit
- [ ] **Risks** have mitigations
