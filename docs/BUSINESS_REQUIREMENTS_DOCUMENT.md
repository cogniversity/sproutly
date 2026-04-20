# Sproutly — Business Requirements Document

**BRD level:** Product (full product vision — startups **and** enterprises building software; phased delivery is an implementation concern, not a scope ceiling)

**Document status:** v4 — **Leadership / stakeholder reporting** (qualitative “what’s happening,” not metrics-first dashboards); **status digest email** (in progress, recently done, on hold, stuck) with template + preview; v3 retained: admin-only AI, **DB users** (no SSO in current phase); SMTP send still phased.

---

## 1. Overview

### Problem

Software organizations—whether startups or enterprises—struggle to keep **strategy, ownership, and delivery** in one coherent picture. Work is split across products (“Plots”), but **real efforts often cut across them**: a customer visit requiring **custom demos of several products**, a **platform or infrastructure program** that touches multiple product lines, or a **new feature** on an existing product that must be **broken into executable work** quickly. Tools that assume **one item → one product** or **rigid sprint cadence** break when priorities shift weekly and teams “start something” then **reprioritize** without abandoning the idea.

### Context

Sproutly is a **product management platform** that connects execution with strategy using a growth metaphor (**Sprouts**, **Plots**, **Harvests**, **Growth Timeline**). Clients ship software; they need **flexible time horizons** (not mandatory scrum), **cross-cutting Initiatives**, **Harvests** as the anchor for **what releases together**, and optional **AI-assisted breakdown** of ideas and features into tasks. **Which LLM provider and API credentials apply** is configured **only by a client/workspace admin**; **other personas never see provider, model, or keys** (generic “AI assist” experience when enabled).

### Goal

Provide **one system of record** where teams can: organize work by **Plot** (product/team/stream); model **Initiatives that span multiple Plots**; plan with **horizons and priorities that tolerate change**; track **releases via Harvests**; visualize **Growth Timelines**; and use **AI to elaborate** new ideas or features into detailed work items—backed by **custom database–based users and roles** (no external IdP required in the current phase). **Leaders and stakeholders** must be able to see **what is happening** through **purpose-built status reporting** (narrative / feature-level, not vanity metrics) and, via email, a **status digest** summarizing **work in progress**, **recently completed**, **on hold**, and **stuck** items. **Email**: **template authoring, preview, and digest composition** in product; **outbound SMTP (or similar) delivery** follows in a later milestone.

---

## 2. Objectives & Success Metrics

| Objective | Metric | Baseline | Target | Time window | Owner |
|-----------|--------|----------|--------|-------------|--------|
| Single place for “who / what / when” | Median time for a new member to answer ownership + release target for active work | TBD | ≤ 2 min without chat | Per release / cohort | Product |
| Cross-product visibility | % of registered cross-plot Initiatives with linked Plots ≥ 2 and a DRI | TBD | 100% of created Initiatives | Steady state | Product |
| Release clarity | % of shipped Sprouts (or epics) associated with a **Harvest** when org policy requires it | TBD | Configurable target (e.g. ≥ 90%) | Per quarter | Product / CS |
| Planning flexibility | User-reported fit: “Supports how we actually plan” (survey 1–5) | TBD | ≥ 4.0 | Rolling | Product |
| AI usefulness | % of AI-assisted breakdown sessions where user **accepts or edits** ≥ 50% of generated tasks | TBD | ≥ TBD with PM | Post-launch AI | Product |
| Admin & access hygiene | Workspace admins can manage **DB-backed** users and roles; AI settings restricted to admin | N/A | Per FR-012 / FR-013 | Rolling | Eng + Security |
| Leadership clarity | Leaders report they can answer “what’s in flight, what finished, what’s stuck or parked” **without** exporting to slides | TBD | ≥ 4.5 / 5 on internal survey | Rolling | Product |
| Digest usefulness | Recipients of **status digest** (preview or sent) rate it **actionable** vs noise | TBD | ≥ TBD with PM | Post-launch | Product |

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

### P4 — Morgan, Workspace admin / IT (enterprise)

