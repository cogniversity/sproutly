# Skill: Product BRD Generation (Cloud Agents)

Use this skill when the user asks for a **Business Requirements Document (BRD)**, **product spec**, **feature brief**, **MVP scope**, or similar. The goal is **execution-ready clarity** for startup teams—not enterprise paperwork.

---

## Principles

- **Clarity over completeness**: Every section should help someone ship or decide; omit ceremonial language.
- **Specific and testable**: Replace vague phrases (“fast,” “secure,” “scalable”) with measurable criteria or explicit acceptance checks.
- **Startup voice**: Write for PMs, engineers, and founders—direct, practical, low ceremony.
- **Bullets over prose**: Prefer short bullets; use a short paragraph only when context is essential.
- **Right depth**: Match depth to **BRD level** (see below). Do not default to maximum detail.

---

## When inputs are thin or ambiguous

Before drafting (or alongside a **draft marked “Assumptions”**), ask **targeted** clarifying questions. Group them; limit to what unblocks the BRD.

**Typical gaps to probe**

- **Problem & user**: Who hurts today, how, and why now?
- **Outcome**: What changes for the user or business if this ships?
- **Scope level**: Feature vs product vs MVP?
- **Constraints**: Timeline, budget, platform (web/mobile), compliance, locales?
- **Success**: How will we know it worked (leading + lagging signals)?
- **Stakeholders**: Who decides “done”? Any hard dependencies (legal, infra, partnerships)?

**If the user wants speed**: Produce a **v1 BRD** with explicit **Assumptions** and **Open Questions**, then offer to refine in one pass after answers.

---

## BRD levels (pick one per engagement)

| Level | Focus | Typical length | Emphasis |
|-------|--------|----------------|----------|
| **Feature** | One capability or flow | Short | User stories, acceptance criteria, edge cases, rollout |
| **Product** | Broader offering / initiative | Medium | Personas, roadmap themes, multiple workstreams, metrics |
| **MVP** | Smallest shippable slice | Shortest | Ruthless in/out of scope, “not now” list, validation plan |

State the chosen level at the top of the BRD (`**BRD level:** …`).

---

## Output structure (use these sections in order)

### 1. Overview

- **Problem**: What is broken or missing (for users and/or the business)?
- **Context**: Why this matters now (market, incident, strategy, dependency).
- **Goal**: One crisp sentence on the intended end state.

*Example (good)*: “Support agents re-type customer data across three tools; goal is one screen with synced CRM + ticket context.”  
*Example (weak)*: “Improve efficiency and user experience.” → Rewrite with who, what, and measurable intent.

### 2. Objectives & Success Metrics

- **Objectives**: 2–4 bullet outcomes (user + business).
- **Metrics**: For each objective, name **metric**, **baseline** (if unknown: “TBD”), **target**, **time window**, **owner** (role is fine).

Avoid vanity metrics unless paired with a quality or retention guardrail.

### 3. User Personas

- 1–3 personas max for startups.
- Per persona: **name/role**, **context**, **goal**, **pain**, **how they’ll use this**.

### 4. User Stories / Use Cases

- **User stories**: `As a [role], I want [capability], so that [outcome].`
- **Use cases** (when flows are complex): **Actor**, **Trigger**, **Main flow** (numbered), **Alternate / error paths**, **Acceptance criteria** (testable).

Include **edge cases** that affect scope or safety (permissions, empty states, offline, etc.).

### 5. Scope

- **In scope**: Bullets—each should be verifiable.
- **Out of scope**: Explicit “not building” list to prevent drift.

### 6. Functional Requirements

- Numbered requirements: **FR-001**, **FR-002**, …
- Each: **Requirement** + **Acceptance criteria** (given/when/then or checklist).
- Use **MoSCoW** tags only if the user asks (`Must / Should / Could / Won’t`).

### 7. Non-Functional Requirements

Cover only what matters for *this* initiative. Common buckets:

