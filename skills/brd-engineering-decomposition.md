# Skill: BRD → Engineering Work Decomposition (AI Agents)

Use this skill when the user provides a **BRD**, **PRD**, **product spec**, or **requirements list** and wants it turned into **execution-ready engineering work**: **Features → Epics → Tasks**.

**Goal**: A structure engineers can pick up **without inventing scope**—clear ownership boundaries, minimal overlap, realistic sequencing.

## Pipeline position

| | |
|--|--|
| **Runs after** | [`product-brd-generation.md`](product-brd-generation.md) (or equivalent BRD / spec). |
| **Feeds** | [`decomposition-to-system-architecture.md`](decomposition-to-system-architecture.md). |
| **Primary output** | **Features → Epics → Tasks** with types, **S/M/L** effort, dependencies, MVP boundaries. |

**If architecture or schema already exists** (e.g., brownfield or prior agent run): **revise tasks to match** those artifacts—do **not** invent a parallel breakdown that contradicts endpoints, tables, or module boundaries. Prefer **diff-style** task updates (what changed vs legacy).

---

## Principles

- **Execution clarity over theoretical completeness**: Prefer a shippable breakdown over exhaustive taxonomy.
- **Non-overlapping boundaries**: Each task belongs to **one** epic; epics don’t duplicate the same slice of work; features don’t smear into each other.
- **Logical grouping**: Epics cluster by **coherent functional area** or **vertical slice boundary** (see below)—not random file touches.
- **Engineer-ready tasks**: A senior engineer should recognize **what to build**, **where it lives**, and **how to verify**—without another decomposition pass.
- **Balanced granularity**: Each task should be **one cohesive implementation unit** (typically **S** or **M** effort—see task table below); split when parallelization, risk, or review boundaries demand it. **Calendar duration is optional** when agents own implementation; use **effort + dependency** as the primary guide.
- **Bullets over essays**: Short descriptions; link intent back to BRD acceptance criteria when useful.

---

## Hierarchy definitions

| Level | Definition | Good fit |
|-------|------------|----------|
| **Feature** | User- or business-visible **capability** aligned to outcomes in the BRD. | Maps to roadmap themes or release bullets—not org politics. |
| **Epic** | **Grouped functional area** under one feature: one coherent problem space or subsystem slice. | “Auth & sessions,” “Billing webhook ingestion,” “Admin audit UI.” |
| **Task** | **Single implementation unit** with clear deliverable and verification. | One PR or one tight PR chain with obvious “done.” |

**Overlap rules**

- **Feature vs feature**: If two features share heavy infrastructure, put shared work in **one** feature as an epic (“Platform / shared services”) or split by **consumer** and **duplicate** only if truly independent—prefer **one place** for shared foundations.
- **Epic vs epic**: Epics are siblings under the same feature; no duplicate epics (“API” vs “Backend” for the same endpoints—merge or rename).
- **Task vs task**: No two tasks “implement the same endpoint” unless one is **spike** vs **implementation** (label clearly).

---

## Vertical slices vs layer cake (real-world workflows)

Pick a decomposition style based on risk and team shape:

- **Vertical slice** (preferred for product MVPs): Epic = **user journey segment**; tasks cut across FE/BE/DB as needed but stay **small** and ordered.
- **Layered** (sometimes for platform-heavy work): Epics by **API**, **data**, **integrations**—only when the BRD is infrastructure-first; still avoid tasks that are “do all models.”
- **Spikes / research**: Allowed as **tasks**—tag **spike** in title/description with a **bounded scope** and **exit artifact** (e.g., decision doc, ADR comment, prototype branch)—not open-ended research.

Reflect **ordering**: call out **blocked-by** dependencies between tasks when not obvious.

---

## When the BRD is incomplete

Ask **targeted** questions before locking tasks (or produce **v1 with Assumptions**):

- **Environments & stack**: Web/mobile, monorepo layout, existing services?
- **Non-functionals**: Performance, security, compliance constraints that change shape of work?
- **MVP boundary**: What must ship vs phase 2?
- **Integrations**: Which external systems, sandbox access, webhooks?
- **Definition of done**: Demo path, feature flags, analytics, rollout?

---

## Adaptation: team size

| Team size | Adjust breakdown |
|-----------|------------------|
| **1–2 engineers** | Fewer, slightly **larger** tasks (still **actionable**); favor **vertical epics**; minimize parallel merge conflicts. |
| **3–5** | Standard granularity; explicit **dependencies** so parallel streams don’t collide. |
| **6+** | More epics for **parallel ownership**; tasks stay small; add **interface** tasks (contract/schema) **before** parallel implementation. |

