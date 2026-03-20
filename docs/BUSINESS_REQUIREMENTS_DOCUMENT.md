# Sproutly — Business Requirements Document

**BRD level:** Product (full product vision — startups **and** enterprises building software; phased delivery is an implementation concern, not a scope ceiling)

**Document status:** v2 — expanded market, cross-plot Initiatives, flexible planning model, Harvest as release hub, AI decomposition with OpenAI / Claude / Gemini.

---

## 1. Overview

### Problem

Software organizations—whether startups or enterprises—struggle to keep **strategy, ownership, and delivery** in one coherent picture. Work is split across products (“Plots”), but **real efforts often cut across them**: a customer visit requiring **custom demos of several products**, a **platform or infrastructure program** that touches multiple product lines, or a **new feature** on an existing product that must be **broken into executable work** quickly. Tools that assume **one item → one product** or **rigid sprint cadence** break when priorities shift weekly and teams “start something” then **reprioritize** without abandoning the idea.

### Context

Sproutly is a **product management platform** that connects execution with strategy using a growth metaphor (**Sprouts**, **Plots**, **Harvests**, **Growth Timeline**). Clients ship software; they need **flexible time horizons** (not mandatory scrum), **cross-cutting Initiatives**, **Harvests** as the anchor for **what releases together**, and optional **AI-assisted breakdown** of ideas and features into tasks—using **their choice of model provider** (OpenAI, Anthropic Claude, Google Gemini).

### Goal

Provide **one system of record** where teams can: organize work by **Plot** (product/team/stream); model **Initiatives that span multiple Plots**; plan with **horizons and priorities that tolerate change**; track **releases via Harvests**; visualize **Growth Timelines**; and use **AI to elaborate** new ideas or features into detailed work items—**enterprise-ready** (auth, scale, governance) without forcing **small teams** into heavyweight process.

---

## 2. Objectives & Success Metrics

| Objective | Metric | Baseline | Target | Time window | Owner |
|-----------|--------|----------|--------|-------------|--------|
| Single place for “who / what / when” | Median time for a new member to answer ownership + release target for active work | TBD | ≤ 2 min without chat | Per release / cohort | Product |
| Cross-product visibility | % of registered cross-plot Initiatives with linked Plots ≥ 2 and a DRI | TBD | 100% of created Initiatives | Steady state | Product |
| Release clarity | % of shipped Sprouts (or epics) associated with a **Harvest** when org policy requires it | TBD | Configurable target (e.g. ≥ 90%) | Per quarter | Product / CS |
| Planning flexibility | User-reported fit: “Supports how we actually plan” (survey 1–5) | TBD | ≥ 4.0 | Rolling | Product |
| AI usefulness | % of AI-assisted breakdown sessions where user **accepts or edits** ≥ 50% of generated tasks | TBD | ≥ TBD with PM | Post-launch AI | Product |
| Enterprise readiness | SSO + RBAC available for enterprise tier; audit export | N/A | Feature-complete per FR | Contract-driven | Eng + Security |

*Baselines and numeric targets for AI/enterprise should be set with GTM and first design partners.*

---

## 3. User Personas

### P1 — Alex, Product Manager (startup or enterprise)

- **Context:** Roadmap, stakeholders, engineering alignment; may own multiple Plots or features.
- **Goal:** Truthful picture of priorities and releases; minimal ceremony.
- **Pain:** Decks vs Jira drift; cross-product work invisible or duplicated.
- **Uses Sproutly:** Sprouts, Plots, Initiatives, Harvests, horizons, AI breakdown for new scope.

### P2 — Jordan, Engineering / Platform Lead

- **Context:** Delivery and technical programs (e.g. infra migration) spanning products.
- **Goal:** See dependencies and DRIs across surfaces; not locked into fake sprint commitments.
- **Pain:** “One backlog per product” hides shared platform work.
- **Uses Sproutly:** Initiatives linking multiple Plots, Sprouts for migration milestones, Harvest alignment for coordinated cutovers.

### P3 — Riley, Solutions / Sales Engineer (enterprise)

- **Context:** Customer visits, POCs, bespoke demo configurations across **several products**.
- **Goal:** Track visit prep as **one Initiative** with deliverables per product without splitting the narrative.
- **Pain:** Spreadsheets and side channels; no link to real product roadmaps.
- **Uses Sproutly:** Cross-plot **Initiative** (e.g. “Acme onsite — Q2”), Sprouts per demo track, owners per Plot slice.