- **Context:** User lifecycle, roles, data handling, **which AI vendor/key the org uses** (procurement, policy).
- **Goal:** Control **users in Sproutly’s database**, RBAC, and **AI configuration** without exposing keys or vendor choice to PMs/ICs.
- **Pain:** Leaky settings UI; everyone sees API keys or model pickers.
- **Uses Sproutly:** **Admin-only** settings: users, roles, **AI provider + key**, data-processing notes for LLM use. **Does not** expect end users to see provider branding in app copy (keep generic).

### P5 — Sam, Founder / Startup IC

- **Context:** Small team; may start from **raw idea** or single product.
- **Goal:** Grow structure as needed; no mandatory sprint overhead.
- **Pain:** Heavy PM tools; still needs releases and clarity.
- **Uses Sproutly:** Idea → Sprout → optional AI tasking; simple Plots; Harvest when shipping.

### P6 — Dana, Engineering / Product Leader (exec or senior IC)

- **Context:** Needs a **credible picture of delivery** across Plots and Initiatives without digging through every board.
- **Goal:** See **what’s actively moving**, **what just shipped**, **what’s on hold or deprioritized**, and **what’s stuck**—as **names and short status**, not primarily dashboards of counts.
- **Pain:** Status meetings rehash lists; email threads replace a system of record.
- **Uses Sproutly:** **Leadership status** view (FR-018); optional **status digest** email (FR-019); filters by Plot / Initiative / workspace.

---

## 4. User Stories & Use Cases

### User stories (representative)

- As a **PM**, I want to **capture a net-new product idea**, so that **it can mature from concept to scoped work without losing context**.
- As a **PM**, I want to **add a major feature to an existing product (Plot)**, so that **I can refine it into tasks (manually or with AI)**.
- As a **PM**, I want to **create an Initiative spanning multiple Plots**, so that **cross-product efforts (demos, migrations, programs) have one DRI and one narrative**.
- As a **lead**, I want to **mark work as active, paused, or deprioritized** without deleting it, so that **priority churn is honest and history remains**.
- As a **PM**, I want to **plan with horizons (not only sprints)**, so that **teams that don’t run strict sprints still get roadmap clarity**.
- As a **release manager**, I want **Harvests to define what ships together**, so that **release tracking is explicit and communicable**.
- As a **workspace admin**, I want to **set the AI provider and API key for my organization**, so that **procurement and security stay centralized** and **no other users see vendor or secrets**.
- As a **PM or IC**, I want to **run “Elaborate with AI”** when my admin has enabled it, so that **I get suggestions without needing to know or choose a model provider**.
- As an **admin**, I want **database-backed users and roles**, so that **access is manageable without an external IdP in the first phase**.
- As a **leader**, I want a **summary of work in progress, recently done, on hold, and stuck**, so that **I know what’s happening without a metrics-heavy dashboard**.
- As a **stakeholder**, I want to **receive (or preview) a status digest email** with those same buckets, so that **I stay aligned when I’m not in the tool daily**.

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
| **Acceptance** | Cross-Plot **visibility** in Initiative and Harvest views; Harvest(es) show scope of coordinated release/cutover. |

### Use case: New feature on existing product — AI task breakdown

| Step | Description |
|------|-------------|
| **Actor** | PM or tech lead |
| **Trigger** | Feature approved at epic level; needs engineering tasks |
| **Main flow** | 1) Sprout lives in correct Plot → 2) User opens “Elaborate with AI” (only if admin enabled AI) → 3) **No provider picker**—server uses admin-configured provider/key → 4) Review generated tasks/sub-Sprouts → 5) Accept, edit, or reject; audit trail stores prompt hash / model / timestamp **for admin/compliance** (non-admins do not see vendor details in UI) |
| **Acceptance** | Output attaches to parent Sprout; permissions respected; **no API keys** in any client; non-admin UI does not disclose LLM vendor or model. |

### Use case: Leadership check-in / status digest

| Step | Description |
|------|-------------|
| **Actor** | Leader (Dana) or PM preparing for exec sync |
| **Trigger** | Weekly leadership review or ad-hoc “where are we?” |
| **Main flow** | 1) Open **Leadership / status** view (scope: workspace, Plot, or Initiative) → 2) Scan sections **In progress**, **Done (recent)**, **On hold**, **Stuck** → 3) Optionally **preview** the **status digest** email with the same sections populated from live data → 4) When SMTP exists, send digest to a defined recipient list |
| **Acceptance** | Each section lists relevant Sprouts (or agreed rollup entity) with **title, owner, short status**; empty sections show a clear empty state; **digest preview** matches in-app semantics; permissions respected (no cross-workspace leakage). |

