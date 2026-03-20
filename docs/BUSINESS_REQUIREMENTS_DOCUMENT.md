# Sproutly — Business Requirements Document

**BRD level:** Product (multi-capability platform; **MVP slice** called out in Scope and Sequencing)

**Document status:** v1 — derived from repository `README.md` and product positioning; implementation today is a Next.js scaffold without product features.

---

## 1. Overview

### Problem

Product teams struggle to answer basic alignment questions: who owns what, when work ships, and how day-to-day execution connects to longer-term goals. Roadmaps and delivery tracking often live in separate tools or ad-hoc docs, which creates duplicate work, unclear accountability, and strategy drift.

### Context

Sproutly is positioned as a **modern product management platform** that links **execution with strategy** using a growth-oriented metaphor (Sprouts, Plots, Harvests, Growth Timeline). The README frames the audience as startups, founders, PMs, and engineering teams that want clarity without micromanagement.

### Goal

Give teams **one place** to capture work as Sprouts, organize it into Plots, plan across **daily → yearly** horizons, assign ownership, track delivery milestones (including Harvests), and see progress on a **Growth Timeline**—with explicit in/out of scope so the first shippable product is achievable.

---

## 2. Objectives & Success Metrics

| Objective | Metric | Baseline | Target | Time window | Owner |
|-----------|--------|----------|--------|-------------|--------|
| Reduce time to answer “who owns this?” | Median time for a new team member to identify owners for active initiatives | TBD | ≤ 2 minutes without asking in chat | 30 days post–MVP cohort | Product |
| Improve roadmap–execution alignment | % of active Sprouts linked to a Plot and a time horizon | TBD | ≥ 90% | Steady state post-MVP | Product |
| Make delivery expectations visible | % of in-flight Sprouts with a target milestone or Harvest | TBD | ≥ 80% | Steady state post-MVP | Product |
| Validate usefulness before heavy build | Weekly active teams (or workspaces) returning 3+ sessions/week | 0 | TBD with founder/PM | First 60 days after MVP | Product / Founder |

*Baselines marked TBD should be set during MVP design validation or first pilot.*

---

## 3. User Personas

### P1 — Alex, Product Manager (primary)

- **Context:** Juggles roadmap narrative, stakeholder updates, and engineering delivery.
- **Goal:** Keep strategy and execution visible in one system of record.
- **Pain:** Context switching across spreadsheets, slides, and issue trackers; ownership and dates go stale.
- **How they’ll use Sproutly:** Create and prioritize Sprouts, group into Plots, assign owners, plan horizons, communicate Harvests.

### P2 — Jordan, Engineering Lead

- **Context:** Needs clarity on priorities and ownership without hourly status noise.
- **Goal:** See what matters now and what’s next; know who decides tradeoffs.
- **Pain:** Roadmap decks don’t match the board; unclear DRI for initiatives.
- **How they’ll use Sproutly:** Filter by Plot/owner, update status on Sprouts, align sprints or cycles to Growth Timeline.

### P3 — Sam, Founder / Small-team operator

- **Context:** Wears PM + delivery hat; small team, high context cost.
- **Goal:** Lightweight structure that doesn’t slow the team down.
- **Pain:** Heavyweight PM tools feel like overhead; still needs a single picture of “what we’re growing.”
- **How they’ll use Sproutly:** Minimal viable structure—Plots as teams or projects, Sprouts as initiatives, simple timeline views.

---

## 4. User Stories & Use Cases

### User stories

- As a **PM**, I want to **capture an idea as a Sprout**, so that **it isn’t lost and can be prioritized**.
- As a **PM**, I want to **group Sprouts into a Plot**, so that **work is organized by product area or team**.
- As a **team lead**, I want to **assign an owner to a Sprout**, so that **accountability is visible on the roadmap**.
- As a **PM**, I want to **place a Sprout on a roadmap horizon (e.g. quarter vs month)**, so that **stakeholders see when we intend to focus on it**.
- As **any stakeholder**, I want to **see a Growth Timeline for a Plot or workspace**, so that **I understand progress from idea → delivery**.
- As a **PM**, I want to **define a Harvest (release) and attach Sprouts to it**, so that **we communicate what ships together**.

### Use case: Plan a quarterly focus

| Step | Description |
|------|-------------|
| **Actor** | PM (Alex) |
| **Trigger** | Planning cycle starts |
| **Main flow** | 1) Open workspace → 2) Review existing Sprouts → 3) Create/adjust Plots → 4) Assign owners → 5) Map Sprouts to horizons (e.g. This quarter) → 6) Share view with team |
| **Alternate** | Sprout deferred: move to “Later” horizon or backlog state; document reason (optional field). |
| **Errors** | Missing owner: show non-blocking indicator; filter “Unassigned” for triage. |
| **Acceptance (summary)** | Horizon assignment persists; owner visible on Sprout card; view can be filtered by Plot and horizon. |