### P4 — Morgan, IT / Security (enterprise)

- **Context:** Vendor assessment, SSO, data handling, AI usage policy.
- **Goal:** SAML/OIDC, roles, audit, optional BYOK for AI.
- **Pain:** Tools that only support one IdP or opaque AI data flow.
- **Uses Sproutly:** Admin console, integration docs, AI provider + data-processing transparency.

### P5 — Sam, Founder / Startup IC

- **Context:** Small team; may start from **raw idea** or single product.
- **Goal:** Grow structure as needed; no mandatory sprint overhead.
- **Pain:** Heavy PM tools; still needs releases and clarity.
- **Uses Sproutly:** Idea → Sprout → optional AI tasking; simple Plots; Harvest when shipping.

---

## 4. User Stories & Use Cases

### User stories (representative)

- As a **PM**, I want to **capture a net-new product idea**, so that **it can mature from concept to scoped work without losing context**.
- As a **PM**, I want to **add a major feature to an existing product (Plot)**, so that **I can refine it into tasks (manually or with AI)**.
- As a **PM**, I want to **create an Initiative spanning multiple Plots**, so that **cross-product efforts (demos, migrations, programs) have one DRI and one narrative**.
- As a **lead**, I want to **mark work as active, paused, or deprioritized** without deleting it, so that **priority churn is honest and history remains**.
- As a **PM**, I want to **plan with horizons (not only sprints)**, so that **teams that don’t run strict sprints still get roadmap clarity**.
- As a **release manager**, I want **Harvests to define what ships together**, so that **release tracking is explicit and communicable**.
- As a **user**, I want to **choose OpenAI, Claude, or Gemini** (per org policy) **for AI breakdown**, so that **we comply with contracts and preferences**.
- As an **admin**, I want **SSO and role-based access**, so that **enterprise rollout is supported**.

### Use case: Customer visit — multi-product configured demo

| Step | Description |
|------|-------------|
| **Actor** | Solutions engineer + PM |
| **Trigger** | Strategic customer onsite scheduled |
| **Main flow** | 1) Create **Initiative** “Customer X — Visit Mar 12” → 2) Link **Plots**: Product A, Product B, API platform → 3) Add Sprouts under each Plot (demo script, env, feature flags) **and** link them to the Initiative → 4) Assign owners per slice → 5) Set horizon / target week (not necessarily sprint) → 6) Track status; pause non-critical Sprouts if visit prep slips |
| **Alternate** | Visit postponed: Initiative dates shift; Sprouts move horizon; nothing is “lost.” |
| **Acceptance** | Initiative shows all linked Plots and child/linked Sprouts; filters “by Initiative” work; DRI visible. |

### Use case: Infrastructure movement impacting multiple products

| Step | Description |
|------|-------------|
| **Actor** | Platform lead |
| **Trigger** | e.g. data center move, K8s migration, shared auth upgrade |
| **Main flow** | 1) Create Initiative → 2) Link affected Plots → 3) Create Sprouts for waves/milestones per product + shared platform tasks → 4) Associate coordinated **Harvest** (or Harvest **series**) for cutover windows → 5) Growth Timeline shows progression across the program |
| **Acceptance** | Cross-Plot reporting; Harvest(es) show scope of coordinated release/cutover. |

### Use case: New feature on existing product — AI task breakdown

| Step | Description |
|------|-------------|
| **Actor** | PM or tech lead |
| **Trigger** | Feature approved at epic level; needs engineering tasks |
| **Main flow** | 1) Sprout lives in correct Plot → 2) User opens “Elaborate with AI” → 3) Select provider (OpenAI / Claude / Gemini) per org config → 4) Review generated tasks/sub-Sprouts → 5) Accept, edit, or reject; audit trail stores prompt hash / model / timestamp per policy |
| **Acceptance** | Output attaches to parent Sprout; permissions respected; no provider credentials in client logs. |

### Edge cases

- Initiative with **zero** Sprouts yet (planning shell).
- Sprout in **one primary Plot** but linked to **multiple Initiatives** (allowed with clear UX to avoid clutter).
- Org **disables AI** or **one provider**; UI adapts.
- **Deprioritized** Sprouts: excluded from default “current focus” views but searchable and restorable.

---

## 5. Scope

### In scope (full product)