### Edge cases

- Initiative with **zero** Sprouts yet (planning shell).
- Sprout in **one primary Plot** but linked to **multiple Initiatives** (allowed with clear UX to avoid clutter).
- Org **disables AI**; “Elaborate with AI” hidden or disabled for editors. **Misconfigured key** (admin-only error surfaces; ICs see generic failure message).
- **Deprioritized** Sprouts: excluded from default “current focus” views but searchable and restorable.

---

## 5. Scope

### In scope (full product)

| Area | Description |
|------|-------------|
| **Plots** | Products, teams, or streams—organizational “where work lives.” |
| **Sprouts** | Ideas, features, bugs, technical work, and tasks—**primary Plot** for home accountability. |
| **Initiatives** | **First-class cross-plot programs** (customer events, migrations, company-wide themes). Link **≥ 1 Plot** (typically ≥ 2 for the intended use case); link many Sprouts; optional DRI, dates, narrative. |
| **Harvests** | **Release tracking**: named release, target/shipped dates, scope = set of Sprouts (and/or explicit version metadata). Support **multiple concurrent release lines** per org if needed (e.g. product A vs B). |
| **Planning model** | **Horizons** (daily → yearly) + **priority / lifecycle states** (e.g. Exploring, Committed, Active, Paused, Deprioritized, Done). **Sprints/cycles** are **optional** labels or views—**not** the only way to plan. |
| **Growth Timeline** | Narrative of progress per Sprout, Plot, Initiative, or Harvest-relevant slice. |
| **Ownership** | DRI on Sprout, Initiative, and Harvest (as applicable); delegation and teams (enterprise). |
| **AI-assisted elaboration** | From idea or feature Sprout: generate structured breakdown using an LLM **chosen and credentialed only by workspace admin** (implementation supports **OpenAI**, **Anthropic Claude**, **Google Gemini** behind the scenes). **Non-admin users** have **no visibility** into provider, model, or keys. |
| **Startups** | Low-friction defaults: few Plots, optional Initiatives, AI off until admin configures. |
| **Enterprises** | **Custom DB-backed** users, roles, org/workspace boundaries; audit logs where specified (NFRs). **SSO/SAML** is **out of scope for the current phase** (may return on roadmap). |
| **Leadership & stakeholder reporting** | **In-app** views aimed at **leaders and stakeholders**: qualitative roll-ups of work **in progress**, **recently completed**, **on hold**, and **stuck** (see FR-018). **Not** a metrics-first BI product—**feature/status narrative** first. |
| **Email (phase 1)** | **Template authoring** (create/edit) and **preview**, including a **status digest** layout that mirrors FR-018 (**FR-017**, **FR-019**). **No requirement** for outbound SMTP in the same milestone as first preview. |
| **Integrations (phased)** | At minimum roadmap: GitHub / Jira / Slack **as connectors** for status or link-out (depth phased; not all in v1 engineering). |

### Out of scope (explicit)

- **General-purpose BI / data warehouse** (arbitrary SQL, custom cube analytics, embedded third-party BI suites). **Sproutly-native** leadership and status views **are** in scope (FR-018).
- **Outbound email delivery** (SMTP, SES, etc.) in the **same phase** as first template + digest **preview**—**planned later** (sequencing §11).
- **SSO / SAML / OIDC** for the **current** identity phase (custom DB users only until re-scoped).
- Replacing full **source control** or **CI/CD** execution inside Sproutly.
- **Fully automatic** roadmap prioritization without human approval (recommendation UIs may come later; human-in-the-loop for AI breakdown is default).
- **On-prem** deployment (unless a specific enterprise contract demands it—then treat as program, not default scope).
- Native **mobile apps** (responsive web first).

### Phased delivery note

Engineering may ship **capabilities in waves** (foundation → core objects → status model → **leadership views + digest preview** → Initiatives → AI admin + assist → enterprise hardening without SSO → SMTP). **Phasing does not reduce the BRD’s target end state** above (except items explicitly **out of scope** for the current phase, e.g. SSO, general-purpose BI, initial SMTP).

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

