# A.D.A.M. MVP — Product Requirements Document

> **Product:** A.D.A.M. (Automated Document & Account Manager)
> **Company:** Andy'K Group International LTD (Reg: 16453500)
> **Version:** 1.0
> **Date:** 2026-02-16
> **Authors:** Kobe Janssens (CTO), Andrej Kneisl (CEO)
> **Status:** Draft

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Target Users & Personas](#3-target-users--personas)
4. [Tech Stack & Architecture](#4-tech-stack--architecture)
5. [Design System Reference](#5-design-system-reference)
6. [Feature Specifications](#6-feature-specifications)
   - 6.1 [Landing Page](#61-landing-page)
   - 6.2 [Authentication](#62-authentication)
   - 6.3 [Questionnaire](#63-questionnaire)
   - 6.4 [Client Dashboard](#64-client-dashboard)
   - 6.5 [Contract Flow](#65-contract-flow)
   - 6.6 [Admin Dashboard](#66-admin-dashboard)
7. [Convex Schema](#7-convex-schema)
8. [API Design](#8-api-design)
9. [Auth & Authorization](#9-auth--authorization)
10. [Email Notifications](#10-email-notifications)
11. [File Structure](#11-file-structure)
12. [Phased Implementation Plan](#12-phased-implementation-plan)
13. [Success Metrics](#13-success-metrics)
14. [Non-Functional Requirements](#14-non-functional-requirements)

---

## 1. Executive Summary

### What is A.D.A.M.?

A.D.A.M. (Automated Document & Account Manager) is a business operating system built by Andy'K Group International. It manages the full client lifecycle — from initial intake questionnaire through proposal, contract negotiation, signing, and onboarding. Each client gets a self-contained workspace with their own documents, workflows, and status tracking.

A.D.A.M. is the brain and workflow engine. E.V.A. (Efficient Virtual Assistant) is the automation layer that executes tasks like sending emails, generating proposals, and triggering notifications. This MVP focuses on A.D.A.M. core workflows; E.V.A. automation is out of scope.

### What We're Building

A complete rebuild of the existing `adameva.app` application. The current app runs on Frappe v15 + Next.js + MariaDB with Docker orchestration (MariaDB, Redis/Dragonfly, Traefik, background workers). The rebuild targets a modern serverless stack that eliminates backend devops overhead and ships faster.

### Scope

**In scope (MVP):**

- Public landing page (adapted from `andyk-landing` design system)
- Authentication via Clerk (Google + email/password, RBAC)
- Multi-segment questionnaire (B2B, B2G, ADAM License)
- Client dashboard (contracts, status, activity)
- Contract flow (full state machine, signatures, appendices, comments)
- Admin dashboard (pipeline, client management, contract editing)
- Transactional email notifications via Resend
- Real-time database with Convex

**Out of scope (future phases):**

- AI Chat with A.D.A.M.
- E.V.A. automation engine
- Stripe payments & invoicing
- PDF generation & export
- Multi-tenancy (separate instances per client org)
- Mobile app (React Native)
- AI proposal generation (Gemini integration)

### Success Criteria

- Questionnaire completion rate > 60%
- Contract cycle time (publish → countersigned) < 14 days
- Lighthouse score > 90 on all pages
- Zero critical security vulnerabilities
- Full mobile responsiveness (375px–1440px)

---

## 2. Problem Statement

Andy'K Group International currently manages client onboarding through a fragmented process:

1. **Manual questionnaire intake** — Prospects fill out documents or answer questions via email. There is no self-service intake form. Responses are scattered across email threads, PDFs, and notes.

2. **No centralized client portal** — Clients have no single place to view their contracts, track status, or upload documents. Everything happens through back-and-forth email.

3. **Manual contract workflow** — Contracts are drafted in documents, sent via email, revised through reply chains, and signed through various means. There is no state machine, no version tracking, no audit trail.

4. **Infrastructure burden** — The existing Frappe-based architecture requires Docker orchestration with 7+ services (MariaDB, two Redis instances, backend, three worker queues, scheduler, frontend, Traefik). Development setup is complex, deployment is fragile, and debugging requires knowledge of multiple systems.

5. **No real-time updates** — Clients and staff have no visibility into what's happening until someone sends an email. Contract status changes, comments, and document uploads all require manual notification.

### What the Rebuild Solves

| Problem | Solution |
|---------|----------|
| Scattered intake | Structured questionnaire with conditional branching |
| No client portal | Self-service dashboard with real-time status |
| Manual contracts | Full state machine with digital signatures |
| Infrastructure complexity | Serverless stack (Convex + Clerk + Vercel) |
| No real-time updates | Convex reactive queries + email notifications |

---

## 3. Target Users & Personas

### System Manager

| Attribute | Detail |
|-----------|--------|
| **Role** | Company owner / admin (Andrej) |
| **Goals** | Full control over all clients, contracts, and team members. Monitor pipeline health. |
| **Pain points** | Currently relies on Frappe Desk which requires technical knowledge. No pipeline overview. |
| **Access level** | Everything — all CRUD, all clients, all contracts, user management |
| **Clerk role** | `org:admin` |
| **Key actions** | Create/edit contracts, countersign, manage clients, verify appendices, manage staff |

### Staff

| Attribute | Detail |
|-----------|--------|
| **Role** | Account manager / operations team |
| **Goals** | Manage assigned clients, draft contracts, process questionnaires |
| **Pain points** | No clear task queue. Manual follow-ups. |
| **Access level** | Assigned clients and their contracts. No user management. |
| **Clerk role** | `org:staff` |
| **Key actions** | Draft contracts, publish, review questionnaires, add comments |

### Client

| Attribute | Detail |
|-----------|--------|
| **Role** | Paying customer of Andy'K services |
| **Goals** | View contract, sign, upload appendices, track status |
| **Pain points** | No portal. Must email for every status update. |
| **Access level** | Own contracts and documents only |
| **Clerk role** | `org:client` |
| **Key actions** | View contracts, sign, request changes, upload documents, comment |

### Prospect

| Attribute | Detail |
|-----------|--------|
| **Role** | Pre-auth visitor considering Andy'K services |
| **Goals** | Understand offerings, submit intake questionnaire |
| **Pain points** | Unclear process. No self-service option. |
| **Access level** | Public pages only (landing page, questionnaire) |
| **Clerk role** | None (unauthenticated) |
| **Key actions** | Browse landing page, fill questionnaire, submit |

---

## 4. Tech Stack & Architecture

### Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | SSR, API routes, file-based routing |
| **UI** | Shadcn/UI + Tailwind CSS v4 | Component library, customized to ADAM design system |
| **Auth** | Clerk | Social + email login, RBAC, webhooks |
| **Database** | Convex | Real-time serverless database, functions, file storage |
| **Email** | Resend + React Email | Transactional emails with templated components |
| **Styling** | Tailwind CSS v4 | CSS-first config, ported from andyk-landing |
| **Hosting** | Vercel | Edge deployment, preview environments |
| **Language** | TypeScript 5 | Full type safety across frontend and backend |

### Why This Stack

| Old (Frappe) | New (Serverless) | Benefit |
|-------------|-------------------|---------|
| MariaDB + Redis + Dragonfly | Convex | Zero database ops, real-time built-in |
| Frappe Python backend | Convex functions | TypeScript everywhere, no Python |
| Docker Compose (7 services) | Vercel + Convex cloud | No infrastructure management |
| Frappe RBAC | Clerk RBAC | Modern auth with social login |
| Custom email via SMTP | Resend + React Email | Templated, reliable delivery |
| Traefik reverse proxy | Vercel Edge | Automatic SSL, CDN, edge routing |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Next.js App                         │   │
│  │  ┌────────┐  ┌────────────┐  ┌───────────────────┐  │   │
│  │  │ Public │  │ Dashboard  │  │ Admin Dashboard   │  │   │
│  │  │ Pages  │  │ (Client)   │  │ (Staff/Admin)     │  │   │
│  │  └───┬────┘  └─────┬──────┘  └────────┬──────────┘  │   │
│  │      │              │                   │             │   │
│  │      └──────────────┴───────────────────┘             │   │
│  │                     │                                 │   │
│  │              Convex React Client                      │   │
│  │              (useQuery / useMutation)                  │   │
│  └──────────────┬──────────────────────────────────────┘   │
│                  │                                          │
│  ┌──────────┐   │   ┌──────────────┐                       │
│  │ API      │   │   │ Middleware    │                       │
│  │ Routes   │◄──┘   │ (Clerk Auth) │                       │
│  │ /webhooks│       └──────────────┘                       │
│  └────┬─────┘                                              │
└───────┼────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────┐   ┌─────────────┐   ┌──────────────┐
│      CONVEX       │   │    CLERK    │   │    RESEND    │
│                   │   │             │   │              │
│  ┌─────────────┐  │   │  Auth       │   │  Email       │
│  │  Queries    │  │   │  Sessions   │   │  Templates   │
│  │  Mutations  │◄─┼───│  RBAC       │   │  Delivery    │
│  │  Actions    │  │   │  Webhooks   │   │              │
│  │  HTTP       │  │   │             │   │              │
│  ├─────────────┤  │   └──────┬──────┘   └──────┬───────┘
│  │  Database   │  │          │                  │
│  │  (Tables)   │  │          │   Webhook sync   │
│  ├─────────────┤  │◄─────────┘                  │
│  │  File       │  │                             │
│  │  Storage    │  │  Convex Actions ─────────►  │
│  └─────────────┘  │  (send email)               │
└───────────────────┘                             │
                                                  │
```

### Convex Function Structure

Convex replaces traditional REST APIs. All data operations go through Convex functions:

| Type | Purpose | Example |
|------|---------|---------|
| **Query** | Read data, reactive (auto-update UI) | `getClientContracts`, `getContractById` |
| **Mutation** | Write data, transactional | `createContract`, `signContract`, `submitQuestionnaire` |
| **Action** | Side effects (external APIs) | `sendEmail`, `processWebhook` |
| **HTTP Action** | Webhook endpoints | `POST /clerk-webhook`, `POST /resend-webhook` |

### File Storage Strategy

Convex file storage handles all uploads (appendices, signatures, questionnaire attachments):

- Files uploaded via Convex `storage.generateUploadUrl()`
- Stored in Convex with generated `storageId`
- Served via `storage.getUrl(storageId)` — signed URLs with automatic expiry
- File metadata (name, type, size, uploader) stored in the `contractFiles` table
- Max file size: 20MB per upload
- Allowed types: PDF, DOCX, XLSX, PNG, JPG, JPEG

---

## 5. Design System Reference

The ADAM design system is ported directly from `andyk-landing`. All visual patterns, colors, typography, and component styles carry over to maintain brand consistency.

### Color Palette

All colors defined as CSS custom properties via Tailwind v4 `@theme inline`:

| Token | Hex | Role |
|-------|-----|------|
| `--color-foreground` | `#01011b` | Primary text, headings, dark section backgrounds |
| `--color-eggplant` | `#31263b` | Secondary dark, gradient partner, dot-grid tint |
| `--color-highlight` | `#C9707D` | **Primary accent** — CTAs, active states, badges, links |
| `--color-rose` | `#F5C0C0` | Warm accent — gradients, card tints, hero background |
| `--color-rose-dark` | `#cda0a5` | Darker rose — borders, gradient stops, button borders |
| `--color-muted` | `#525a70` | Primary body text |
| `--color-muted-2` | `#8b93a8` | Secondary text, placeholders, labels, captions |
| `--color-grid-300` | `#f5f5f7` | Light backgrounds, hover fills |
| `--color-grid-500` | `#e2e4ea` | Borders, dividers, secondary outlines |
| `--color-grid-700` | `#c4c8d4` | Strong borders, prominent dividers |
| `--color-bg-light` | `#faf9fb` | Section backgrounds |
| `--color-background` | `#ffffff` | Page background |

> **Important:** The highlight color is `#C9707D` (dusty rose). The `#5CB198` (teal green) value referenced in some earlier design documents is **not** the production color. Always use `#C9707D`.

### Additional ADAM-Specific Tokens

These tokens extend the palette for dashboard and application UI:

| Token | Hex | Role |
|-------|-----|------|
| `--color-success` | `#22c55e` | Success states, completed status |
| `--color-warning` | `#f59e0b` | Warning states, pending actions |
| `--color-error` | `#ef4444` | Error states, destructive actions |
| `--color-info` | `#3b82f6` | Information states, links |

### Typography

| Role | Family | CSS Variable | Weights |
|------|--------|-------------|---------|
| Body & headings | IBM Plex Sans | `--font-sans` | 300, 400, 500, 600, 700 |
| Labels & code | IBM Plex Mono | `--font-mono` | 400, 500, 700 |

Loaded via `next/font/google`. No other fonts permitted.

**Type Scale:**

| Element | Weight | Size | Line Height |
|---------|--------|------|-------------|
| H1 (Hero) | 700 | `clamp(2.375rem, 1.6rem + 2.75vw, 3.75rem)` | 1.2 |
| H2 (Section) | 700 | `clamp(1.875rem, 1.52rem + 1.25vw, 2.5rem)` | 1.2 |
| H3 (Cards) | 700 | `1rem` | tight |
| Body large | 300 | `1.25rem` | relaxed |
| Body | 300–400 | `1rem` | relaxed |
| Small | 400 | `0.875rem` | normal |
| Label | Mono 400 | `10px` | — |
| Caption | 400 | `0.75rem` | normal |

### Section Header Pattern

Every major section follows this hierarchy (implemented as `SectionHeader` component):

```
LABEL    → IBM Plex Mono, 10px, uppercase, tracking 0.25em, muted-2
H2       → Bold, clamp(), foreground, tracking-tight
Subtitle → lg, light (300), muted
```

```tsx
// Port from andyk-landing/src/components/SectionHeader.tsx
<div className="text-center max-w-[700px] mx-auto mb-16">
  <h2 className="text-[clamp(1.875rem,1.52rem+1.25vw,2.5rem)] font-bold tracking-tight leading-[1.2] text-foreground mb-4">
    {children}
  </h2>
  {subtitle && (
    <p className="text-lg leading-relaxed text-muted font-light">
      {subtitle}
    </p>
  )}
</div>
```

### Layout Constants

| Context | Value | Usage |
|---------|-------|-------|
| Container max-width | `1200px` | All sections |
| Section padding | `py-20 px-8` | Vertical + horizontal |
| Header margin-bottom | `mb-16` | After SectionHeader |
| Content container | `max-w-[1200px] mx-auto` | Standard wrapper |

### Shadcn/UI Customization Strategy

Shadcn/UI components are customized to match ADAM tokens:

| Shadcn Component | ADAM Customization |
|-----------------|--------------------|
| `Button` | Map variants to `btn-primary-gradient` and `btn-secondary` styles |
| `Card` | Use `glass-card` or standard card pattern (white, `border-grid-300`, `rounded-xl`) |
| `Input` | Border `grid-500`, focus ring `highlight`, placeholder `muted-2` |
| `Dialog` | Overlay with backdrop blur, card styling |
| `Select` | Match input styling, dropdown with `bg-light` hover |
| `Tabs` | Animated indicator matching `TabSwitcher` from landing page |
| `Badge` | `highlight` background for active, `grid-300` for neutral |
| `Table` | `grid-300` row borders, `muted` text, `foreground` headers |
| `Sidebar` | `bg-foreground` dark sidebar with `white/80` text hierarchy |

### Background Textures to Port

These CSS classes from `andyk-landing/src/app/globals.css` should be ported to ADAM's globals:

| Class | Use In ADAM |
|-------|------------|
| `.hero-gradient` | Landing page hero |
| `.cartesian-grid` | Landing page hero background |
| `.noise-texture` | Subtle page texture overlays |
| `.glass-card` | Dashboard cards, contract viewer panels |
| `.section-radial-bg` | Section backgrounds |
| `.section-bg-grid` | Dashboard section backgrounds |
| `.gradient-text` | Accent headings |
| `.btn-primary-gradient` | Primary CTA buttons |
| `.btn-secondary` | Secondary action buttons |
| `.tron-line` | Section dividers |

### Visual Effects

| Effect | CSS | Usage |
|--------|-----|-------|
| Glassmorphism | `backdrop-filter: blur(7.5px)` + translucent bg + layered shadows | Dashboard cards |
| Dot grid | `radial-gradient` 16x16px pattern at low opacity | Hero, section backgrounds |
| Noise | SVG fractalNoise at 6% opacity, 8s animation | Texture overlays |
| Gradient text | `linear-gradient(90deg, eggplant, foreground)` with `background-clip: text` | Accent headings |
| TronDivider | 9 stacked 1px lines with gradient + decreasing opacity | Section separators |

---

## 6. Feature Specifications

---

### 6.1 Landing Page

**Route:** `/`
**Auth:** Public (no login required)
**Purpose:** Present Andy'K services, build trust, drive prospects to the questionnaire.

#### User Stories

| ID | Story | Priority |
|----|-------|----------|
| LP-1 | As a prospect, I can understand what Andy'K offers within 10 seconds of landing | Must |
| LP-2 | As a prospect, I can view pricing for B2B, B2G, and Tech services | Must |
| LP-3 | As a prospect, I can navigate to the questionnaire from any section | Must |
| LP-4 | As a prospect, I can contact Andy'K via a form | Should |
| LP-5 | As a prospect, I can view the site on mobile without horizontal scroll | Must |

#### Acceptance Criteria

- Page loads with Lighthouse performance score > 90
- Hero section visible without scroll on desktop (above the fold)
- Primary CTA ("Get Started" / "Start Questionnaire") links to `/questionnaire`
- Pricing section shows B2B, B2G, and Tech tabs with correct prices
- Contact form submits to an API route that sends email via Resend
- All sections separated by TronDivider components
- Mobile responsive at 375px, 768px, 1200px breakpoints

#### UI Description

Adapts the `andyk-landing` page composition:

```
Navbar                    (sticky, logo + nav links + CTA button)
Hero + HeroBackground     (headline, tagline, two CTAs, dot grid background)
LogoBar                   (trust stats — 4 metrics with country flags)
--- TronDivider ---
RoadmapSection            (A.D.A.M. 6-step pipeline, glassmorphic cards)
--- TronDivider ---
TestimonialPair           (Founders — photos, bios, quotes)
--- TronDivider ---
PricingSection            (3-tab: B2B/B2G/Tech, commitment selector, discount logic)
--- TronDivider ---
LovedBySection            (Social proof quote)
FaqSection                (Services showcase in 3-column grid)
IntegrationsSection       (A.D.A.M. & E.V.A. system feature cards)
ContactForm               (Name, email, company, message)
CtaSection                (Dark bg CTA with company info)
Footer                    (Links, company details, legal, copyright)
```

#### Data Model

No database tables. Content sourced from `lib/data.ts` (same pattern as andyk-landing).

#### API

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/contact` | POST | Receives contact form submission, sends email via Resend |

---

### 6.2 Authentication

**Routes:** `/sign-in`, `/sign-up`
**Auth:** Public (Clerk components handle the flow)
**Purpose:** Authenticate users and sync to Convex database.

#### User Stories

| ID | Story | Priority |
|----|-------|----------|
| AU-1 | As a prospect, I can sign up with Google or email/password | Must |
| AU-2 | As a returning user, I can sign in and land on my dashboard | Must |
| AU-3 | As a user, I see UI styled to match the ADAM design system | Must |
| AU-4 | As an admin, new users are automatically synced to the database | Must |

#### Acceptance Criteria

- Clerk `<SignIn>` and `<SignUp>` components render with ADAM styling
- Google OAuth and email/password both work
- After sign-in, users redirect based on role:
  - `org:admin` or `org:staff` → `/admin`
  - `org:client` → `/dashboard`
  - No role → `/dashboard` (default)
- Clerk webhook fires on user creation → syncs user to Convex `users` table
- Protected routes redirect unauthenticated users to `/sign-in`

#### UI Description

Centered card layout on a subtle background (hero-gradient or section-radial-bg):

- ADAM logo at top
- Clerk component (sign in or sign up)
- Styled to match: `foreground` text, `grid-500` borders, `highlight` accent on buttons
- "Or continue with Google" separator
- Link to switch between sign-in and sign-up

#### Data Model

User data synced from Clerk to Convex:

```typescript
// Synced via Clerk webhook
{
  clerkId: string,        // Clerk user ID
  email: string,
  firstName: string,
  lastName: string,
  imageUrl: string,
  role: "admin" | "staff" | "client",
  createdAt: number,      // timestamp
}
```

#### API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| Convex HTTP Action: `/clerk-webhook` | POST | Receives Clerk `user.created` / `user.updated` events, upserts user in Convex |

---

### 6.3 Questionnaire

**Route:** `/questionnaire`
**Auth:** Public (no login required)
**Purpose:** Structured client intake across B2B, B2G, and ADAM License segments.

#### User Stories

| ID | Story | Priority |
|----|-------|----------|
| QS-1 | As a prospect, I can complete the questionnaire without creating an account | Must |
| QS-2 | As a prospect, I see one question at a time (TypeForm-style) | Must |
| QS-3 | As a prospect, I can select my service segment (B2B/B2G/ADAM) and only see relevant questions | Must |
| QS-4 | As a prospect, my progress is auto-saved so I can resume later | Must |
| QS-5 | As a prospect, I can upload supporting documents | Should |
| QS-6 | As a prospect, I can review all my answers before submitting | Must |
| QS-7 | As an admin, I receive a notification when a questionnaire is submitted | Must |

#### Acceptance Criteria

- One question displayed at a time with smooth transitions
- Progress bar shows completion percentage
- Keyboard navigation: Enter to advance, Shift+Enter for multiline, Tab for options
- Back button to return to previous questions
- localStorage auto-save on every answer change (keyed by session ID)
- Conditional branching: after segment selection (Section 2), only show relevant section (3, 4, or 5)
- File upload supports PDF, DOCX, XLSX, PNG, JPG (max 20MB per file)
- Review page shows all answers grouped by section with edit capability
- Submit stores response in Convex and clears localStorage
- Admin notification email sent via Resend on submission

#### Questionnaire Sections & Questions

All questions sourced from the master questionnaire (`Questionaire orginal adam & eva.md`):

---

**Section 1: Company Profile**

**1.1 Company & Contacts**

| # | Question | Type | Required |
|---|----------|------|----------|
| 1 | Legal company name (as in official registration) | Text input | Yes |
| 2 | Website URL | URL input | No |
| 3 | Billing currency | Single select: EUR (€), GBP (£), USD ($), Other | Yes |
| 4 | Contact person for business communication (full name) | Text input | Yes |
| 5 | Contact person phone | Phone input | Yes |
| 6 | Contact person email | Email input | Yes |
| 7 | Registered business address | Group: Address Line 1, Address Line 2, City, Postcode, Country | Yes |
| 8 | Data enrichment consent | Checkbox: "I agree to data enrichment using public sources and official registers" | Yes |

**1.2 Presence & Scale**

| # | Question | Type | Required |
|---|----------|------|----------|
| 9 | LinkedIn / Social profiles | Text input | No |
| 10 | Countries of operation | Text input | Yes |
| 11 | Years in business | Single select: < 1 year, 1–3 years, 3–5 years, 5–10 years, 10+ years | Yes |
| 12 | Annual revenue range | Single select: < €100K, €100K–€500K, €500K–€1M, €1M–€5M, €5M–€20M, €20M+, Prefer not to say | No |

**1.3 Positioning & Goals**

| # | Question | Type | Required |
|---|----------|------|----------|
| 13 | Key products or services offered | Long text | Yes |
| 14 | Primary business goals for the next 12 months | Long text | Yes |
| 15 | Main challenges currently faced | Long text | Yes |
| 16 | Competitors you want to outperform (name and website) | Long text | No |
| 17 | Unique selling points (USP) | Long text | Yes |
| 18 | Preferred communication channels with clients | Multi select: Email, Chat, SMS, Phone, Video calls, Other | Yes |
| 19 | Data security requirements | Multi select: Special storage, Encryption, GDPR, HIPAA, On-premise hosting, Other | No |
| 20 | Privacy Policy agreement | Checkbox: "I agree to the Privacy Policy" | Yes |

---

**Section 2: Segment Selection**

| # | Question | Type | Required |
|---|----------|------|----------|
| 21 | Select service type(s) | Multi select: B2B — Lead Generation & Sales Development, B2G — Public Tender & Government Contracts, A.D.A.M. — Automation System Licensing | Yes |

> After selection, the questionnaire branches to show only the relevant segment sections (3, 4, and/or 5).

---

**Section 3: B2B — Lead Generation & Sales Development**

*Shown only when B2B is selected in Section 2.*

**3.1 Package Selection**

| # | Question | Type | Required |
|---|----------|------|----------|
| 22 | Choose your B2B package | Single select: CORE (€950/mo), ADVANCE (€1,350/mo), VANGUARD (€1,750/mo), PRESTIGE (from €2,400/mo) | Yes |

**3.2 Target Market**

| # | Question | Type | Required |
|---|----------|------|----------|
| 23 | Target countries / regions | Text input | Yes |
| 24 | Preferred target industries | Text input | Yes |
| 25 | Preferred company size | Multi select: 1–10, 11–50, 51–200, 201–1000, 1000+ employees | Yes |

**3.3 Decision-Maker Profile**

| # | Question | Type | Required |
|---|----------|------|----------|
| 26 | Preferred contact roles | Multi select: CEO, CMO, Procurement, CTO, CFO, Sales Director, Marketing Director, Other | Yes |
| 27 | Decision-maker seniority | Multi select: C-Level, VP / Director, Manager, Team Lead, Other | Yes |

**3.4 Sales Process**

| # | Question | Type | Required |
|---|----------|------|----------|
| 28 | Sales cycle length | Single select: Short (< 1 month), Medium (1–3 months), Long (> 3 months) | Yes |
| 29 | Current average deal size | Text input | No |
| 30 | Target deal size | Text input | No |
| 31 | Main selling channels used today | Multi select: Email, Cold call, LinkedIn, Events, Referrals, Content marketing, Other | Yes |
| 32 | Outreach language(s) required | Text input | Yes |

**3.5 Current Setup**

| # | Question | Type | Required |
|---|----------|------|----------|
| 33 | Existing CRM system (name or "none") | Text input | Yes |
| 34 | Current lead conversion rate (%) | Text input | No |
| 35 | Top 3 client objections you usually face | Long text (3 fields) | No |

**3.6 Campaign Strategy**

| # | Question | Type | Required |
|---|----------|------|----------|
| 36 | Key decision triggers for your buyers | Multi select: Discounts, Compliance, Innovation, Speed, Quality, Support, Other | Yes |
| 37 | Specific products/services to promote in this campaign | Long text | Yes |
| 38 | Marketing material available | Multi select: Pitch deck, Brochures, Videos, Case studies, White papers, Product demos, Other | No |
| 39 | Previous lead generation methods tried (successes/failures) | Long text | No |
| 40 | Competitors' strengths to counteract | Long text | No |
| 41 | Special compliance or certification requirements | Long text | No |

**3.7 Reporting & Add-ons**

| # | Question | Type | Required |
|---|----------|------|----------|
| 42 | Reporting format preference | Single select: Google Sheets, PDF, CRM export, Excel, Other | Yes |
| 43 | Optional B2B add-ons | Multi select: Extra leads, CRM export setup, Multilingual scripts, AI-powered proposal generation, Custom branding, Multi-market expansion support, Other | No |

---

**Section 4: B2G — Public Tender & Government Contracts**

*Shown only when B2G is selected in Section 2.*

**4.1 Package Selection**

| # | Question | Type | Required |
|---|----------|------|----------|
| 44 | Choose your B2G package | Single select: GovStarter (£650/mo), GovExpand (£1,050/mo), GovElite (£1,650/mo) | Yes |

**4.2 Target Scope**

| # | Question | Type | Required |
|---|----------|------|----------|
| 45 | Target regions | Single select: UK only, EU only, Both UK & EU | Yes |
| 46 | Tender types of interest | Multi select: RFP, RFQ, Grants, Frameworks, Other | Yes |
| 47 | Relevant CPV codes (if known) | Text input | No |
| 48 | Preferred contract value range (£) | Single select: < £50K, £50K–£150K, £150K–£500K, £500K–£1M, £1M+ | Yes |
| 49 | Sector focus | Text input | Yes |
| 50 | Tender search keywords | Text input | No |

**4.3 Capacity & Experience**

| # | Question | Type | Required |
|---|----------|------|----------|
| 51 | Submission capacity per month | Text input | Yes |
| 52 | Internal bid preparation resources (team size + experience level) | Group: Team size (text), Experience level (text) | No |
| 53 | Experience level | Single select: No experience, Beginner (1–3 bids), Intermediate (4–10 bids), Experienced (10+ bids) | Yes |
| 54 | Past tender experience | Single select: Won, Lost, Never applied | Yes |
| 55 | Main reasons for past unsuccessful bids (if applicable) | Long text | No |

**4.4 Partnerships & Compliance**

| # | Question | Type | Required |
|---|----------|------|----------|
| 56 | Consortium partnership interest | Single select: Yes, No | Yes |
| 57 | Translation support needed? | Single select: Yes, No | Yes |
| 58 | Bid compliance requirements | Multi select: ISO certification, GDPR compliance, Insurance levels, Security clearance, Financial thresholds, Other | No |

**4.5 Evaluation & Priorities**

| # | Question | Type | Required |
|---|----------|------|----------|
| 59 | Evaluation criteria priorities | Multi select: Price, Quality, Innovation, Sustainability, Local content, Experience, Other | Yes |
| 60 | Grant interest | Single select: Yes, No | No |

**4.6 Reporting & Add-ons**

| # | Question | Type | Required |
|---|----------|------|----------|
| 61 | Preferred reporting frequency | Single select: Weekly, Bi-weekly, Monthly | Yes |
| 62 | Optional B2G add-ons | Multi select: Grant writing, Pitch deck creation, Translation services, Consortium matching, Other | No |

---

**Section 5: A.D.A.M. — Automation System Licensing**

*Shown only when A.D.A.M. is selected in Section 2.*

**5.1 Package Selection**

| # | Question | Type | Required |
|---|----------|------|----------|
| 63 | Choose your A.D.A.M. package | Single select: Starter, Professional, Enterprise | Yes |
| 64 | Branding add-on required? | Single select: Yes, No | Yes |

**5.2 Company Details**

| # | Question | Type | Required |
|---|----------|------|----------|
| 65 | Full legal company name and registration number | Text input | Yes |
| 66 | Company website (to pull branding & copy) | URL input | Yes |
| 67 | Primary industry & target audience | Text input | Yes |
| 68 | Number of services/products offered | Text input | Yes |

**5.3 Onboarding Assessment**

| # | Question | Type | Required |
|---|----------|------|----------|
| 69 | Do you have an existing client onboarding process? | Single select: Yes (describe below), No | Yes |
| 70 | Describe your existing onboarding process (if applicable) | Long text | Conditional (if #69 = Yes) |
| 71 | Average number of new clients per month | Text input | Yes |
| 72 | Main bottlenecks in current onboarding | Multi select: Time, Accuracy, Follow-up, Data errors, Manual processes, Communication gaps, Other | Yes |

**5.4 Configuration**

| # | Question | Type | Required |
|---|----------|------|----------|
| 73 | Preferred service packages for your clients (if known) | Long text | No |
| 74 | Do you require custom contract templates? | Single select: Yes, No | Yes |
| 75 | Add-ons to include | Multi select: Extra templates, CRM integration, AI outreach scripts, Other | No |
| 76 | Admin panel user count | Text input | Yes |
| 77 | Preferred AI mode | Single select: Free AI (built-in), OpenAI (premium), Custom / hybrid | Yes |
| 78 | Launch deadline / urgency level | Single select: Urgent (< 2 weeks), Standard (2–4 weeks), Flexible (1–2 months), No rush | Yes |

**5.5 Future Plans**

| # | Question | Type | Required |
|---|----------|------|----------|
| 79 | Future upgrade interest | Multi select: E.V.A. integration, SaaS plan, Custom modules, Other | No |

---

**Section 6: Attachments**

| # | Question | Type | Required |
|---|----------|------|----------|
| 80 | Upload supporting documents (pitch decks, brochures, brand guidelines, contracts, etc.) | File upload (multiple) | No |

---

**Section 7: Review & Submit**

- Display all answers grouped by section
- Each section is expandable/collapsible
- Edit button next to each answer navigates back to that question
- Submit button with confirmation dialog
- After submission: success screen with "We'll be in touch within 24 hours" message

#### Data Model

```typescript
// questionnaires table
{
  // Section 1
  companyName: string,
  websiteUrl?: string,
  billingCurrency: string,
  contactName: string,
  contactPhone: string,
  contactEmail: string,
  address: {
    line1: string,
    line2?: string,
    city: string,
    postcode: string,
    country: string,
  },
  dataEnrichmentConsent: boolean,
  socialProfiles?: string,
  countriesOfOperation: string,
  yearsInBusiness: string,
  annualRevenue?: string,
  productsServices: string,
  businessGoals: string,
  challenges: string,
  competitors?: string,
  usp: string,
  communicationChannels: string[],
  securityRequirements?: string[],
  privacyPolicyAgreed: boolean,

  // Section 2
  segments: string[],  // ["B2B", "B2G", "ADAM"]

  // Segment-specific data stored as JSON
  b2bData?: { ... },   // All B2B fields
  b2gData?: { ... },   // All B2G fields
  adamData?: { ... },  // All ADAM License fields

  // Section 6
  attachmentIds?: string[],  // Convex storage IDs

  // Metadata
  status: "draft" | "submitted",
  submittedAt?: number,
  createdAt: number,
  sessionId: string,  // For localStorage matching
}
```

#### API

| Function | Type | Purpose |
|----------|------|---------|
| `questionnaires.submit` | Mutation | Validate and store questionnaire response |
| `questionnaires.getById` | Query | Get questionnaire by ID (admin only) |
| `questionnaires.list` | Query | List all questionnaires (admin only) |
| `questionnaires.generateUploadUrl` | Mutation | Get upload URL for attachments |

---

### 6.4 Client Dashboard

**Route:** `/dashboard`
**Auth:** Authenticated (Client role)
**Purpose:** Central hub for clients to view their contracts, track status, and manage actions.

#### User Stories

| ID | Story | Priority |
|----|-------|----------|
| CD-1 | As a client, I can see all my contracts and their current status | Must |
| CD-2 | As a client, I can see pending actions I need to take (sign, upload, etc.) | Must |
| CD-3 | As a client, I can click a contract to view its full details | Must |
| CD-4 | As a client, I can see recent activity on my contracts | Should |
| CD-5 | As a client, I can navigate to different sections via sidebar | Must |

#### Acceptance Criteria

- Dashboard loads within 2 seconds
- Contracts list shows: name, status badge, last updated, pending actions
- Pipeline visualization shows status dots: Q (Questionnaire) → P (Proposal) → S (Strategy) → C (Contract) → I (Invoice) → K (Kick-off)
- Pending actions highlighted with warning color
- Activity feed shows last 10 events (status changes, comments, uploads)
- Real-time updates via Convex reactive queries (no polling)
- Sidebar navigation: Overview, Contracts, Documents, Profile

#### UI Description

**Layout:** Sidebar (dark, `bg-foreground`) + main content area

**Sidebar:**
- ADAM logo at top
- Navigation items with icons: Overview, Contracts, Documents, Profile
- Active item highlighted with `highlight` accent
- User avatar + name at bottom with sign-out option

**Main Content — Overview:**
- Welcome header with client name
- Status overview cards (total contracts, pending actions, completed)
- Pipeline visualization bar (colored dots for each stage)
- Recent contracts list (card per contract with status badge, date, actions)
- Activity feed (timeline with icons per event type)

**Contract Card:**
```
┌─────────────────────────────────────────┐
│ Contract #001 — B2B Core Package        │
│                                         │
│ Status: [Published]    Updated: 2d ago  │
│                                         │
│ ● Q  ● P  ● S  ◉ C  ○ I  ○ K          │
│                                         │
│ [View Contract →]                       │
└─────────────────────────────────────────┘
```

#### Data Model

Uses `contracts`, `activityLog`, and `users` tables. No dedicated dashboard table.

#### API

| Function | Type | Purpose |
|----------|------|---------|
| `contracts.listForClient` | Query | Get all contracts for the authenticated client |
| `activityLog.listForClient` | Query | Get recent activity for the client's contracts |
| `users.getCurrent` | Query | Get current user profile |

---

### 6.5 Contract Flow

**Routes:** `/contracts/[id]` (client view), `/admin/contracts/[id]` (admin view)
**Auth:** Authenticated (Client reads own, Admin reads all)
**Purpose:** Full contract lifecycle from draft to finalization.

#### User Stories

| ID | Story | Priority |
|----|-------|----------|
| CF-1 | As an admin, I can create a contract draft for a client | Must |
| CF-2 | As an admin, I can publish a contract (sends notification to client) | Must |
| CF-3 | As a client, I can view a published contract | Must |
| CF-4 | As a client, I can request changes with a comment | Must |
| CF-5 | As a client, I can sign the contract digitally | Must |
| CF-6 | As an admin, I can countersign after client signs | Must |
| CF-7 | As a client, I can upload appendix documents (A–E) | Must |
| CF-8 | As an admin, I can verify uploaded appendices | Must |
| CF-9 | As a user, I can comment on specific contract sections | Should |
| CF-10 | As a user, I can view the full version history | Should |

#### Contract State Machine

```
                    ┌──────────────────────┐
                    │                      │
                    ▼                      │
  ┌───────┐   ┌───────────┐   ┌────────┐  │  ┌──────────────┐   ┌────────────────┐   ┌───────┐
  │ Draft │──►│ Published │──►│ Viewed │──┘  │Client Signed │──►│ Countersigned │──►│ Final │
  └───────┘   └─────┬─────┘   └────┬───┘     └──────────────┘   └────────────────┘   └───────┘
                    ▲               │
                    │               ▼
                    │      ┌──────────────────┐
                    └──────│Changes Requested │
                           └──────────────────┘
```

**State transitions:**

| From | To | Trigger | Side Effects |
|------|----|---------|-------------|
| Draft | Published | Admin clicks "Publish" | Email sent to client |
| Published | Viewed | Client opens contract | Timestamp recorded |
| Viewed | Changes Requested | Client clicks "Request Changes" + comment | Email sent to admin |
| Changes Requested | Published | Admin edits and re-publishes | Email sent to client, version incremented |
| Viewed | Client Signed | Client clicks "Sign" + signature capture | Email sent to admin |
| Published | Client Signed | Client signs without viewing separately | Email sent to admin |
| Client Signed | Countersigned | Admin clicks "Countersign" | Email sent to client |
| Countersigned | Final | Automatic (after countersign) | Final email to both parties |

#### Acceptance Criteria

- Contract viewer renders full contract content with rich text formatting
- Sidebar shows: sections navigation, appendices list, comments panel, signature area
- Status badge updates in real-time when state changes
- Appendix upload supports 5 slots (A–E), each with:
  - File upload (PDF, DOCX, PNG, JPG — max 20MB)
  - Status: Not uploaded → Uploaded → Verified (by admin)
  - Admin can mark as "Verified" or "Rejected" with note
- Comment threads are per-section (tied to contract section ID)
- Digital signature: canvas-based drawing capture, stored as PNG
- Version history shows all state transitions with timestamp and actor
- Each state change creates an activity log entry

#### UI Description

**Client View (`/contracts/[id]`):**

```
┌─────────────────────────────────────────────────────────┐
│ ← Back to Dashboard        Contract #001       [Status] │
├─────────────┬───────────────────────────────────────────┤
│             │                                           │
│  Sections   │         Contract Content                  │
│  ─────────  │         ─────────────────                 │
│  § Overview │  [Rich text contract content rendered     │
│  § Scope    │   with headings, lists, tables.           │
│  § Terms    │   Each section has an anchor ID for       │
│  § Payment  │   sidebar navigation.]                    │
│  § Duration │                                           │
│             │                                           │
│  Appendices │                                           │
│  ──────────│                                           │
│  A: ✓ Cert  │                                           │
│  B: ↑ Upload│                                           │
│  C: — Empty │                                           │
│  D: — Empty │                                           │
│  E: — Empty │                                           │
│             │                                           │
│  Comments   │                                           │
│  ────────── │  ┌─────────────────────────────────────┐  │
│  3 threads  │  │         Signature Area               │  │
│             │  │  [Draw signature]  [Clear] [Sign]    │  │
│             │  └─────────────────────────────────────┘  │
└─────────────┴───────────────────────────────────────────┘
```

**Admin View (`/admin/contracts/[id]`):**

Same layout as client view, plus:
- Rich text editor for contract content (instead of read-only)
- "Publish" / "Re-publish" button
- "Countersign" button (after client signs)
- Appendix verification controls (Verify / Reject per appendix)
- Version history panel

#### Data Model

Uses `contracts`, `contractVersions`, `contractFiles`, `contractComments` tables. See [Section 7: Convex Schema](#7-convex-schema).

#### API

| Function | Type | Purpose |
|----------|------|---------|
| `contracts.getById` | Query | Get contract with all related data |
| `contracts.create` | Mutation | Create new draft contract |
| `contracts.update` | Mutation | Update contract content |
| `contracts.publish` | Mutation | Transition to Published state |
| `contracts.markViewed` | Mutation | Transition to Viewed state |
| `contracts.requestChanges` | Mutation | Transition to Changes Requested |
| `contracts.clientSign` | Mutation | Transition to Client Signed |
| `contracts.countersign` | Mutation | Transition to Countersigned → Final |
| `contractFiles.upload` | Mutation | Upload appendix file |
| `contractFiles.verify` | Mutation | Admin verify/reject appendix |
| `contractComments.create` | Mutation | Add comment to section |
| `contractComments.listByContract` | Query | Get comments for a contract |
| `contractVersions.listByContract` | Query | Get version history |

---

### 6.6 Admin Dashboard

**Route:** `/admin`
**Auth:** Authenticated (Admin or Staff role)
**Purpose:** Manage all clients, contracts, questionnaires, and pipeline.

#### User Stories

| ID | Story | Priority |
|----|-------|----------|
| AD-1 | As an admin, I can see all clients in a pipeline/kanban view | Must |
| AD-2 | As an admin, I can create and edit clients | Must |
| AD-3 | As an admin, I can create, edit, and publish contracts | Must |
| AD-4 | As an admin, I can view and convert submitted questionnaires to clients | Must |
| AD-5 | As an admin, I can search and filter clients and contracts | Must |
| AD-6 | As an admin, I can see action items requiring my attention | Must |
| AD-7 | As a staff member, I can see clients and contracts assigned to me | Must |

#### Acceptance Criteria

- Pipeline view shows clients as cards in stage columns: Questionnaire → Proposal → Strategy → Contract → Invoice → Kick-off
- Kanban drag-and-drop to move clients between stages
- Client detail page shows: info, contracts, questionnaire, activity
- Contract editor with rich text (bold, italic, headings, lists, tables)
- Questionnaire list with status filter (submitted, converted)
- "Convert to Client" action on questionnaire creates client record with pre-filled data
- Action items panel shows: unsigned contracts, unverified appendices, change requests, new questionnaires
- Search across clients by name, email, company
- Filter by: status, assigned staff, date range

#### UI Description

**Layout:** Same sidebar pattern as client dashboard but with admin navigation.

**Sidebar:**
- ADAM logo
- Navigation: Dashboard, Pipeline, Clients, Contracts, Questionnaires, Settings
- Active item with `highlight` accent
- User info + sign-out at bottom

**Dashboard (Overview):**
- Stats cards: Total clients, Active contracts, Pending actions, New questionnaires
- Action items list (prioritized by urgency)
- Recent activity feed (all clients)

**Pipeline View:**
```
┌───────────┬───────────┬───────────┬───────────┬───────────┬───────────┐
│Questionnaire│ Proposal │ Strategy │ Contract │  Invoice  │  Kick-off │
├───────────┼───────────┼───────────┼───────────┼───────────┼───────────┤
│ ┌───────┐ │ ┌───────┐ │           │ ┌───────┐ │           │           │
│ │ Acme  │ │ │ Beta  │ │           │ │ Delta │ │           │           │
│ │ Corp  │ │ │ Inc   │ │           │ │ LLC   │ │           │           │
│ └───────┘ │ └───────┘ │           │ └───────┘ │           │           │
│ ┌───────┐ │           │           │           │           │           │
│ │ Gamma │ │           │           │           │           │           │
│ │ Ltd   │ │           │           │           │           │           │
│ └───────┘ │           │           │           │           │           │
└───────────┴───────────┴───────────┴───────────┴───────────┴───────────┘
```

**Client Detail:**
- Header: Company name, contact info, status badge
- Tabs: Overview, Contracts, Questionnaire, Activity
- Contracts tab: List with create button, status, actions
- Questionnaire tab: Read-only view of submitted answers

**Contract Editor:**
- Rich text toolbar: Bold, Italic, Headings (H2, H3), Bullet list, Numbered list, Table
- Auto-save on change (debounced 2s)
- Sidebar: section navigation, appendix management, publish controls
- Preview mode toggle

#### Data Model

Uses `clients`, `contracts`, `questionnaires`, `activityLog` tables.

#### API

| Function | Type | Purpose |
|----------|------|---------|
| `clients.list` | Query | List all clients with filters |
| `clients.getById` | Query | Get client with contracts and activity |
| `clients.create` | Mutation | Create new client |
| `clients.update` | Mutation | Update client info |
| `clients.updateStage` | Mutation | Move client in pipeline |
| `clients.convertFromQuestionnaire` | Mutation | Create client from questionnaire data |
| `questionnaires.list` | Query | List all questionnaires |
| `activityLog.listAll` | Query | Get activity feed (admin) |

---

## 7. Convex Schema

Complete TypeScript schema for all Convex tables:

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ═══════════════════════════════════════
  // USERS (synced from Clerk)
  // ═══════════════════════════════════════
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(
      v.literal("admin"),
      v.literal("staff"),
      v.literal("client")
    ),
    clientId: v.optional(v.id("clients")),  // Link to client record (for client users)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // ═══════════════════════════════════════
  // CLIENTS
  // ═══════════════════════════════════════
  clients: defineTable({
    companyName: v.string(),
    contactName: v.string(),
    contactEmail: v.string(),
    contactPhone: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    address: v.optional(v.object({
      line1: v.string(),
      line2: v.optional(v.string()),
      city: v.string(),
      postcode: v.string(),
      country: v.string(),
    })),
    billingCurrency: v.optional(v.string()),
    segments: v.optional(v.array(v.string())),  // ["B2B", "B2G", "ADAM"]
    stage: v.union(
      v.literal("questionnaire"),
      v.literal("proposal"),
      v.literal("strategy"),
      v.literal("contract"),
      v.literal("invoice"),
      v.literal("kickoff")
    ),
    assignedTo: v.optional(v.id("users")),  // Staff assigned
    questionnaireId: v.optional(v.id("questionnaires")),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_stage", ["stage"])
    .index("by_assignedTo", ["assignedTo"])
    .index("by_email", ["contactEmail"])
    .searchIndex("search_company", {
      searchField: "companyName",
      filterFields: ["stage"],
    }),

  // ═══════════════════════════════════════
  // QUESTIONNAIRES
  // ═══════════════════════════════════════
  questionnaires: defineTable({
    // Section 1: Company Profile
    companyName: v.string(),
    websiteUrl: v.optional(v.string()),
    billingCurrency: v.string(),
    contactName: v.string(),
    contactPhone: v.string(),
    contactEmail: v.string(),
    address: v.object({
      line1: v.string(),
      line2: v.optional(v.string()),
      city: v.string(),
      postcode: v.string(),
      country: v.string(),
    }),
    dataEnrichmentConsent: v.boolean(),
    socialProfiles: v.optional(v.string()),
    countriesOfOperation: v.string(),
    yearsInBusiness: v.string(),
    annualRevenue: v.optional(v.string()),
    productsServices: v.string(),
    businessGoals: v.string(),
    challenges: v.string(),
    competitors: v.optional(v.string()),
    usp: v.string(),
    communicationChannels: v.array(v.string()),
    securityRequirements: v.optional(v.array(v.string())),
    privacyPolicyAgreed: v.boolean(),

    // Section 2: Segment Selection
    segments: v.array(v.string()),

    // Segment-specific data (stored as flexible objects)
    b2bData: v.optional(v.any()),
    b2gData: v.optional(v.any()),
    adamData: v.optional(v.any()),

    // Section 6: Attachments
    attachmentIds: v.optional(v.array(v.string())),

    // Metadata
    status: v.union(v.literal("draft"), v.literal("submitted"), v.literal("converted")),
    sessionId: v.string(),
    submittedAt: v.optional(v.number()),
    convertedToClientId: v.optional(v.id("clients")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_sessionId", ["sessionId"])
    .index("by_email", ["contactEmail"]),

  // ═══════════════════════════════════════
  // CONTRACTS
  // ═══════════════════════════════════════
  contracts: defineTable({
    clientId: v.id("clients"),
    title: v.string(),
    content: v.string(),           // Rich text HTML content
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("viewed"),
      v.literal("changes_requested"),
      v.literal("client_signed"),
      v.literal("countersigned"),
      v.literal("final")
    ),
    version: v.number(),           // Increments on each publish
    sections: v.optional(v.array(v.object({
      id: v.string(),
      title: v.string(),
      content: v.string(),
    }))),
    // Signatures
    clientSignature: v.optional(v.string()),    // Storage ID of signature image
    clientSignedAt: v.optional(v.number()),
    clientSignedBy: v.optional(v.id("users")),
    adminSignature: v.optional(v.string()),     // Storage ID of signature image
    adminSignedAt: v.optional(v.number()),
    adminSignedBy: v.optional(v.id("users")),
    // Appendices tracking
    appendices: v.optional(v.array(v.object({
      slot: v.string(),            // "A", "B", "C", "D", "E"
      label: v.string(),           // e.g. "Certificate of Incorporation"
      required: v.boolean(),
      fileId: v.optional(v.id("contractFiles")),
      status: v.union(
        v.literal("empty"),
        v.literal("uploaded"),
        v.literal("verified"),
        v.literal("rejected")
      ),
      rejectionNote: v.optional(v.string()),
    }))),
    // Metadata
    createdBy: v.id("users"),
    publishedAt: v.optional(v.number()),
    viewedAt: v.optional(v.number()),
    finalizedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clientId", ["clientId"])
    .index("by_status", ["status"])
    .index("by_createdBy", ["createdBy"]),

  // ═══════════════════════════════════════
  // CONTRACT VERSIONS
  // ═══════════════════════════════════════
  contractVersions: defineTable({
    contractId: v.id("contracts"),
    version: v.number(),
    content: v.string(),           // Snapshot of content at this version
    sections: v.optional(v.array(v.object({
      id: v.string(),
      title: v.string(),
      content: v.string(),
    }))),
    changedBy: v.id("users"),
    changeNote: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_contractId", ["contractId"])
    .index("by_contractId_version", ["contractId", "version"]),

  // ═══════════════════════════════════════
  // CONTRACT FILES (Appendices + Signatures)
  // ═══════════════════════════════════════
  contractFiles: defineTable({
    contractId: v.id("contracts"),
    storageId: v.string(),         // Convex storage ID
    fileName: v.string(),
    fileType: v.string(),          // MIME type
    fileSize: v.number(),          // bytes
    category: v.union(
      v.literal("appendix"),
      v.literal("signature"),
      v.literal("attachment")
    ),
    slot: v.optional(v.string()),  // "A"–"E" for appendices
    uploadedBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_contractId", ["contractId"])
    .index("by_contractId_category", ["contractId", "category"]),

  // ═══════════════════════════════════════
  // CONTRACT COMMENTS
  // ═══════════════════════════════════════
  contractComments: defineTable({
    contractId: v.id("contracts"),
    sectionId: v.optional(v.string()),  // Contract section ID for threaded comments
    parentId: v.optional(v.id("contractComments")),  // For replies
    content: v.string(),
    authorId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_contractId", ["contractId"])
    .index("by_contractId_sectionId", ["contractId", "sectionId"])
    .index("by_parentId", ["parentId"]),

  // ═══════════════════════════════════════
  // ACTIVITY LOG
  // ═══════════════════════════════════════
  activityLog: defineTable({
    type: v.union(
      v.literal("contract_created"),
      v.literal("contract_published"),
      v.literal("contract_viewed"),
      v.literal("contract_changes_requested"),
      v.literal("contract_client_signed"),
      v.literal("contract_countersigned"),
      v.literal("contract_finalized"),
      v.literal("appendix_uploaded"),
      v.literal("appendix_verified"),
      v.literal("appendix_rejected"),
      v.literal("comment_added"),
      v.literal("client_created"),
      v.literal("questionnaire_submitted"),
      v.literal("client_stage_changed")
    ),
    actorId: v.optional(v.id("users")),  // null for system events
    clientId: v.optional(v.id("clients")),
    contractId: v.optional(v.id("contracts")),
    questionnaireId: v.optional(v.id("questionnaires")),
    metadata: v.optional(v.any()),       // Extra context (e.g., old/new status, comment preview)
    createdAt: v.number(),
  })
    .index("by_clientId", ["clientId"])
    .index("by_contractId", ["contractId"])
    .index("by_type", ["type"])
    .index("by_createdAt", ["createdAt"]),
});
```

---

## 8. API Design

### Philosophy

Convex functions replace traditional REST APIs entirely. The frontend communicates with the backend through Convex's React hooks (`useQuery`, `useMutation`, `useAction`). This provides:

- **Automatic reactivity:** Queries re-run when underlying data changes
- **Type safety:** Full TypeScript types from schema to component
- **Transactional mutations:** All writes are atomic
- **No API versioning:** Functions are deployed alongside the schema

### Next.js API Routes

Only used for external webhooks and the contact form — operations that require an HTTP endpoint:

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/contact` | POST | Contact form → Resend email |

### Convex HTTP Actions

For external services that send webhooks:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/clerk-webhook` | POST | Clerk user events → sync to `users` table |
| `/resend-webhook` | POST | Resend delivery events → update email status |

### Convex Function Map

#### Queries (Read, Reactive)

| Function | Auth | Description |
|----------|------|-------------|
| `users.getCurrent` | Any auth | Get current user profile by Clerk ID |
| `clients.list` | Admin/Staff | List clients with optional filters (stage, search) |
| `clients.getById` | Admin/Staff | Get full client record with contracts |
| `contracts.listForClient` | Client | Get contracts for the authenticated client |
| `contracts.listAll` | Admin/Staff | List all contracts with filters |
| `contracts.getById` | Owner/Admin | Get contract with files, comments, versions |
| `contractComments.listByContract` | Owner/Admin | Get all comments for a contract |
| `contractVersions.listByContract` | Owner/Admin | Get version history for a contract |
| `questionnaires.list` | Admin/Staff | List all submitted questionnaires |
| `questionnaires.getById` | Admin/Staff | Get full questionnaire response |
| `activityLog.listForClient` | Client | Get activity for own contracts |
| `activityLog.listAll` | Admin/Staff | Get all activity (with pagination) |

#### Mutations (Write, Transactional)

| Function | Auth | Description |
|----------|------|-------------|
| `users.upsert` | System (webhook) | Create or update user from Clerk data |
| `clients.create` | Admin/Staff | Create new client record |
| `clients.update` | Admin/Staff | Update client details |
| `clients.updateStage` | Admin/Staff | Move client in pipeline |
| `clients.convertFromQuestionnaire` | Admin/Staff | Create client from questionnaire |
| `contracts.create` | Admin/Staff | Create draft contract for a client |
| `contracts.update` | Admin/Staff | Update contract content |
| `contracts.publish` | Admin/Staff | Publish contract → email client |
| `contracts.markViewed` | Client | Mark as viewed (automatic on open) |
| `contracts.requestChanges` | Client | Request changes with comment |
| `contracts.clientSign` | Client | Sign contract with signature image |
| `contracts.countersign` | Admin | Countersign → finalize contract |
| `contractFiles.generateUploadUrl` | Any auth | Get Convex upload URL |
| `contractFiles.create` | Any auth | Store file metadata after upload |
| `contractFiles.verify` | Admin | Verify an appendix |
| `contractFiles.reject` | Admin | Reject an appendix with note |
| `contractComments.create` | Any auth | Add comment to contract section |
| `questionnaires.submit` | Public | Submit questionnaire response |
| `questionnaires.generateUploadUrl` | Public | Get upload URL for attachments |

#### Actions (Side Effects)

| Function | Auth | Description |
|----------|------|-------------|
| `email.sendContractPublished` | System | Send "contract published" email via Resend |
| `email.sendChangesRequested` | System | Send "changes requested" email |
| `email.sendContractSigned` | System | Send "contract signed" notification |
| `email.sendContractFinalized` | System | Send "contract finalized" email |
| `email.sendQuestionnaireReceived` | System | Send admin notification of new questionnaire |
| `email.sendContactForm` | System | Send contact form email |

---

## 9. Auth & Authorization

### Clerk Configuration

| Setting | Value |
|---------|-------|
| **Auth methods** | Google OAuth, Email/Password |
| **Organization** | Single org (Andy'K Group International) |
| **Roles** | `org:admin`, `org:staff`, `org:client` |
| **Webhook events** | `user.created`, `user.updated`, `user.deleted` |
| **Session token claims** | `role`, `orgId`, `userId` |
| **Redirect URLs** | `/sign-in`, `/sign-up`, `/dashboard`, `/admin` |

### RBAC Matrix

| Resource | Admin | Staff | Client | Public |
|----------|-------|-------|--------|--------|
| Landing page | ✓ | ✓ | ✓ | ✓ |
| Questionnaire (submit) | ✓ | ✓ | ✓ | ✓ |
| Sign in / Sign up | ✓ | ✓ | ✓ | ✓ |
| Client Dashboard | ✓ | — | ✓ (own) | — |
| Admin Dashboard | ✓ | ✓ (assigned) | — | — |
| Create client | ✓ | ✓ | — | — |
| Create contract | ✓ | ✓ | — | — |
| Publish contract | ✓ | ✓ | — | — |
| View contract | ✓ | ✓ | ✓ (own) | — |
| Sign contract | — | — | ✓ (own) | — |
| Countersign | ✓ | — | — | — |
| Upload appendix | ✓ | ✓ | ✓ (own) | — |
| Verify appendix | ✓ | ✓ | — | — |
| Comment | ✓ | ✓ | ✓ (own) | — |
| Manage users | ✓ | — | — | — |
| View questionnaires | ✓ | ✓ | — | — |
| Convert questionnaire | ✓ | ✓ | — | — |

### Next.js Middleware

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/questionnaire(.*)",
  "/api/contact",
]);

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const { userId, orgRole } = await auth();

  if (!userId) {
    return auth.redirectToSignIn();
  }

  if (isAdminRoute(req) && orgRole !== "org:admin" && orgRole !== "org:staff") {
    return Response.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### Convex Auth Integration

Convex functions validate auth using the Clerk JWT:

```typescript
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
```

```typescript
// Helper used in Convex functions
import { QueryCtx, MutationCtx } from "./_generated/server";

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) throw new Error("User not found");
  return user;
}

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  roles: ("admin" | "staff" | "client")[]
) {
  const user = await getCurrentUser(ctx);
  if (!roles.includes(user.role)) {
    throw new Error("Insufficient permissions");
  }
  return user;
}
```

---

## 10. Email Notifications

### Email Templates

10 transactional email templates, all built with React Email and sent via Resend.

| # | Template | Trigger | Recipient | Subject |
|---|----------|---------|-----------|---------|
| 1 | Questionnaire Received | Questionnaire submitted | Admin(s) | New questionnaire from {companyName} |
| 2 | Contract Published | Admin publishes contract | Client | Your contract is ready for review |
| 3 | Contract Viewed | Client opens contract | Admin | {clientName} viewed their contract |
| 4 | Changes Requested | Client requests changes | Admin | {clientName} requested changes to contract #{id} |
| 5 | Contract Re-published | Admin re-publishes after changes | Client | Updated contract ready for review |
| 6 | Contract Signed | Client signs contract | Admin | {clientName} signed contract #{id} |
| 7 | Contract Countersigned | Admin countersigns | Client | Your contract has been countersigned |
| 8 | Contract Finalized | Contract reaches Final state | Both | Contract #{id} is now final |
| 9 | Appendix Verified | Admin verifies appendix | Client | Appendix {slot} has been verified |
| 10 | Appendix Rejected | Admin rejects appendix | Client | Appendix {slot} needs attention |

### Email Template Design

All emails follow a consistent design matching the ADAM brand:

```
┌─────────────────────────────────────────┐
│            [ADAM Logo]                   │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Hi {firstName},                        │
│                                         │
│  {Body text explaining what happened    │
│   and what action to take next.}        │
│                                         │
│         [ Primary CTA Button ]          │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Andy'K Group International LTD         │
│  86-90 Paul Street, London EC2A 4NE     │
│  info@andykgroupinternational.com       │
│                                         │
└─────────────────────────────────────────┘
```

**Styling:**
- Max width: 600px, centered
- Background: `#faf9fb` (bg-light)
- Card: white, 1px `#e2e4ea` border, 8px radius
- Heading: IBM Plex Sans, `#01011b` (foreground)
- Body text: `#525a70` (muted)
- CTA button: `#C9707D` (highlight) background, white text, 8px radius
- Footer: `#8b93a8` (muted-2), small text

### Resend Integration

```typescript
// convex/actions/email.ts
import { Resend } from "resend";
import { action } from "../_generated/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendContractPublished = action({
  args: {
    to: v.string(),
    clientName: v.string(),
    contractTitle: v.string(),
    contractUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await resend.emails.send({
      from: "A.D.A.M. <adam@andykgroupinternational.com>",
      to: args.to,
      subject: "Your contract is ready for review",
      react: ContractPublishedEmail({
        clientName: args.clientName,
        contractTitle: args.contractTitle,
        contractUrl: args.contractUrl,
      }),
    });
  },
});
```

---

## 11. File Structure

```
adam/
├── public/
│   ├── fonts/                          # Local font files (if self-hosted)
│   ├── images/
│   │   ├── adam-logo.png
│   │   ├── ceo.jpeg
│   │   └── co-founder.jpg
│   └── favicon.ico
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout (fonts, Clerk provider, Convex provider)
│   │   ├── globals.css                 # Theme tokens + visual effect classes
│   │   ├── page.tsx                    # Landing page (/)
│   │   │
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx            # Clerk sign-in
│   │   ├── sign-up/
│   │   │   └── [[...sign-up]]/
│   │   │       └── page.tsx            # Clerk sign-up
│   │   │
│   │   ├── questionnaire/
│   │   │   └── page.tsx                # Questionnaire flow
│   │   │
│   │   ├── dashboard/
│   │   │   ├── layout.tsx              # Client sidebar layout
│   │   │   ├── page.tsx                # Client overview
│   │   │   └── contracts/
│   │   │       └── [id]/
│   │   │           └── page.tsx        # Contract viewer (client)
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx              # Admin sidebar layout
│   │   │   ├── page.tsx                # Admin dashboard overview
│   │   │   ├── pipeline/
│   │   │   │   └── page.tsx            # Kanban pipeline view
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx            # Clients list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # Client detail
│   │   │   ├── contracts/
│   │   │   │   ├── page.tsx            # Contracts list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx        # New contract form
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # Contract editor (admin)
│   │   │   └── questionnaires/
│   │   │       ├── page.tsx            # Questionnaire list
│   │   │       └── [id]/
│   │   │           └── page.tsx        # Questionnaire detail
│   │   │
│   │   └── api/
│   │       └── contact/
│   │           └── route.ts            # Contact form handler
│   │
│   ├── components/
│   │   ├── ui/                         # Shadcn/UI components (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── table.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── separator.tsx
│   │   │
│   │   ├── landing/                    # Landing page components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── BackgroundGrid.tsx
│   │   │   ├── LogoBar.tsx
│   │   │   ├── SectionHeader.tsx
│   │   │   ├── RoadmapSection.tsx
│   │   │   ├── TestimonialPair.tsx
│   │   │   ├── PricingSection.tsx
│   │   │   ├── TabSwitcher.tsx
│   │   │   ├── LovedBySection.tsx
│   │   │   ├── FaqSection.tsx
│   │   │   ├── IntegrationsSection.tsx
│   │   │   ├── ContactForm.tsx
│   │   │   ├── CtaSection.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── TronDivider.tsx
│   │   │   ├── LogoIcon.tsx
│   │   │   └── HexLogo.tsx
│   │   │
│   │   ├── questionnaire/             # Questionnaire components
│   │   │   ├── QuestionnaireFlow.tsx   # Main flow controller
│   │   │   ├── QuestionCard.tsx        # Single question display
│   │   │   ├── ProgressBar.tsx         # Completion progress
│   │   │   ├── ReviewPage.tsx          # Answer review before submit
│   │   │   ├── FileUpload.tsx          # Attachment upload
│   │   │   └── SegmentBrancher.tsx     # Conditional section logic
│   │   │
│   │   ├── dashboard/                  # Client dashboard components
│   │   │   ├── DashboardSidebar.tsx
│   │   │   ├── StatusCards.tsx
│   │   │   ├── PipelineDots.tsx        # Q|P|S|C|I|K visualization
│   │   │   ├── ContractCard.tsx
│   │   │   └── ActivityFeed.tsx
│   │   │
│   │   ├── contracts/                  # Contract components
│   │   │   ├── ContractViewer.tsx      # Read-only contract display
│   │   │   ├── ContractEditor.tsx      # Rich text editor (admin)
│   │   │   ├── ContractSidebar.tsx     # Sections, appendices, comments
│   │   │   ├── AppendixUpload.tsx      # Per-slot file upload
│   │   │   ├── AppendixVerifier.tsx    # Admin verify/reject controls
│   │   │   ├── CommentThread.tsx       # Per-section comments
│   │   │   ├── SignatureCanvas.tsx     # Digital signature capture
│   │   │   ├── StatusBadge.tsx         # Contract status indicator
│   │   │   └── VersionHistory.tsx      # Version timeline
│   │   │
│   │   ├── admin/                      # Admin components
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── PipelineBoard.tsx       # Kanban board
│   │   │   ├── PipelineColumn.tsx      # Single kanban column
│   │   │   ├── ClientCard.tsx          # Card in pipeline
│   │   │   ├── ActionItems.tsx         # Pending action list
│   │   │   ├── StatsCards.tsx          # Admin overview cards
│   │   │   └── QuestionnairePreview.tsx # Read-only questionnaire view
│   │   │
│   │   └── shared/                     # Shared components
│   │       ├── ConvexClientProvider.tsx # Convex + Clerk provider wrapper
│   │       ├── ThemeProvider.tsx        # Theme context (if needed)
│   │       └── LoadingSpinner.tsx
│   │
│   ├── lib/
│   │   ├── data.ts                     # Landing page content data
│   │   ├── utils.ts                    # Utility functions (cn, formatDate, etc.)
│   │   └── questionnaire-schema.ts     # Question definitions and validation
│   │
│   └── hooks/
│       ├── useAutoSave.ts              # localStorage auto-save for questionnaire
│       ├── useContractActions.ts       # Contract state transition hooks
│       └── useCurrentUser.ts           # Get current user with role
│
├── convex/
│   ├── _generated/                     # Auto-generated by Convex
│   ├── schema.ts                       # Database schema (see Section 7)
│   ├── auth.config.ts                  # Clerk auth config for Convex
│   │
│   ├── users.ts                        # User queries and mutations
│   ├── clients.ts                      # Client queries and mutations
│   ├── contracts.ts                    # Contract queries and mutations
│   ├── contractFiles.ts               # File upload and management
│   ├── contractComments.ts            # Comment queries and mutations
│   ├── contractVersions.ts            # Version history queries
│   ├── questionnaires.ts             # Questionnaire mutations
│   ├── activityLog.ts                 # Activity log queries
│   │
│   ├── actions/
│   │   └── email.ts                   # Resend email actions
│   │
│   └── http.ts                        # HTTP actions (Clerk webhook, Resend webhook)
│
├── emails/                             # React Email templates
│   ├── QuestionnaireReceived.tsx
│   ├── ContractPublished.tsx
│   ├── ContractViewed.tsx
│   ├── ChangesRequested.tsx
│   ├── ContractRepublished.tsx
│   ├── ContractSigned.tsx
│   ├── ContractCountersigned.tsx
│   ├── ContractFinalized.tsx
│   ├── AppendixVerified.tsx
│   ├── AppendixRejected.tsx
│   └── components/
│       ├── EmailLayout.tsx             # Shared layout wrapper
│       ├── EmailButton.tsx             # CTA button component
│       └── EmailFooter.tsx             # Footer with company info
│
├── middleware.ts                       # Clerk auth middleware
├── next.config.ts                      # Next.js config
├── tailwind.config.ts                  # Tailwind v4 config (if needed beyond globals.css)
├── tsconfig.json
├── package.json
├── .env.local                          # Environment variables
├── .env.example                        # Template for env vars
├── .gitignore
├── PRD.md                              # This document
└── CLAUDE.md                           # Claude Code rules
```

### Environment Variables

```bash
# .env.local

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_WEBHOOK_SECRET=whsec_...

# Convex
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
CONVEX_DEPLOY_KEY=...

# Resend
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=https://adam.andykgroupinternational.com
```

---

## 12. Phased Implementation Plan

### Phase 1: Foundation (Week 1–2)

**Goal:** Project setup, design system, auth, and database schema.

| Task | Description |
|------|-------------|
| Initialize Next.js project | App Router, TypeScript, Tailwind v4 |
| Set up Convex | Schema, dev environment, connection |
| Port design system | Copy `globals.css` tokens, install IBM Plex fonts, configure Tailwind |
| Install Shadcn/UI | Add all needed components, customize theme |
| Set up Clerk | Auth provider, middleware, webhook handler |
| Implement user sync | Clerk webhook → Convex `users` table |
| Create shared components | `ConvexClientProvider`, `LoadingSpinner`, layout shells |
| Deploy to Vercel | CI/CD pipeline, preview environments |

**Deliverable:** App skeleton with auth working, design system applied, schema deployed.

### Phase 2: Landing Page + Questionnaire (Week 2–4)

**Goal:** Public-facing pages complete and functional.

| Task | Description |
|------|-------------|
| Port landing page components | Adapt all components from `andyk-landing` |
| Create `lib/data.ts` | Port all content data |
| Build contact form | API route + Resend integration |
| Build questionnaire flow | TypeForm-style one-at-a-time UI |
| Implement conditional branching | B2B/B2G/ADAM segment logic |
| Add localStorage auto-save | Session-based persistence |
| Build review page | Answer summary with edit navigation |
| Implement submission | Convex mutation + admin email notification |
| File upload | Convex storage for attachments |

**Deliverable:** Visitors can browse landing page and submit questionnaires.

### Phase 3: Client Dashboard + Contract Viewer (Week 4–6)

**Goal:** Authenticated clients can view and interact with contracts.

| Task | Description |
|------|-------------|
| Build client sidebar layout | Navigation, user info, sign-out |
| Build dashboard overview | Status cards, contract list, activity feed |
| Build pipeline dots | Q|P|S|C|I|K visualization |
| Build contract viewer | Rich text rendering, section navigation |
| Build appendix upload | Per-slot file upload with status |
| Build comment threads | Per-section comments |
| Build signature canvas | Drawing capture, PNG storage |
| Implement client actions | Sign, request changes, upload |
| Build email templates | Contract Published, Viewed, Signed emails |

**Deliverable:** Clients can log in, view contracts, sign, upload docs, and comment.

### Phase 4: Admin Dashboard + Contract Management (Week 6–8)

**Goal:** Admins can manage full pipeline and contracts.

| Task | Description |
|------|-------------|
| Build admin sidebar layout | Navigation with admin-specific links |
| Build admin overview | Stats, action items, activity feed |
| Build pipeline kanban | Drag-and-drop board |
| Build client management | CRUD, detail pages, stage management |
| Build contract editor | Rich text editing with toolbar |
| Build publish/countersign flow | State transitions with email triggers |
| Build appendix verification | Verify/reject controls |
| Build questionnaire management | List, detail, convert-to-client |
| Remaining email templates | All 10 templates complete |

**Deliverable:** Full admin workflow operational.

### Phase 5: Polish + Testing + Deployment (Week 8–10)

**Goal:** Production-ready application.

| Task | Description |
|------|-------------|
| Responsive testing | 375px, 768px, 1200px on all pages |
| Performance optimization | Lighthouse > 90, lazy loading, code splitting |
| Accessibility audit | WCAG AA compliance, keyboard navigation |
| Security review | Input validation, auth checks, file validation |
| Error handling | Error boundaries, fallback UI, toast notifications |
| E2E testing | Critical paths: questionnaire submit, contract sign |
| Production deployment | Custom domain, DNS, SSL |
| Documentation | CLAUDE.md with project rules |

**Deliverable:** Production application at `adam.andykgroupinternational.com`.

---

## 13. Success Metrics

### Product Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Questionnaire completion rate | > 60% | Submitted / Started |
| Contract cycle time | < 14 days | Published → Final average |
| Client portal adoption | > 80% | Clients who log in / Total clients |
| Appendix upload rate | > 90% | Uploaded within 7 days of request |

### Technical Metrics

| Metric | Target | Tool |
|--------|--------|------|
| Lighthouse Performance | > 90 | Lighthouse CI |
| Lighthouse Accessibility | > 90 | Lighthouse CI |
| Lighthouse Best Practices | > 90 | Lighthouse CI |
| Lighthouse SEO | > 90 | Lighthouse CI |
| First Contentful Paint (FCP) | < 1.5s | Web Vitals |
| Largest Contentful Paint (LCP) | < 2.5s | Web Vitals |
| Cumulative Layout Shift (CLS) | < 0.1 | Web Vitals |
| Time to Interactive (TTI) | < 3.5s | Lighthouse |
| Uptime | > 99.9% | Vercel analytics |

### Business Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| Clients onboarded via ADAM | 10+ | First 3 months |
| Time saved per client onboarding | > 50% reduction | Compared to manual process |
| Support requests for contract status | < 5/month | Down from email inquiries |

---

## 14. Non-Functional Requirements

### Performance

| Requirement | Target |
|-------------|--------|
| First Contentful Paint (FCP) | < 1.5s |
| Largest Contentful Paint (LCP) | < 2.5s |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Time to Interactive (TTI) | < 3.5s |
| Server components | Default — client components only when needed |
| Image optimization | `next/image` with explicit dimensions on all images |
| Font loading | `next/font/google` with `font-display: swap` |
| Bundle size | Monitor with `@next/bundle-analyzer` |
| Code splitting | Automatic via App Router, lazy load below-fold |

### Security

| Requirement | Implementation |
|-------------|---------------|
| Input validation | Convex argument validators on all mutations |
| File validation | Whitelist MIME types, max 20MB, server-side validation |
| Authentication | Clerk handles all auth. No custom password storage. |
| Authorization | Role checks in every Convex function. No client-side-only guards. |
| CSRF protection | Convex handles via WebSocket transport. API routes use Clerk auth. |
| XSS prevention | React auto-escapes. Rich text sanitized before storage. |
| Audit trail | All state changes logged to `activityLog` with actor and timestamp |
| GDPR | Data enrichment consent in questionnaire. Right to deletion supported. |
| Secrets | All API keys in environment variables. Never in client bundle. |
| Webhook verification | Clerk webhook signature validated. Resend webhook signature validated. |

### Accessibility

| Requirement | Implementation |
|-------------|---------------|
| WCAG level | AA compliance minimum |
| Touch targets | 44px minimum height on all interactive elements |
| Keyboard navigation | All actions reachable via keyboard. Focus trapping in modals. |
| Screen readers | Semantic HTML, ARIA labels on icons, alt text on images |
| Color contrast | `foreground` on white > 7:1 (AAA). `muted` on white > 4.5:1 (AA). |
| Focus indicators | Visible focus rings on all interactive elements |
| Heading hierarchy | Proper H1 → H2 → H3 nesting per page |
| Form labels | All inputs have associated labels (visible or aria-label) |
| Error messages | Clear, specific, associated with the invalid field |
| Reduced motion | Respect `prefers-reduced-motion` media query |

### Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | Last 2 versions |
| Firefox | Last 2 versions |
| Safari | Last 2 versions |
| Edge | Last 2 versions |
| Mobile Safari (iOS) | iOS 15+ |
| Chrome (Android) | Last 2 versions |

### Infrastructure

| Requirement | Provider |
|-------------|----------|
| Hosting | Vercel (Pro plan) |
| Database | Convex (Professional plan) |
| Auth | Clerk (Pro plan) |
| Email | Resend (Pro plan) |
| Domain | `adam.andykgroupinternational.com` |
| SSL | Automatic via Vercel |
| CDN | Automatic via Vercel Edge Network |
| Monitoring | Vercel Analytics + Convex Dashboard |

---

## Appendix A: Contract Appendix Slots

| Slot | Label | Required | Description |
|------|-------|----------|-------------|
| A | Certificate of Incorporation | Yes | Company registration document |
| B | Proof of Address | Yes | Utility bill or bank statement |
| C | Director ID | Yes | Government-issued photo ID |
| D | Financial Statements | No | Latest annual accounts |
| E | Additional Documents | No | Any supporting material |

---

## Appendix B: Pipeline Stages

| Code | Stage | Description |
|------|-------|-------------|
| Q | Questionnaire | Intake form submitted, pending review |
| P | Proposal | Proposal being drafted or sent |
| S | Strategy | Strategy brief in development |
| C | Contract | Contract being negotiated/signed |
| I | Invoice | Payment pending |
| K | Kick-off | Onboarding complete, work begins |

---

## Appendix C: Company Information

| Field | Value |
|-------|-------|
| Company name | Andy'K Group International LTD |
| Registration | 16453500 |
| Address | 86-90 Paul Street, London, EC2A 4NE, UK |
| CEO | Andrej Kneisl |
| CTO | Kobe Janssens |
| Email | info@andykgroupinternational.com |
| Product | A.D.A.M. (Automated Document & Account Manager) |
| Tagline | "A.D.A.M. decides. E.V.A. executes. You grow." |