| Area | Description |
|------|-------------|
| **Plots** | Products, teams, or streams—organizational “where work lives.” |
| **Sprouts** | Ideas, initiatives, features, tasks—**primary Plot** for home accountability. |
| **Initiatives** | **First-class cross-plot programs** (customer events, migrations, company-wide themes). Link **≥ 1 Plot** (typically ≥ 2 for the intended use case); link many Sprouts; optional DRI, dates, narrative. |
| **Harvests** | **Release tracking**: named release, target/shipped dates, scope = set of Sprouts (and/or explicit version metadata). Support **multiple concurrent release lines** per org if needed (e.g. product A vs B). |
| **Planning model** | **Horizons** (daily → yearly) + **priority / lifecycle states** (e.g. Exploring, Committed, Active, Paused, Deprioritized, Done). **Sprints/cycles** are **optional** labels or views—**not** the only way to plan. |
| **Growth Timeline** | Narrative of progress per Sprout, Plot, Initiative, or Harvest-relevant slice. |
| **Ownership** | DRI on Sprout, Initiative, and Harvest (as applicable); delegation and teams (enterprise). |
| **AI-assisted elaboration** | From idea or feature Sprout: generate structured breakdown (tasks/sub-items) using **user-configured** LLM: **OpenAI**, **Anthropic Claude**, **Google Gemini**; org-level allowlist and API key strategy (BYOK vs platform-managed—see FRs). |
| **Startups** | Low-friction defaults: few Plots, optional Initiatives, AI off until ready. |
| **Enterprises** | SSO (SAML/OIDC), RBAC, org/workspace boundaries, audit logs, scale targets (NFRs). |
| **Integrations (phased)** | At minimum roadmap: GitHub / Jira / Slack **as connectors** for status or link-out (depth phased; not all in v1 engineering). |

### Out of scope (explicit)

- Replacing full **source control** or **CI/CD** execution inside Sproutly.
- **Fully automatic** roadmap prioritization without human approval (recommendation UIs may come later; human-in-the-loop for AI breakdown is default).
- **On-prem** deployment (unless a specific enterprise contract demands it—then treat as program, not default scope).
- Native **mobile apps** (responsive web first).

### Phased delivery note

Engineering may ship **capabilities in waves** (foundation → core objects → Initiatives → AI → enterprise hardening). **Phasing does not reduce the BRD’s target end state** above.

---

## 6. Functional Requirements

**FR-001 — Sprout lifecycle**  
**Requirement:** Create, read, update, archive/delete Sprouts with stable IDs.  
**Acceptance criteria:**

- Required fields: at least **title**; **primary Plot** (or explicit “Inbox” bucket).
- Changes persist; archived hidden from default lists unless filter includes archived.

**FR-002 — Plot as primary home**  
**Requirement:** Every Sprout has **exactly one primary Plot** (accountability and default filtering).  
**Acceptance criteria:**

- Moving primary Plot updates reports and default board membership.
- “Unsorted” or org-wide inbox allowed only if product defines it as a special Plot.

**FR-003 — Initiatives (cross-plot)**  
**Requirement:** Users can create **Initiatives** that **link multiple Plots** and **link many Sprouts** (Sprouts may also exist only under a Plot with no Initiative—both patterns supported).  
**Acceptance criteria:**

- Initiative detail shows linked Plots (≥ 1; warn if only one—still valid for future expansion).
- Sprout can be linked to **zero or more** Initiatives; link/unlink is permission-gated.
- Filters: “All work for Initiative X,” “Initiatives touching Plot Y.”
- Initiative has **DRI** (user or role) and optional **date range** / description.

**FR-004 — Ownership & delegation**  
**Requirement:** Assign owners (DRI) on Sprout, Initiative, and Harvest where applicable.  
**Acceptance criteria:**

- Owner visible on cards and detail; permission to change follows RBAC.
- Filter unassigned; enterprise: support **team** as display group (implementation detail).

**FR-005 — Flexible planning (non-sprint-first)**  
**Requirement:** Support **horizons** and **priority/lifecycle states** independent of sprint cadence. Optional **sprint/cycle** field or view for clients who use it.  
**Acceptance criteria:**

- User can set horizon without selecting a sprint.
- States include at least: **Paused** and **Deprioritized** (or equivalent) so work can be honestly reprioritized without deletion.
- Optional sprint: if set, Sprout appears in sprint view; if unset, still fully usable.

