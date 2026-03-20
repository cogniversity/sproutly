# 🌱 Sproutly

Grow your product with clarity. Plan roadmaps, track ownership, and see what’s actually happening—from **ideas** to **releases**—without forcing every team into the same sprint-shaped box.

Sproutly is a product management platform for **startups and enterprises** that ship software. It connects **execution with strategy** using a simple metaphor: **Sprouts** (the work), **Plots** (where it lives—products, teams, or streams), **Initiatives** (efforts that cut across Plots), and **Harvests** (what ships together).

---

## Why Sproutly?

Teams struggle to answer:

* Who owns what—and what’s **in progress**, **recently done**, **on hold**, or **stuck**?
* How does today’s work connect to longer-term goals?
* How do you track work that **spans multiple products** (a big customer visit, a platform migration) in one place?

Sproutly is built for **honest prioritization**: you can pause or deprioritize without losing history, plan with **horizons** (daily → yearly) even when you don’t run rigid sprints, and give **leaders a narrative view** of status—not a wall of vanity metrics.

---

## Core concepts

| Concept | What it is |
|--------|------------|
| **Sprout** | An idea, feature, task, or initiative—something you’re growing from concept to delivery. |
| **Plot** | The primary “home” for a Sprout—usually a product, team, or stream. |
| **Initiative** | A program that **links multiple Plots** (e.g. multi-product demos, cross-cutting infra). Sprouts can belong to a Plot and tie into Initiatives. |
| **Harvest** | A **release**: what goes out together, with target and shipped context. |
| **Growth timeline** | How progress reads over time—for a Sprout, Plot, Initiative, or release. |

---

## What you can do

### Roadmap & planning

* Map work across **daily, weekly, monthly, quarterly, and yearly** horizons.
* Use **sprints or cycles only if you want them**—they’re optional, not the only model.
* Mark work **active**, **paused**, or **deprioritized** so reprioritization stays visible.

### Ownership & delivery

* Assign **who’s responsible** for Sprouts, Initiatives, and Harvests.
* Track stages from idea → development → release without micromanaging hourly tasks.

### Cross-product programs

* Run **Initiatives** that touch several Plots so customer visits, migrations, and shared programs have **one narrative and DRI**.

### Leadership & stakeholders

* **Status reporting** focused on **what’s happening**: in progress, recently completed, on hold, and stuck—with titles, owners, and short status (not metrics-first dashboards).
* **Status digest email**: same story as a **previewable** digest (template + live data); **outbound SMTP** comes in a later milestone.

### AI-assisted breakdown

* Turn a **Sprout** (idea or feature) into a structured task breakdown with **AI assist**—when your workspace admin enables it.
* **Provider and API keys are admin-only**; everyone else sees a generic assist experience (no vendor pickers or secrets in the UI).

### Access (current direction)

* **Users and roles live in the application database** (custom user management). Enterprise **SSO** is on the roadmap, not the first-phase requirement in the product spec.

---

## How it works

1. **Plant** — Capture work as **Sprouts** (from a raw idea or inside an existing Plot).
2. **Organize** — Give each Sprout a **Plot**; link related work to **Initiatives** when it spans products or teams.
3. **Plan** — Set **horizons** and honest lifecycle states; add **sprints** only if that’s how you work.
4. **Track** — Use the **Growth timeline** and ownership so progress is visible.
5. **Ship** — Bundle scope into **Harvests** so releases are explicit.
6. **Align** — Leaders use **status views** and (when mail is wired up) **digests** to stay in sync.

---

## Who it’s for

* Product and engineering teams at **startups** and **enterprises**
* **Leaders** who need a clear story of delivery without building slides every week
* **Platform / engineering leads** running programs across multiple products
* **Solutions and customer-facing roles** coordinating work across several Plots

---

## Philosophy

> Great products don’t just get built — they grow.

* Growth over control  
* Clarity over complexity  
* Momentum over micromanagement  

---

## Product requirements

The living product definition—scope, functional requirements, sequencing themes, and open questions—is in:

**[`docs/BUSINESS_REQUIREMENTS_DOCUMENT.md`](docs/BUSINESS_REQUIREMENTS_DOCUMENT.md)** (BRD v4)

**Engineering pipeline (agent skills → artifacts):**

- [`docs/ENGINEERING_DECOMPOSITION.md`](docs/ENGINEERING_DECOMPOSITION.md) — features, epics, tasks  
- [`docs/SYSTEM_ARCHITECTURE.md`](docs/SYSTEM_ARCHITECTURE.md) — API and boundaries  
- [`docs/RELATIONAL_SCHEMA.md`](docs/RELATIONAL_SCHEMA.md) — data model (see `prisma/schema.prisma`)  
- [`docs/EXECUTION_PLAN.md`](docs/EXECUTION_PLAN.md) — phased build order  

See [`skills/README.md`](skills/README.md) for the skill order.

---

## Tech stack (this repository)

* **Framework:** [Next.js](https://nextjs.org/) 16 (App Router), React 19, TypeScript  
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) 4  
* **Data:** [Prisma](https://www.prisma.io/) ORM + **PostgreSQL 17+** (`DATABASE_URL`; cloud agents may expose `PG_CONNECTION_STRING`)  
* **Linting:** ESLint (flat config: `eslint.config.mjs`)  
* **Paths:** `@/*` → `./src/*` (see `tsconfig.json`)

See [`AGENTS.md`](AGENTS.md) for dev commands and Cursor/cloud notes. Refer to the BRD and [`docs/SYSTEM_ARCHITECTURE.md`](docs/SYSTEM_ARCHITECTURE.md) for API shape.

---

## Getting started

```bash
git clone https://github.com/cogniversity/sproutly.git
cd sproutly
npm install
npm run dev
```

The app serves at [http://localhost:3000](http://localhost:3000). Use `npm run lint` and `npm run build` before shipping changes.

---

## Roadmap (high level)

Aligned with the BRD; delivery is phased—not a promise of ship order or dates.

* Core **Plots**, **Sprouts**, horizons, and lifecycle states  
* **Initiatives** (cross-Plot) and **Harvests** (releases)  
* **Leadership status** views and **status digest** (preview → SMTP later)  
* **AI elaboration** (admin-configured provider; OpenAI, Claude, or Gemini behind the scenes)  
* **Email templates** (authoring + preview)  
* **Integrations** (e.g. GitHub, Jira, Slack)—depth phased  
* **SSO / SAML** (post–first-phase identity, per BRD)  
* Deeper real-time collaboration where it adds clear value  

---

## Contributing

Issues and pull requests are welcome.

---

## License

MIT License

---

Sproutly isn’t just about managing work—it’s about **growing products with intention**.