### Edge cases (scope-relevant)

- Empty workspace: guided empty state to create first Plot + Sprout.
- Unassigned Sprouts: allowed with visible warning.
- Permissions: see **FR-008** and NFR Security—only users with edit rights may change owners, dates, or structure.

---

## 5. Scope

### In scope (product intent)

- **Domain model (conceptual):** Sprouts (features/tasks/initiatives), Plots (projects/teams/groupings), Harvests (releases/bundles), Growth Timeline (progress / lifecycle visualization).
- **Roadmap planning:** Multiple time granularities (daily, weekly, monthly, quarterly, yearly) as **views or attributes** on work items—not hourly micromanagement.
- **Ownership:** Assign and display responsible party per Sprout (or agreed entity).
- **Delivery tracking:** States or milestones from idea → development → release (exact state machine in FRs).
- **Single-workspace clarity:** For MVP, **one primary workspace** per deployment or account unless multi-workspace is explicitly prioritized (see Assumptions).

### In scope (MVP slice — recommended first shippable)

- CRUD for **Sprouts** and **Plots** with stable identifiers.
- **Owner** field on Sprout (string or user reference—see Open Questions).
- At least **one roadmap-style view** (e.g. board or list grouped by horizon) covering **two or more** horizons (e.g. Now / Next / Later or Month / Quarter).
- **Harvest** as a named milestone with **optional** association of Sprouts.
- **Growth Timeline** as a **read-oriented** visualization of status/history per Sprout or per Plot (level of detail TBD—minimum: ordered milestones or state transitions).
- **Persistence** sufficient for demo + pilot (see Assumptions—may be local/cloud DB).

### Out of scope (explicit “not now”)

- AI-assisted roadmap suggestions (README roadmap item).
- Team workload balancing beyond simple owner assignment and counts.
- Release prediction / ML insights.
- Integrations: GitHub, Jira, Slack.
- Real-time multi-user collaboration (presence, live cursors)—async refresh acceptable for MVP unless promoted.
- SSO, enterprise SAML, complex org hierarchies.
- Native mobile apps (responsive web only unless otherwise decided).

---

## 6. Functional Requirements

**FR-001 — Sprout lifecycle**  
**Requirement:** Users can create, view, edit, and archive (or delete) Sprouts.  
**Acceptance criteria:**

- Given a user with edit access, when they create a Sprout with title (required) and optional description, then it appears in the default list and has a stable ID.
- Given a Sprout, when the user edits fields, then changes persist after refresh.
- Given a Sprout, when the user archives/deletes per product rules, then it no longer appears in default active views (or appears only in “Archived” per UX).

**FR-002 — Plot organization**  
**Requirement:** Users can create Plots and associate Sprouts with exactly one Plot at a time (unless product explicitly allows many-to-many later).  
**Acceptance criteria:**

- Sprout creation/editing includes Plot assignment (or “Unsorted” bucket).
- Filtering by Plot shows only matching Sprouts.

**FR-003 — Ownership**  
**Requirement:** Each Sprout has an **owner** (person or role label per Open Questions).  
**Acceptance criteria:**

- Owner displayed on Sprout summary and detail.
- Only users with edit permission can change owner.
- Workspace can list/filter “Unassigned” Sprouts.

**FR-004 — Roadmap horizons**  
**Requirement:** Sprouts can be positioned against **time horizons** (from the set: daily, weekly, monthly, quarterly, yearly—or a simplified MVP subset).  
**Acceptance criteria:**

- User can set or change horizon; value persists.
- Roadmap view groups or sorts by horizon correctly.
- Changing timezone display (if applicable) does not corrupt stored horizon choice (document behavior if using calendar dates vs enum).

**FR-005 — Status / delivery stage**  
**Requirement:** Sprouts progress through defined stages (e.g. Idea → In development → Ready for release → Released—exact labels configurable).  
**Acceptance criteria:**

- Valid transitions enforced (no invalid jumps if rules defined).
- Growth Timeline reflects stage changes in order.

**FR-006 — Harvest (release)**  
**Requirement:** Users can create Harvests and link Sprouts to a Harvest.  
**Acceptance criteria:**

- Harvest has name and optional date.
- Linked Sprouts show Harvest association; removing link updates both sides consistently.

**FR-007 — Growth Timeline**  
**Requirement:** For a selected Sprout or Plot, user can open a **Growth Timeline** showing key progression (states, dates, or milestones).  
**Acceptance criteria:**

- Timeline renders with no errors for Sprouts with partial data (empty sections handled).
- Events appear in chronological order where dates exist.