- **Performance** (e.g., p95 latency, page load, throughput).
- **Reliability** (uptime/SLO, recovery, data durability).
- **Security & privacy** (authn/z, PII handling, audit, retention).
- **Accessibility** (WCAG target if relevant).
- **Observability** (logs, metrics, alerts).
- **Compliance** (if applicable).

Each NFR should be **measurable** or **verifiable** (e.g., “Secrets not logged” vs “Be secure”).

### 8. Assumptions & Constraints

- **Assumptions**: Beliefs we’re proceeding on; flag ones that would change scope materially.
- **Constraints**: Hard limits (time, tech, policy, team).

### 9. Dependencies

- **Internal**: Teams, systems, data, feature flags.
- **External**: Vendors, APIs, app store review, legal sign-off.
- For each: **what**, **owner**, **risk if late**.

### 10. Risks & Open Questions

- **Risks**: Likelihood/impact (lightweight: H/M/L), **mitigation**, **owner**.
- **Open questions**: Unresolved decisions; tie each to **who** should answer and **by when** if known.

### 11. Milestones / Timeline (high-level roadmap)

- Phases such as *Discovery → Build → Beta → GA* (adjust to context).
- Per milestone: **deliverable**, **target window** (quarter/month/week as appropriate), **dependencies**.

Do not invent precise dates without input; use **relative** or **TBD** with what’s needed to firm dates.

---

## Practical patterns (examples)

**Turning vague into testable**

- Vague: “The system should be fast.”  
- Better: “Search returns first page in **p95 under 500ms** for catalogs up to **100k** items under normal load.”

**MVP scope discipline**

- In scope: “Email + password sign-up; email verification.”  
- Out of scope: “SSO, magic links, social login—evaluate after 100 active accounts.”

**User story with acceptance criteria**

- Story: “As a **team lead**, I want to **assign an owner to a Sprout**, so that **accountability is visible on the roadmap**.”
- AC: Owner appears on card; only editors can change; audit shows last change; unassigned allowed with warning banner.

---

## Iterative refinement (how this skill should work over multiple turns)

1. **Start from the user’s idea** → produce **Level-appropriate BRD v1** (or ask **minimal** clarifiers first if blocked).
2. **Label uncertainty**: Use **Assumptions** and **Open Questions** instead of stalling.
3. **Second pass**: After the user answers, **merge answers** into the BRD:
   - Remove resolved questions or move them to **Decisions log** (optional short subsection at end).
   - Tighten metrics, scope, and acceptance criteria.
4. **Diff-style narration**: Briefly state what changed (“Moved X to out-of-scope; added metric Y for objective Z”).
5. **Depth control**: On follow-up, **do not** expand every section by default—only deepen where new information applies.
6. **Decision focus**: Prefer updating **Scope**, **Functional requirements**, and **Risks** when tradeoffs emerge.

---

## Updating the BRD as new information appears

- **Minor facts** (metrics baseline, owner names, API version): Edit in place in the relevant section; keep wording tight.
- **Scope changes**: Update **In/Out of scope** and reconcile **Functional requirements**; flag conflicts explicitly.
- **New risks or dependencies**: Append to **Risks** / **Dependencies**; don’t bury them in narrative.
- **Major pivot**: Add a one-line **Revision note** at the top (`Last updated: …; Summary of change: …`) or maintain a tiny **Changelog** table at the bottom:

| Date | Change | Sections affected |
|------|--------|-------------------|
| … | … | … |

- **Source of truth**: Treat the BRD as the **current agreed picture**; if conversations diverge, align **Scope** and **Open Questions** first.

---

## Anti-patterns (avoid)

- Generic benefits with no owner or metric.
- Requirements that cannot be tested or demoed.
- Hiding ambiguity inside buzzwords.
- Enterprise-only artifacts (steer committees, RACI matrices) unless explicitly requested.

---

## Closing checklist (before handing off)

- [ ] BRD level stated (feature / product / MVP).
- [ ] Every functional requirement has acceptance criteria.
- [ ] NFRs included only where relevant—and are measurable where possible.
- [ ] Out-of-scope is explicit.
- [ ] Open questions have clear owners or next step.
- [ ] Document reads like a **build brief**, not a slide deck.
