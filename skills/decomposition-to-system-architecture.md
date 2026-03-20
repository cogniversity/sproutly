# Skill: Product Decomposition → System Architecture (AI Agents)

Use this skill when the user provides **structured product decomposition**—**Features**, **Epics**, **Tasks** (with types such as frontend, backend, database, integration)—and wants a **clear, MVP-appropriate, implementation-ready** system architecture.

**Goal**: Bridge **product intent** and **engineering execution**: named boundaries, explicit interactions, and an API/data story that **covers every feature** in the input (no silent drops).

## Pipeline position

| | |
|--|--|
| **Runs after** | [`brd-engineering-decomposition.md`](brd-engineering-decomposition.md) (Features / Epics / Tasks). |
| **Feeds** | [`architecture-to-relational-schema.md`](architecture-to-relational-schema.md) and [`architecture-to-execution-plan.md`](architecture-to-execution-plan.md). |
| **Primary output** | System design + **API endpoint table** + data flows; optional **API contract artifact** for downstream agents (see §4). |

---

## Principles

- **Implementable over impressive**: Favor designs a small team can build and operate; defer complexity with explicit **phase 2** notes, not hand-waving.
- **Specific, testable statements**: Ban vague NFRs (“fast,” “secure,” “scale well,” “handle efficiently,” “optimize later”). Use **targets**, **guards**, or **concrete mechanisms** (caching layer + TTL, rate limit per key, idempotency keys, retries with cap).
- **Alignment with decomposition**: Map **modules, services, pages, and endpoints** back to **feature / epic** names. If something in decomposition has no home, **flag it**—don’t omit.
- **Logical structure**: Clear **ownership** per component; **separation of concerns** (UI vs domain vs persistence vs integrations).
- **Evolution path**: Call out what changes when traffic, team, or compliance grows—without building for day-one scale fantasies.

---

## Typical input

- Feature list with business intent (even if brief).
- Epics grouped under features.
- Tasks with **Type** (`frontend`, `backend`, `database`, `integration`), dependencies, and priorities (if present—use them to infer critical path and integration risk).

---

## When decomposition is incomplete or inconsistent

Before locking architecture (or alongside a **draft marked Assumptions**), ask **minimal, high-leverage** questions:

- **Users & surfaces**: Web only, mobile, public vs admin, multi-tenant?
- **Auth model**: B2C vs B2B, SSO later, roles/permissions source of truth?
- **Data sensitivity**: PII, payments, audit logs, retention?
- **Traffic & SLO** (rough): Orders of magnitude—requests/sec, batch vs real-time?
- **Existing systems**: Greenfield vs brownfield; mandatory integrations?
- **Deployment**: Single region OK for MVP? Compliance region lock?

**Conflicts**: Same capability in two epics, tasks that contradict, or missing backend for a UI-heavy feature—**surface the conflict** and propose **one** resolution path.

---

## Output structure (use these sections in order)

### 1. System Overview

- **What the system does** in 3–6 bullets (actor → outcome).
- **Major subsystems** (e.g., web app, API, worker, DB, object storage) and **each one’s responsibility**.
- **Boundaries**: What is **in** vs **out** of this architecture pass (e.g., “CI/CD detailed in repo, not here”).
- **Coverage check**: Table or bullet list—**each Feature** → **primary owning subsystem(s)**.

### 2. Frontend Architecture

- **Framework & approach**: e.g., SPA + REST, SSR for SEO, etc.—**one paragraph max** unless user specified stack.
- **Routing & structure**: How **pages/routes** map to **features** (table: Route or area → Feature → Epic touchpoints).
- **Component/module boundaries**: Feature folders, design system, shared UI kit—practical, not textbook.
- **State management**: Server state vs client state; cache invalidation sketch (e.g., TanStack Query + server as source of truth).
- **Data fetching**: How the UI calls APIs (hooks, loaders), error/empty/loading patterns, auth header attachment.

If decomposition is backend-heavy with minimal FE tasks, keep this section short but **explicit** about what exists.

### 3. Backend Architecture

- **Services or modules** (monolith packages or separate services): **name + responsibility + owns which epics/features**.
- **Business logic boundaries**: Domain modules; what **must not** leak into controllers/route handlers (validation vs policy vs persistence).
- **AuthN / AuthZ**: Session vs JWT, where tokens live, refresh strategy sketch, **how roles/scopes are enforced** (middleware, policy layer, row-level rules).
- **Async work** (if tasks imply it): queues, outbox, webhooks, schedulers—only when decomposition needs it.
- **Request handling layers**: Describe the per-request path in one line: router → validation → handler → service → repository. Only call out deviations from this order.

### 4. API Design

Provide a **table** of endpoints (no wall of prose):