**FR-008 — Access control (MVP)**  
**Requirement:** Workspace supports **authenticated** users with at least **viewer** vs **editor** roles, **or** a documented interim mode (e.g. single shared demo) with a path to auth.  
**Acceptance criteria:**

- Editors can mutate; viewers cannot (verified by API or UI).
- If interim mode: BRD Assumptions document risk and sunset criterion.

---

## 7. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| **NFR-Performance** | Performance | Primary list and roadmap views achieve **LCP p75 < 2.5s** on a reference broadband connection for workspaces with **≤ 500** active Sprouts (adjust targets when baselines exist). |
| **NFR-Reliability** | Reliability | User actions (create/update Sprout) succeed or show explicit error; no silent data loss. **RTO** for pilot: best effort same-day restore from backup if hosted DB used. |
| **NFR-Security** | Security & privacy | Authenticated sessions; **secrets not logged**; if storing emails/names, document retention and minimum PII principle. |
| **NFR-A11y** | Accessibility | Core flows keyboard-operable; target **WCAG 2.1 Level AA** for customer-facing UI when UI stabilizes (MVP: no known blockers on primary path). |
| **NFR-Observability** | Observability | Server errors logged with correlation ID; client shows user-safe message on failure. |
| **NFR-Compliance** | Compliance | No special compliance claimed unless product scope expands (e.g. SOC2)—TBD. |

---

## 8. Assumptions & Constraints

### Assumptions

- **A1:** Initial implementation stack aligns with repo: **Next.js (React, TypeScript, Tailwind)** per `AGENTS.md`; README’s Express/PostgreSQL are **examples**—actual persistence may evolve (PostgreSQL or other) without changing core domain concepts.
- **A2:** **MVP** targets **small teams** (roughly &lt; 25 people) and **low concurrent editors**; real-time sync not required day one.
- **A3:** “Owner” may be **display name string** for MVP if full user directory is deferred.
- **A4:** **Single workspace** per account is acceptable for first pilot; multi-tenant org model can follow.

### Constraints

- **C1:** No mandatory dependency on external PM tools for MVP.
- **C2:** Team capacity for integration and AI features is **zero** until explicitly re-scoped (see Out of scope).

---

## 9. Dependencies

| Dependency | Type | Owner | Risk if late |
|------------|------|-------|--------------|
| Auth provider or custom auth | Internal / technical | Engineering | Blocks FR-008 and any multi-user pilot |
| Data store selection (e.g. Postgres) | Internal | Engineering | Blocks durable MVP |
| Design system / UI patterns (Tailwind) | Internal | Design + Eng | Impacts consistency and a11y velocity |

---

## 10. Risks & Open Questions

### Risks

| Risk | L / I | Mitigation | Owner |
|------|-------|------------|--------|
| Scope creep into “full Jira replacement” | H / H | Enforce Out of scope; tie features to FR IDs | Product |
| Horizon model confusion (enum vs dates) | M / M | Prototype one approach; document in UX + API | Product + Eng |
| MVP without auth in production | H / H | Ship with auth or gated pilot only | Eng |

### Open questions

| # | Question | Decision owner | Notes |
|---|----------|----------------|-------|
| OQ-1 | Sprout ↔ Plot: **strict 1:1** vs many-to-many? | Product | BRD assumes 1 Plot per Sprout for MVP simplicity |
| OQ-2 | Owner field: **linked user** vs free text? | Product + Eng | Affects auth and reporting |
| OQ-3 | Minimum horizon set for MVP (full five vs Now/Next/Later)? | Product | Affects UX complexity |
| OQ-4 | Harvest **required** for release tracking or optional tag? | Product | README implies metaphor importance |

---

## 11. Ordering themes / sequencing

Milestone names describe **deliverable truth**, not calendar dates.

1. **Foundation ready** — Repo app shell, styling approach, environments documented; error handling baseline (NFR-Observability).
2. **Core objects shippable** — Sprouts + Plots CRUD with persistence (FR-001, FR-002).
3. **Accountability layer** — Owners + filters (FR-003).
4. **Roadmap slice** — Horizons + primary roadmap view (FR-004).
5. **Delivery narrative** — Status model + Growth Timeline v1 (FR-005, FR-007).
6. **Harvest association** — FR-006.
7. **Access control** — FR-008 (or documented gated release).
8. **Hardening for pilot** — Performance spot-check (NFR-Performance), a11y pass on primary flows, backup/restore if hosted DB.

**Dependencies:** 2 before 3–4; 4 can parallelize partially with 5 once Sprout model stable; 6 after Sprouts stable; 7 before any public multi-user pilot; 8 last before widening access.

---

## Changelog

| Date | Change | Sections |
|------|--------|----------|
| 2026-03-20 | Initial BRD v1 from README + product-brd-generation skill | All |