**FR-006 — Roadmap horizons**  
**Requirement:** Horizons from **daily through yearly** (org may enable a subset).  
**Acceptance criteria:**

- Persist horizon; roadmap/group views respect it; timezone/date rules documented.

**FR-007 — Status / delivery stage**  
**Requirement:** Configurable workflow stages from idea → delivery → released (org templates).  
**Acceptance criteria:**

- Valid transitions configurable; timeline reflects history.

**FR-008 — Harvest (release tracking)**  
**Requirement:** **Harvests** are the primary **release container**: name, identifier/version, target date, shipped date (optional), **scope = linked Sprouts** (and/or explicit “included work” rules).  
**Acceptance criteria:**

- Harvest detail lists scoped work; Sprout shows **target** and/or **actual** Harvest.
- Support **multiple Harvests** over time; avoid duplicate “shipped” claims (enforce or warn per product rules).
- Reporting: “What’s in this release?” exportable or shareable view.

**FR-009 — Growth Timeline**  
**Requirement:** Timeline views for Sprout, Plot, Initiative, and Harvest-scoped work.  
**Acceptance criteria:**

- Chronological ordering; handles partial dates; empty states graceful.

**FR-010 — New product vs new feature paths**  
**Requirement:** UX supports **(a)** greenfield: idea → new Plot optional → Sprouts; **(b)** existing Plot: new Sprout with feature description → elaboration.  
**Acceptance criteria:**

- Guided flows or templates for both; no dead-end for “idea only.”

**FR-011 — AI-assisted task breakdown**  
**Requirement:** From a Sprout (or defined parent entity), user can request **AI-generated** breakdown into sub-items (tasks/sub-Sprouts or attached checklist—data model TBD in architecture).  
**Acceptance criteria:**

- **Provider choice** among **OpenAI**, **Anthropic Claude**, and **Google Gemini** subject to **org configuration** (which providers are enabled).
- User reviews output before commit; can edit line items; can discard run.
- **Audit metadata** stored: model, provider, timestamp, user; **no API keys** in client-visible logs.
- **Rate limits** and **cost visibility** (at least admin-facing) when using platform-managed keys.

**FR-012 — AI configuration & governance**  
**Requirement:** Org admins can enable/disable AI, enable/disable per provider, and set **BYOK** (customer API keys) **or** use Sproutly-managed routing (if offered).  
**Acceptance criteria:**

- Disabled provider never called; UI does not offer it.
- Data processing terms surfaced (what text is sent to LLM) for enterprise review.

**FR-013 — Authentication & authorization**  
**Requirement:** Email/password or equivalent baseline; **enterprise: SSO (SAML/OIDC)**.  
**Acceptance criteria:**

- Roles at minimum: **Admin**, **Editor**, **Viewer** (expandable: custom roles enterprise).
- Editors cannot escalate without admin; viewers read-only.

**FR-014 — Workspace / org model**  
**Requirement:** Support **multiple workspaces or orgs** per customer for enterprise; clear boundary of data.  
**Acceptance criteria:**

- User sees only authorized workspaces; cross-workspace leakage prevented.

**FR-015 — Integrations (roadmap)**  
**Requirement:** Ability to **link** external issues/PRs or post notifications (GitHub, Jira, Slack)—**phased** depth.  
**Acceptance criteria:**

- Minimum phase: URL link + status sync or webhook **one direction** (specify per integration in downstream specs).

**FR-016 — Collaboration**  
**Requirement:** Multi-user concurrent use with **consistent saved state**; **real-time** presence optional enhancement.  
**Acceptance criteria:**

- No lost updates under normal concurrent edits (last-write-wins or merge strategy documented); real-time optional.

---

## 7. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| **NFR-Performance** | Performance | Roadmap and Initiative views **p75 LCP** within agreed SLO; list views paginate; targets scale to **enterprise catalog** (e.g. **10k+** Sprouts per workspace with pagination/filters). |
| **NFR-Reliability** | Reliability | Hosted SLA tiered by plan; backup/RPO/RTO documented for enterprise. |
| **NFR-Security** | Security | TLS; **secrets not logged**; encryption at rest for customer data; AI prompts/responses **retention policy** configurable (min: delete-on-request for certain tiers if promised). |
| **NFR-Privacy-AI** | Privacy (AI) | Clear disclosure of **subprocessors** per provider; option to **restrict** regions/models per org; BYOK keys stored in secure vault. |
| **NFR-A11y** | Accessibility | **WCAG 2.1 Level AA** for primary workflows. |
| **NFR-Observability** | Observability | Structured logs, metrics, tracing; correlation IDs. |
| **NFR-Audit** | Compliance | **Audit log** of security-relevant actions (login, SSO, role change, AI enablement, export) for enterprise tier. |
| **NFR-Compliance** | Compliance | GDPR-oriented data handling; enterprise DPA path; SOC2 **roadmap** as GTM requires. |