| Path | Method | Purpose | Related feature | Related epic |
|------|--------|---------|-----------------|--------------|
| `/api/v1/...` | GET | … | … | … |

**Rules**

- Cover **all** backend/integration-driving tasks; merge duplicates if decomposition repeated the same endpoint.
- **Versioning** note if public API or mobile clients (e.g., `/v1` prefix).
- **Idempotency**, pagination, and error shape—mention where non-trivial (brief).

**API contract (required for non-trivial APIs)** — always provide **one** of:

- **OpenAPI 3** fragment (`paths` + shared `components/schemas`) consistent with the endpoint table, **or**
- **Per-route** request/response **field lists** + **HTTP status** matrix.

If the API is trivial (one or two simple CRUD endpoints with no shared types), a brief inline field list is sufficient. Do not skip this entirely: implementation agents and schema agents treat this contract as **authoritative**.

### 5. Data Flow

- **One primary user journey** (pick the **highest-risk** or **most central** flow from decomposition): **numbered steps** from UI action → API → auth check → domain logic → DB read/write → external call → response → UI update.
- **Secondary flows** (optional): 1–2 short bullet chains (e.g., webhook ingestion, background job).
- Include **failure points** (timeout, 4xx/5xx) at a **high level**—not full failure-mode novel.

### 6. Integrations

For each **external system** implied by tasks or features:

- **System name & role** (what it’s authoritative for).
- **Connection pattern**: REST webhook, polling, SDK, message bus—**specific**.
- **Data exchanged** (entities/events); **failure handling** (retries, DLQ, manual replay—pick realistic MVP behavior).

If none: state **None identified** and what would trigger adding integrations.

### 7. Non-Functional Considerations

Only include dimensions that matter for **this** product. For each, **mechanism + target or guard**—not platitudes.

| Area | MVP stance | Example of specificity (adapt) |
|------|------------|----------------------------------|
| **Performance** | … | p95 API read **under 300ms** at expected MVP load; lazy-load heavy routes |
| **Scalability** | … | Stateless API behind single instance; DB indexes on foreign keys used in hot paths |
| **Reliability** | … | Webhook processor retries **3x** exponential; persist **idempotency key** |
| **Security** | … | HTTPS only; hashed secrets; OWASP baseline; RBAC on **resource** not page |

Replace numeric targets with **TBD + what measurement is needed** if unknown.

### 8. Tech Stack Recommendation

Table format:

| Layer | Choice | Brief justification (MVP + growth) |
|-------|--------|-----------------------------------|
| **Frontend** | … | Team velocity, ecosystem, hiring |
| **Backend** | … | Same |
| **Database** | … | Relational vs document vs search—**why for this domain** |

If the user **mandated** a stack, **adopt it** and skip second-guessing except for risk flags.

### 9. Key architectural decisions & tradeoffs

Required output. For each decision below, answer: **Decision chosen** → **Why** → **Cost / downside** → **Revisit when**.

- **Monolith vs modular monolith vs services**: Pick for **team size** and **decomposition**; state **trigger** to split (e.g., independent deploy cadence, different scaling profile).
- **REST vs GraphQL vs RPC**: Default **REST** for MVP unless decomposition screams graph aggregation or strong typing across many clients—justify.
- **Sync vs async**: When webhooks/jobs win over inline API.
- **Tenancy**: Single DB schema + tenant_id vs separate schemas—**one** choice + migration note.

### 10. Evolution path

Required output. Describes what changes as the product grows—without building for it up front.

- **0 → 1**: Single deploy unit, feature flags, minimal services, strong module boundaries in code.
- **Growth triggers**: Sustained **SLO misses**, **team parallelization pain**, **compliance boundary**, **integration sprawl**—tie each to a **concrete next step** (read replica, extract worker, API gateway, event bus)—**only as a staged path**, not upfront build.
- **Deprecation**: How to add **v2** APIs without breaking existing clients (versioned routes, sunset policy sketch).

---

## Anti-patterns

- Diagrams with **every box connected to every box** with no clear owner.
- **Magic** integration (“AI handles it”) without data flow.
- **Missing endpoints** for obvious UI tasks.
- **“We’ll optimize later”** without a measurable trigger.

---

## Handoff checklist

- [ ] Every **feature** appears in **overview coverage** and maps to FE/BE/DB/integration surfaces.
- [ ] **API table** is complete; **API contract** (OpenAPI or field lists) is present for non-trivial APIs.
- [ ] **Data flow** reflects auth and persistence reality.
- [ ] **NFRs** use mechanisms or measurable guards—not adjectives.
- [ ] **Decisions** (section 9) document tradeoffs and revisit triggers.
- [ ] **Evolution path** (section 10) describes staged growth, not upfront over-engineering.
