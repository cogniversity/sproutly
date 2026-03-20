# Agent skills — product → engineering pipeline

This folder defines **one skill per agent role**. Each skill is **self-contained**; use this README for **order**, **handoffs**, and **cross-cutting** practices.

**Operating model**: Multiple specialized agents run in **dependency order**. **Calendar timelines are secondary**; what matters is **artifact quality**, **clear dependencies**, and **no duplicate or conflicting work** between steps.

---

## Recommended pipeline (order)

| Step | Skill file | Primary output (handoff) |
|------|------------|----------------------------|
| 1 | [`product-brd-generation.md`](product-brd-generation.md) | BRD / product spec (problem, scope, metrics, stories, NFRs) |
| 2 | [`brd-engineering-decomposition.md`](brd-engineering-decomposition.md) | **Features → Epics → Tasks** (typed, effort `S`/`M`/`L`, dependencies) |
| 3 | [`decomposition-to-system-architecture.md`](decomposition-to-system-architecture.md) | System overview, FE/BE boundaries, **API endpoint table**, data flows, integrations, NFRs, stack; optional **OpenAPI-shaped contract** (see that skill) |
| 4 | [`architecture-to-relational-schema.md`](architecture-to-relational-schema.md) | Relational model: tables, FKs, indexes, integrity; optional **Prisma / SQL DDL** |
| 5 | [`architecture-to-execution-plan.md`](architecture-to-execution-plan.md) | Phased plan: ordered tasks (`setup` … `integration`), build order, folder layout, API/DB sequence, env, risks, **MVP vs deferred** |
| 6 | [`structured-task-to-production-code.md`](structured-task-to-production-code.md) | Code (per scoped task), aligned to architecture + schema + repo patterns |

**Sproutly repo — generated handoffs (living docs):**

| Step | Artifact |
|------|----------|
| 2 | [`docs/ENGINEERING_DECOMPOSITION.md`](../docs/ENGINEERING_DECOMPOSITION.md) |
| 3 | [`docs/SYSTEM_ARCHITECTURE.md`](../docs/SYSTEM_ARCHITECTURE.md) |
| 4 | [`docs/RELATIONAL_SCHEMA.md`](../docs/RELATIONAL_SCHEMA.md) (+ `prisma/schema.prisma`) |
| 5 | [`docs/EXECUTION_PLAN.md`](../docs/EXECUTION_PLAN.md) |
| 1 (product) | [`docs/BUSINESS_REQUIREMENTS_DOCUMENT.md`](../docs/BUSINESS_REQUIREMENTS_DOCUMENT.md) |

**Branching**: Step 6 runs **once per implementation task**, always with the **same** architecture + schema references. When multiple tasks are safe to run in parallel (marked in the execution plan build order), multiple agents can be launched independently—but this requires human or orchestrator coordination; the skills themselves do not enforce it.

---

## Handoff checklist (between agents)

- **BRD → decomposition**: Acceptance criteria and **out-of-scope** are explicit enough to derive tasks.
- **Decomposition → architecture**: Every feature has a **home** in subsystems; gaps flagged, not ignored.
- **Architecture → schema**: Every **mutating/list** API that persists state maps to **tables/columns** (or explicit “external SoT”).
- **Schema → execution plan**: Migration order respects **FKs**; contracts exist before **parallel** FE/BE agents.
- **Plan → code**: Task includes **verification** path; authz and **error shape** are not vague.

---

## API contract (between architecture and implementation)

To reduce FE/BE drift, the architecture agent should leave a **machine-friendly** artifact when APIs are non-trivial:

- **Minimum**: Endpoint table (already required in the architecture skill) **plus** request/response **field lists** and error codes per route.
- **Better**: **OpenAPI 3** YAML/JSON snippet or path-level components; or shared **TypeScript types** / **zod** schemas as the single source of truth—match what the repo uses.

Downstream **code** and **schema** agents must treat that contract as **authoritative** unless the user explicitly changes scope.

---

## Brownfield / existing systems

When extending a **legacy** or **live** codebase:

- **Decomposition** should include **refactor** and **migration** epics (strangler, feature flags, dual-write periods) when the BRD implies them.
- **Architecture** must name **what exists** vs **what’s new**; avoid greenfield-only diagrams.
- **Schema** prefers **additive** migrations, **backfills**, and **explicit** deprecation; call out **data migration** tasks in the execution plan.
- **Code** agent: **minimal blast radius**—extend existing modules, match patterns, no unrelated rewrites.

---

## Security (lightweight, all relevant agents)

- **BRD / architecture**: Who can do what (**AuthZ**), sensitive data, audit needs.
- **Schema**: PII columns, retention, **FK delete** behavior that could leak or orphan secure data.
- **Code**: Input validation, parameterized DB access, no secrets in logs; **don’t invent** auth rules—ask if missing.

For a **dedicated security pass**, add a separate agent brief (not in this folder) or extend architecture NFRs with a **threat-oriented** subsection when the user requests it.

---

## QA / definition of done

- **Execution plan** should already include **smoke** and **critical path** verification; add **E2E**-style tasks when the product demands them.
- **Code** skill: **minimal test scaffolding** when the repo has a pattern.
- Optional **QA agent**: map **acceptance criteria** from the BRD to **test cases** and **release checklist**—keep outside these skills unless you add a dedicated file later.

---

## Observability & ops (post-build)

Not a separate skill here; **architecture** and **execution plan** should already mention **logs, metrics, alerts** where NFRs require them. For go-live, an **ops agent** can consume:

- Architecture **data flow** + integration retry behavior  
- Execution plan **env vars** + **runbook-style** smoke steps  

---

## Documentation & ADRs

After material design decisions:

- Add **ADRs** (short) for irreversible choices (auth model, tenancy, event vs sync).
- Update **README** / **contributing** when local dev or env vars change—often a **small task** in the execution plan.

---

## Drift control

- **Single source of truth per concern**: BRD (why), decomposition (what work), architecture (how pieces talk), schema (persistent truth), plan (order), code (reality).
- If **any** agent contradicts an earlier artifact, **stop** and reconcile (or document **Assumptions** + **Open questions**) instead of silently patching. This applies at every step—not only architecture.
- **Upstream errors surfaced late**: If a code or schema agent discovers an inconsistency in an upstream artifact (wrong endpoint shape, missing column, scope gap), surface it explicitly and trace it back to the source document before proceeding.