- Moving primary Plot updates default views and board membership.
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
- Harvest **detail view** lists scoped work; may link to **leadership / status** views (FR-018) where helpful.

**FR-009 — Growth Timeline**  
**Requirement:** Timeline views for Sprout, Plot, Initiative, and Harvest-scoped work.  
**Acceptance criteria:**

- Chronological ordering; handles partial dates; empty states graceful.

**FR-010 — New product vs new feature paths**  
**Requirement:** UX supports **(a)** greenfield: idea → new Plot optional → Sprouts; **(b)** existing Plot: new Sprout with feature description → elaboration.  
**Acceptance criteria:**

- Guided flows or templates for both; no dead-end for “idea only.”

**FR-011 — AI-assisted task breakdown**  
**Requirement:** From a Sprout (or defined parent entity), a user with appropriate permission can request **AI-generated** breakdown into sub-items (tasks/sub-Sprouts or attached checklist—data model TBD in architecture).  
**Acceptance criteria:**

- **No end-user or editor UI** to select **OpenAI vs Claude vs Gemini** or to enter API keys; the **active provider and credentials** are **only** those set by **workspace admin** (FR-012).
- If AI is disabled or misconfigured, editors see **generic** messaging (“AI assist unavailable”); **not** raw provider error strings that identify the vendor.
- User reviews output before commit; can edit line items; can discard run.
- **Audit metadata** stored server-side: model, provider, timestamp, acting user—**visible only to roles allowed** (e.g. Admin); **no API keys** in logs or API responses.
- **Rate limits** enforced server-side; **usage/cost indicators** (if any) **admin-only**.

**FR-012 — AI configuration (admin-only)**  
**Requirement:** **Only workspace admins** (or a narrower “Settings” role) can: enable/disable AI for the workspace; select **one configured backend** among supported providers (**OpenAI**, **Anthropic Claude**, **Google Gemini**); store and update the **API key** (or equivalent secret) **server-side**.  
**Acceptance criteria:**

- **Non-admin** users **cannot** access AI settings routes or APIs; UI **never** shows provider name, model, or key to **Editor/Viewer** personas (including error toasts, help text, and “about” copy—use generic “AI assist”).
- After save, keys are **never** returned in full to the client (masked or omit); rotation supported by replace.
- Disabled AI: **no** LLM calls; “Elaborate” hidden or disabled for non-admins.
- Admin-facing short disclosure: **what content** may be sent to the LLM (for policy).

**FR-013 — Authentication & authorization (custom DB users)**  
**Requirement:** **Users, credentials (hashed), and roles** live in the **application database** (custom user management). Support **sign-up / invite / login / logout** and **role assignment** by admin. **SSO/SAML/OIDC** is **not** in scope for this phase.  
**Acceptance criteria:**

- Roles at minimum: **Admin**, **Editor**, **Viewer** (expandable later).
- Editors cannot escalate privileges; viewers read-only.
- Until **SMTP outbound** exists (future), flows that would normally email users (e.g. invite, password reset) use an **interim** approach documented in implementation (e.g. admin-set password, one-time link shown once in UI, or template **preview-only**)—see FR-017.

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

**FR-017 — Email templates (authoring & preview)**  
**Requirement:** Admins (or designated editors) can **create and edit** email **templates** (subject + body with merge fields). Users can **preview** rendered output (sample data or **live workspace context** as designed).  
**Acceptance criteria:**

- Template catalog includes at least: **(a)** operational template (e.g. invite or account-related—exact label in UX spec) and **(b)** **status digest** structure per **FR-019**.
- Preview shows final HTML/text as it **would** send once delivery exists.
- **Outbound sending** via SMTP (or provider) is **explicitly out of scope** for this FR’s completion—no production mail path required until a later milestone.