---

## 8. Assumptions & Constraints

### Assumptions

- **A1:** “Plot” often maps to **one software product** or **team**, but the model allows many Plots per org.
- **A2:** **Initiative** is the preferred name for cross-plot work (synonyms in UI: “Program,” “Theme” — optional localization).
- **A3:** Clients may **never** use sprints; product must remain usable.
- **A4:** AI features are **assistive**; humans accept/edit generated work.
- **A5:** Three LLM families (OpenAI, Anthropic, Google) cover most procurement asks; additional providers later.

### Constraints

- **C1:** Third-party LLM **availability and pricing** are external; product must **degrade gracefully** if a provider is down.
- **C2:** Some enterprises will **block** certain providers—**allowlist** is mandatory (FR-012).

---

## 9. Dependencies

| Dependency | Type | Owner | Risk if late |
|------------|------|-------|--------------|
| LLM APIs (OpenAI, Anthropic, Google) | External | Vendor | Feature flags; per-provider disable |
| IdP for SSO | External (customer) | Customer IT | Blocks enterprise deal |
| Email / notifications | Internal or SendGrid-class | Eng | Blocks engagement loops |
| Data store + search | Internal | Eng | Scales Initiative/cross filters |

---

## 10. Risks & Open Questions

### Risks

| Risk | L / I | Mitigation | Owner |
|------|-------|------------|--------|
| Initiative vs Epic confusion | M / M | Clear definitions in UX copy; training templates | Product |
| AI quality variance by provider | M / H | User review step; provider selection; eval set | Eng + Product |
| Enterprise AI data anxiety | H / H | BYOK + disclosure + retention controls | Security + Legal |
| Scope overlap with Jira | M / M | Position as **planning + release narrative**; integrations | GTM |

### Open questions

| # | Question | Owner |
|---|----------|--------|
| OQ-1 | Sub-Sprouts vs tasks vs checklist for AI output—**single entity** or mixed? | Architecture |
| OQ-2 | **Harvest** ↔ **versioning** (semver) — required fields for enterprise? | Product |
| OQ-3 | **Initiative** Gantt/timeline vs board-first? | Product + Design |
| OQ-4 | **Real-time** collab priority tier? | Product |

---

## 11. Ordering themes / sequencing

Deliverable milestones (**dependencies**, not calendar promises):

1. **Foundation** — Auth baseline, workspace shell, core UI patterns, observability.
2. **Plots & Sprouts** — FR-001, FR-002, FR-004 (basic), FR-006–FR-007, FR-010.
3. **Flexible planning** — FR-005, deprioritized/paused flows, optional sprint view.
4. **Initiatives** — FR-003 end-to-end + cross-Plot reporting and filters.
5. **Harvests** — FR-008 as **release system of record** + FR-009 alignment.
6. **AI elaboration** — FR-011, FR-012, NFR-Privacy-AI; ship with **one** provider first if needed, architecture for three.
7. **Enterprise** — FR-013, FR-014, NFR-Audit, SSO, scale hardening.
8. **Integrations & polish** — FR-015, FR-016 (real-time if prioritized), WCAG hardening.

**Depends on:** 2 before 3–4; 4 before deep cross-Plot analytics; 6 independent of 7 for pilot **if** BYOK-only; 7 before broad enterprise GA.

---

## Changelog

| Date | Change | Sections |
|------|--------|----------|
| 2026-03-20 | Initial BRD v1 from README + product-brd-generation skill | All |
| 2026-03-20 | **v2:** Full product scope — startups + enterprises; **Initiatives** (multi-Plot); flexible non-sprint planning; **Harvest** as release hub; **AI breakdown** (OpenAI / Claude / Gemini); enterprise SSO/RBAC/audit; integrations phased; expanded FRs/NFRs/personas/use cases | All |