---

## Adaptation: scope depth (MVP vs full build)

| Mode | Behavior |
|------|----------|
| **MVP** | Ruthless **scope**: fewer features; **defer** epics with explicit **Out of MVP** section; prefer **manual** or **thin** integrations where BRD allows; mark **Nice-to-have** tasks as **Low** priority or exclude. |
| **Full build** | Cover **NFRs** (observability, hardening, migration paths); add **polish** epics only when BRD demands; keep tasks concrete (“Add retries + DLQ for job X” not “Improve reliability”). |

State at top: `**Decomposition mode:** MVP | Full | Hybrid` and `**Assumed team size:** …` if unknown, note **TBD**. **Timeline** is optional when downstream work is agent-driven; **scope boundaries** are not.

---

## Output structure (required)

Present the breakdown in nested headings or a table group—**consistent field names** below.

### Features

For **each feature**:

- **Name**
- **Description** (what it is, who it’s for—1–3 bullets)
- **Business value** (why it matters—tie to BRD outcomes)

### Epics (under each feature)

For **each epic**:

- **Name**
- **Description** (scope boundary—what’s in / what’s explicitly not in this epic)

### Tasks (under each epic)

For **each task**:

| Field | Required values / notes |
|-------|-------------------------|
| **Title** | Imperative, specific: “Add POST /v1/invites with idempotency key”—not “Work on API.” |
| **Description** | **What** to implement, **key files/areas** if known, **how to verify** (tests, checklist, screenshot). |
| **Type** | One of: `frontend`, `backend`, `database`, `integration` (use **closest primary**; mention secondary in description if split is artificial). |
| **Priority** | `high`, `medium`, `low` (aligned to MVP critical path). |
| **Estimated effort** | `S`, `M`, `L`: **S** = small single focused change; **M** = multi-file / moderate complexity; **L** = large cohesive slice—**split** if it spans unrelated concerns or blocks parallel work. (Aligns with [`architecture-to-execution-plan.md`](architecture-to-execution-plan.md).) |
| **Dependencies** | Other **task titles** or **external** deps (API keys, design, legal); `none` if truly independent. |

**Effort calibration**: If stack/team unknown, state assumptions in a one-line **Effort note** under the feature.

---

## Task quality bar (non-negotiable)

**Avoid**

- “Implement feature,” “API stuff,” “Wire up UI,” “Testing,” “Polish,” “Refactor as needed.”
- Tasks that bundle **unrelated** concerns (new endpoint + full redesign + migration).

**Prefer**

- Verbs + object + constraint: “Persist invite tokens with 7-day TTL; add unique index on `email` + `plot_id`.”
- Explicit **done**: “Unit tests for service; OpenAPI updated; 401/403 cases covered.”

**Balance**

- Too granular: “Rename variable in file X” (unless part of risky migration)—merge into parent task.
- Too high-level: “Build billing” (epic, not task).

---

## Iterating as requirements evolve

1. **Track the source**: Optionally prefix epic or task with BRD refs (`FR-03`, `NFR-Performance`) when the doc has IDs.
2. **Scope change**: Move tasks; **don’t** leave orphaned duplicates—**retire** superseded tasks with a one-line “Superseded by …” in a changelog block at bottom.
3. **New BRD version**: Add `**Changelog**` with date + what shifted (features added/removed, epics merged).
4. **Splitting work mid-flight**: Replace one task with **2+** tasks that each remain actionable; update **Dependencies**.
5. **Re-estimation**: If effort was wrong, update **S/M/L** and **Priority**—don’t hide uncertainty; flag **risk** in description.

---

## Optional closing sections (use when helpful)

- **Critical path**: Ordered list of task titles for fastest MVP.
- **Parallel tracks**: Groups safe to run concurrently.
- **Open engineering questions**: Unknowns that block estimates (spike tasks link here).

---

## Anti-patterns

- Epics that are **roles** (“Frontend epic,” “Backend epic”) without **functional** meaning—unless the BRD is purely technical and phase-gated.
- Mirror-image tasks duplicating the same acceptance criteria.
- Tasks with **no verification** path.
- Priority **high** on everything.

---

## Handoff checklist

- [ ] Every **feature** has business value and maps to BRD scope.
- [ ] **Epics** are non-overlapping; each task sits under exactly one epic.
- [ ] **Tasks** are actionable, typed, prioritized, estimated, dependency-aware.
- [ ] **MVP vs full** and **team size** assumptions stated.
- [ ] No generic/vague task titles.