**FR-018 — Leadership & stakeholder status (in-app reporting)**  
**Requirement:** Role-appropriate users (e.g. **Viewer** and above, or a future **Leader** role—RBAC in FR-013) can open a **Leadership / status** experience scoped by **workspace**, and optionally filtered by **Plot** and/or **Initiative**. The view is organized into **four narrative sections** (not KPI dashboards):  
1. **In progress** — active, in-flight Sprouts (or agreed rollup).  
2. **Done (recent)** — completed **within a configurable time window** (default e.g. last 14 days, product-defined).  
3. **On hold** — explicitly **paused**, **deprioritized**, or equivalent lifecycle states from FR-005 / FR-007.  
4. **Stuck** — items flagged **blocked** and/or matching an org rule (e.g. no stage movement for **N** days—**N** configurable or template default).  

**Acceptance criteria:**

- Each listed item shows at least **title**, **owner** (or “Unassigned”), and **short status** (stage + optional note).
- **Primary value is qualitative lists**; optional **small counts** per section are allowed but must not dominate the layout.
- Empty sections: clear messaging (“Nothing stuck this week”).
- Respects permissions: user sees only authorized workspaces and Plots; **no** cross-tenant data.
- Export to **PDF or static share link** is **optional** later—not required for FR-018 completion.

**FR-019 — Status digest email (content + preview; send later)**  
**Requirement:** The product supports a **status digest** email that **mirrors FR-018**: same four sections (**In progress**, **Done (recent)**, **On hold**, **Stuck**) populated from **live** workspace data. Recipients and schedule are **configuration** (when SMTP exists); for the **preview phase**, user can generate **preview for a chosen scope** (workspace / Plot / Initiative) and recipient list **simulation** (optional).  
**Acceptance criteria:**

- Digest **preview** renders the four sections with the **same inclusion rules** as FR-018 (document shared logic / single source of truth in architecture).
- Copy is **narrative** (feature names + status)—not a chart of numbers.
- **SMTP / actual send** out of scope for FR-019 completion until the **outbound email** milestone (§11).

---

## 7. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| **NFR-Performance** | Performance | Roadmap and Initiative views **p75 LCP** within agreed SLO; list views paginate; targets scale to **enterprise catalog** (e.g. **10k+** Sprouts per workspace with pagination/filters). |
| **NFR-Reliability** | Reliability | Hosted SLA tiered by plan; backup/RPO/RTO documented for enterprise. |
| **NFR-Security** | Security | TLS; **secrets not logged**; encryption at rest for customer data; AI prompts/responses **retention policy** configurable (min: delete-on-request for certain tiers if promised). |
| **NFR-Privacy-AI** | Privacy (AI) | **Admin-facing** disclosure of **subprocessors** / data flow for the **active** provider; **customer API keys** (admin-entered) stored in a **secure vault**, never echoed to non-admin clients. |
| **NFR-A11y** | Accessibility | **WCAG 2.1 Level AA** for primary workflows. |
| **NFR-Observability** | Observability | Structured logs, metrics, tracing; correlation IDs. |
| **NFR-Audit** | Compliance | **Audit log** of security-relevant actions (login, role change, AI settings change, user invite) for **admin review in product**. Distinct from **FR-018** leadership reporting (operational security vs delivery visibility). |
| **NFR-Compliance** | Compliance | GDPR-oriented data handling; enterprise DPA path; SOC2 **roadmap** as GTM requires. |

---

## 8. Assumptions & Constraints

### Assumptions

- **A1:** “Plot” often maps to **one software product** or **team**, but the model allows many Plots per org.
- **A2:** **Initiative** is the preferred name for cross-plot work (synonyms in UI: “Program,” “Theme” — optional localization).
- **A3:** Clients may **never** use sprints; product must remain usable.
- **A4:** AI features are **assistive**; humans accept/edit generated work.
- **A5:** Three LLM families (OpenAI, Anthropic, Google) cover most procurement asks; additional providers later.
- **A6:** **Only admins** configure which of those backends is active; product copy for ICs stays **vendor-neutral**.
- **A7:** Identity is **Sproutly-owned** (DB users) until SSO is explicitly added to scope.

### Constraints

- **C1:** Third-party LLM **availability and pricing** are external; product must **degrade gracefully** if a provider is down.
- **C2:** Some enterprises will **block** certain providers—**admin** selects an allowed provider for the workspace; non-admins never see alternatives.

---

## 9. Dependencies

