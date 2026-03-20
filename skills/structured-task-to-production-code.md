# Skill: Structured Tasks → Production-Ready Code (AI Agents)

Use this skill when the user supplies a **specific engineering task** plus **architecture** (and **API design** when relevant), **data model / schema**, and optionally **existing code context**. The agent’s job is to produce **correct, maintainable code** that **fits the repo** and **respects boundaries**—not to redesign the product.

**Goal**: Turn a well-scoped task into **working, integrated** implementation: **backend**, **frontend**, **database** (Prisma/migrations/SQL), and **integrations**—with **TypeScript type safety**, **basic error handling**, and **security-aware validation** where applicable.

## Pipeline position

| | |
|--|--|
| **Runs after** | [`architecture-to-execution-plan.md`](architecture-to-execution-plan.md) task pick + [`decomposition-to-system-architecture.md`](decomposition-to-system-architecture.md) + [`architecture-to-relational-schema.md`](architecture-to-relational-schema.md) (+ **API contract** from architecture when present). |
| **Feeds** | Review, QA, or deployment agents (outside this folder); **repo** is the source of truth after merge. |
| **Primary output** | Code changes (path-scoped), matching **existing** project patterns. |

---

## Principles

- **Correctness and integration over speed**: Prefer boring, explicit code that matches existing patterns over fast-but-foreign shortcuts.
- **Clarity over cleverness**: Small functions, obvious control flow, names that match domain language from the task/architecture.
- **Clean architecture (lightweight)**: Route/controller/handler thin; domain/service for rules; data access isolated (Prisma/repository module). Don’t invent layers the repo doesn’t use—**mirror what’s there**.
- **Single responsibility**: One module change set per concern; split files when it improves testability and readability.
- **DRY with judgment**: Extract shared helpers only when duplication is **stable**; avoid premature abstraction.

---

## Default tech stack (adapt to repo)

If the codebase implies otherwise, **follow the repo** and note the override in a **single line** only if the user explicitly allows non-code commentary.

| Area | Default assumption |
|------|-------------------|
| **Frontend** | **Next.js (App Router)**, **React**, **TypeScript** |
| **Backend** | **Node.js**—**Route Handlers** (`app/api/...`) and/or **modular server** (services, routes) as the project does |
| **Database** | **PostgreSQL** + **Prisma** ORM (schema, migrations, typed queries) |

---

## Typical input (require as much as exists)

- **Task**: Title, description, acceptance criteria, type (`setup` | `frontend` | `backend` | `database` | `integration`).
- **Architecture**: auth model, module boundaries, error shape, logging approach (if documented).
- **API**: endpoint path/method, request/response shape, status codes.
- **Schema**: relevant models/tables, fields, relations, constraints, enums.
- **Code context**: files to extend, similar feature as reference, naming conventions.

---

## When the task is ambiguous or underspecified

**Stop and ask minimal questions** (bulleted) if any of:

- **AuthZ** rule unclear (who can do what on which resource).
- **Idempotency / uniqueness** for writes not defined.
- **Error contract** unknown (shape, codes).
- **API/schema mismatch** (field names, missing FK, nullable vs required).
- **Target files** unknown and repo layout doesn’t imply them.

If the user demands immediate output, implement the **narrowest safe subset**, add `TODO` with **specific** questions only where behavior would be unsafe to guess—prefer **not** guessing security rules.

---

## Generation modes

- **Full vertical slice**: API + service + Prisma + UI hook/component as needed.
- **Partial** (explicit in user message): **API only**, **UI only**, **DB only** (schema/migration/seed), **integration only** (client + adapter).
- **Refactor / extend**: Modify **existing** files; show **diff-shaped** edits (same file path, changed sections) rather than reprinting unrelated code.
- **Follow-up pass**: User pastes prior output—**extend** or **fix** without rewriting untouched lines.

---

## Context awareness (repo integration)

- **Read before write**: Match **folder layout**, **imports**, **error helpers**, **validation** (zod/yup/etc. if present), **API client** patterns.
- **Do not overwrite unrelated files**: Touch only paths required by the task; if a shared type must change, keep the change **minimal** and **backward-compatible** when possible.
- **Incremental updates**: Prefer **adding** a function or **extending** a router over new parallel patterns.
- **Naming**: Follow repo convention (`camelCase`/`PascalCase`, file naming, `kebab-case` routes if that’s the standard).

---

## Supported artifacts

| Kind | Examples |
|------|----------|
| **Backend** | Route handlers, controllers, services, domain functions, middleware, auth guards |
| **Frontend** | Server/Client components, pages, hooks, forms, loading/error boundaries |
| **Database** | `schema.prisma` snippets, migrations (SQL or Prisma migrate instructions), repositories/queries |
| **Integration** | HTTP clients, webhook handlers, retry/backoff, mapping DTOs → domain types |

---

## Output contract (when implementing)

**Default**: **Code only**—no explanations, no markdown prose, unless the user **explicitly** asks for explanation or the skill’s “clarifying questions” branch applies.

Use one fenced block **per file**, each preceded by a **path line** the toolchain understands:

```text
path/to/file.ts
```

```ts
// full file contents or focused excerpt per incremental rules
```

- Include **all imports** and **necessary dependencies** (if adding a package, name it in **`package.json`** diff block when the task includes dependency changes).
- **TypeScript**: strict-friendly types; **no** `any` unless matching existing codebase pattern—then **narrow** ASAP.
- **Error handling**: map known failures to **typed** errors or HTTP responses; don’t swallow exceptions; log with existing logger if present.
- **Security defaults**: validate **all external input** (params, body, query) with schema validation when available; parameterized queries via Prisma; never interpolate raw SQL with user input; don’t log secrets/tokens.

If the user asks for **explanations**, switch to brief rationale **after** code or in a separate section as requested.

---

## Code quality checklist (internal)

- [ ] Matches architecture boundaries (no business rules leaking into wrong layer).
- [ ] Aligns with **API** and **schema** (names, nullability, relations).
- [ ] Focused units (SRP); shared logic extracted **once** when duplicated.
- [ ] Basic **loading/error** paths on UI; consistent **status codes** on API.
- [ ] **Types/DTOs** for IO boundaries (request/response, Prisma `select` shapes where helpful).

---

## Types and tests (recommended)

- **Types/interfaces**: Export or colocate types for **public** API contracts and **integration** payloads; reuse generated Prisma types where appropriate.
- **Minimal test scaffolding**: When relevant, add **one** focused test file or case (e.g., service unit test with mocked Prisma, or handler test with mocked auth)—match repo test runner (**Vitest/Jest**). Skip if repo has no test pattern to mirror.

---

## Anti-patterns

- Regenerating entire apps or unrelated modules.
- “Implement feature logic” without concrete functions, routes, and types.
- Ignoring existing **error** and **validation** utilities.
- Silent truncation of scope (missing auth, missing migration) without `TODO` + question.

---

## Handoff self-check

- [ ] Task scope satisfied without unrelated edits.
- [ ] Code compiles in the **repo’s** TS settings (no avoidable errors).
- [ ] DB changes include **migration path** when schema changes.
- [ ] Output mode respected: **code-only** unless questions needed or user requested prose.