| Dependency | Type | Owner | Risk if late |
|------------|------|-------|--------------|
| LLM APIs (OpenAI, Anthropic, Google) | External | Vendor + **admin key** | Admin disables AI or switches provider |
| SMTP / email provider | External | Eng / Ops | **Deferred** until after FR-017; templates + preview unblock first |
| Data store + search | Internal | Eng | Scales Initiative/cross filters |

---

## 10. Risks & Open Questions

### Risks

| Risk | L / I | Mitigation | Owner |
|------|-------|------------|--------|
| Initiative vs Epic confusion | M / M | Clear definitions in UX copy; training templates | Product |
| AI quality variance by provider | M / H | User review step; **admin** can switch provider/key; eval set | Eng + Product |
| Enterprise AI data anxiety | H / H | **Admin-only** keys + **admin** disclosure + retention controls | Security + Legal |
| Scope overlap with Jira | M / M | Position as **planning + release narrative**; integrations | GTM |
| Invite/password flows without SMTP | M / M | Document interim pattern in FR-013; ship FR-017 preview | Eng |

### Open questions

| # | Question | Owner |
|---|----------|--------|
| OQ-1 | Sub-Sprouts vs tasks vs checklist for AI output—**single entity** or mixed? | Architecture |
| OQ-2 | **Harvest** ↔ **versioning** (semver) — required fields for enterprise? | Product |
| OQ-3 | **Initiative** Gantt/timeline vs board-first? | Product + Design |
| OQ-4 | **Real-time** collab priority tier? | Product |
| OQ-5 | Which **email templates** are mandatory for v1 beyond **status digest** (invite, password reset, etc.)? | Product |
| OQ-6 | **“Stuck”** definition: **blocked flag only** vs **blocked OR stale** (no progress in **N** days)—default **N**? | Product + Eng |

---

## 11. Ordering themes / sequencing

Deliverable milestones (**dependencies**, not calendar promises):

1. **Foundation** — **DB-backed** auth baseline (FR-013), workspace shell, core UI patterns, observability; **FR-017** template storage + preview when auth flows need it.
2. **Plots & Sprouts** — FR-001, FR-002, FR-004 (basic), FR-006–FR-007, FR-010.
3. **Flexible planning** — FR-005, deprioritized/paused flows, optional sprint view.
4. **Initiatives** — FR-003 end-to-end + cross-Plot filters and Initiative detail.
5. **Leadership status & digest preview** — FR-018 (in-app) + **FR-019 preview** + **FR-017** templates (depends on FR-005 / FR-007 for states **stuck** / **on hold** semantics).
6. **Harvests** — FR-008 as **release system of record** + FR-009 alignment.
7. **AI elaboration** — FR-011, FR-012, NFR-Privacy-AI; ship with **one** provider first if needed, architecture for three.
8. **Enterprise hardening (without SSO)** — FR-014, NFR-Audit, scale, security review (**SSO** remains future unless re-scoped).
9. **Integrations & polish** — FR-015, FR-016 (real-time if prioritized), WCAG hardening.
10. **Outbound email** — SMTP (or provider) + send **FR-017 / FR-019** digests and other templates (**after** preview ships).

**Depends on:** FR-018/019 logic shared—implement **one** “status summary” source; **SMTP** after preview; SSO not a gate for current BRD.

---

## Changelog

| Date | Change | Sections |
|------|--------|----------|
| 2026-03-20 | Initial BRD v1 from README + product-brd-generation skill | All |
| 2026-03-20 | **v2:** Full product scope — startups + enterprises; **Initiatives** (multi-Plot); flexible non-sprint planning; **Harvest** as release hub; **AI breakdown** (OpenAI / Claude / Gemini); enterprise SSO/RBAC/audit; integrations phased; expanded FRs/NFRs/personas/use cases | All |
| 2026-03-20 | **v3:** **Admin-only** AI provider + key; **opaque** to other personas; **custom DB users** (SSO out for current phase); **no reporting product**; **email templates + preview**; SMTP later (**FR-017**); NFR-Audit without reporting framing | All |
| 2026-03-20 | **v4:** **Leadership / stakeholder reporting** (**FR-018**)—qualitative buckets: in progress, recently done, on hold, stuck; **status digest email** (**FR-019**) + **FR-017**; **out of scope** narrowed to general BI/warehouse only; metrics deprioritized vs narrative | Overview, Scope, FRs, Sequencing, Personas, Metrics |
