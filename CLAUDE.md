# A.D.A.M. — Project Init

## Overview
**A**utomated **D**ocument & **A**ccount **M**anager — full client lifecycle management app.
Handles questionnaire intake → proposals → strategy → contracts → invoicing → kick-off.
Has admin dashboard, client dashboard, public questionnaire, and a landing/marketing page.

## Tech Stack
- **Framework**: Next.js 16.1.6 (App Router)
- **React**: 19.2.3
- **Auth**: Supabase Auth (`@supabase/ssr`)
- **Database**: Supabase PostgreSQL (self-hosted on data-server)
- **UI Library**: shadcn/ui (Radix primitives) + Tailwind CSS v4
- **Icons**: Lucide React
- **Email**: Resend (`@react-email/components`)
- **Extras**: canvas-confetti, zod validation
- **Deployment**: Dokploy on app-server

## Project Structure
```
src/
├── app/
│   ├── page.tsx                        # Public landing page
│   ├── layout.tsx                      # Root layout
│   ├── globals.css                     # Global styles
│   ├── questionnaire/page.tsx          # Public questionnaire intake form
│   ├── sign-in/                        # Sign-in page
│   ├── sign-up/                        # Sign-up page
│   ├── create-account/                 # Account creation flow
│   ├── auth/                           # Auth callback handling
│   ├── actions/
│   │   └── email.ts                    # Server action: send emails via Resend
│   ├── admin/
│   │   ├── layout.tsx                  # Admin layout (sidebar)
│   │   ├── page.tsx                    # Admin dashboard overview
│   │   ├── clients/                    # Client list + detail pages
│   │   ├── contracts/                  # Contract list + detail + new
│   │   ├── pipeline/                   # Visual pipeline board
│   │   ├── questionnaires/             # Submitted questionnaire management
│   │   └── questions/                  # Question editor
│   ├── dashboard/
│   │   ├── layout.tsx                  # Client dashboard layout
│   │   ├── page.tsx                    # Client dashboard home
│   │   ├── contracts/                  # Client's contracts view
│   │   ├── documents/                  # Client's documents
│   │   └── profile/                    # Client profile
│   └── api/                            # API routes
├── components/
│   ├── admin/                          # Admin-specific components
│   │   ├── AdminSidebar.tsx
│   │   ├── ClientCard.tsx
│   │   ├── PipelineBoard.tsx           # Drag-and-drop pipeline
│   │   ├── QuestionEditor.tsx
│   │   ├── QuestionnairePreview.tsx
│   │   ├── StatsCards.tsx
│   │   └── ActionItems.tsx
│   ├── contracts/                      # Contract-related components
│   │   ├── AppendixUpload.tsx
│   │   ├── CommentThread.tsx
│   │   ├── ContractViewer.tsx
│   │   ├── SignatureCanvas.tsx
│   │   ├── StatusBadge.tsx
│   │   └── VersionHistory.tsx
│   ├── dashboard/                      # Client dashboard components
│   │   ├── ActivityFeed.tsx
│   │   ├── ContractCard.tsx
│   │   ├── DashboardSidebar.tsx
│   │   ├── PipelineDots.tsx
│   │   └── StatusCards.tsx
│   ├── landing/                        # Public landing page components
│   │   ├── BackgroundGrid.tsx
│   │   ├── CompanyLogo.tsx
│   │   ├── ContactForm.tsx
│   │   ├── CtaSection.tsx
│   │   ├── FaqSection.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── IntegrationsSection.tsx
│   │   ├── LogoBar.tsx
│   │   ├── LovedBySection.tsx
│   │   ├── Navbar.tsx
│   │   ├── PricingSection.tsx
│   │   ├── RoadmapSection.tsx          # 6-step process roadmap
│   │   ├── SectionHeader.tsx
│   │   ├── TestimonialPair.tsx
│   │   └── TronDivider.tsx
│   ├── questionnaire/                  # Questionnaire flow components
│   │   ├── FieldRenderer.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── QuestionCard.tsx
│   │   ├── QuestionnaireFlow.tsx
│   │   ├── ReviewPage.tsx
│   │   └── StepProgressBar.tsx
│   ├── shared/
│   │   └── LoadingSpinner.tsx
│   └── ui/                             # shadcn/ui components (badge, button, card, dialog, etc.)
├── hooks/
│   ├── useAutoSave.ts                  # Auto-save hook for forms
│   └── useCurrentUser.ts              # Current user + role from Supabase
└── lib/
    ├── data.ts                         # Static data (site config, roadmap, founders, pricing, FAQ)
    ├── questionnaire-schema.ts         # Zod schema for questionnaire validation
    ├── utils.ts                        # Utility functions (cn, formatDate, etc.)
    └── supabase/
        ├── client.ts                   # Browser Supabase client
        ├── server.ts                   # Server Supabase client
        ├── admin.ts                    # Service-role client
        ├── middleware.ts               # Auth middleware helper
        ├── storage.ts                  # File storage utilities
        ├── types.ts                    # Generated DB types
        └── queries/                    # Data access layer
            ├── activity-log.ts
            ├── clients.ts
            ├── contract-comments.ts
            ├── contract-files.ts
            ├── contracts.ts
            ├── contract-versions.ts
            ├── proposals.ts
            ├── proposal-templates.ts
            ├── question-items.ts
            ├── questionnaires.ts
            └── users.ts
```

## Key Data Locations (what to edit for common changes)

| Change needed | File(s) to edit |
|---|---|
| Site config (name, company, email) | `src/lib/data.ts` → `siteConfig` |
| Landing page hero text | `src/lib/data.ts` → `heroData` |
| Founder/team bios & photos | `src/lib/data.ts` → `founders` |
| Roadmap steps | `src/lib/data.ts` → `roadmapSteps` |
| Roadmap step icons | `src/components/landing/RoadmapSection.tsx` → `STEP_ICONS` array |
| Pricing plans | `src/lib/data.ts` → `pricingData` |
| FAQ/services section | `src/lib/data.ts` → `faqItems` |
| A.D.A.M. & E.V.A. features | `src/lib/data.ts` → `integrationFeatures` |
| Stats on landing | `src/lib/data.ts` → `statsData` |
| Navigation links | `src/lib/data.ts` → `navLinks` |
| Supabase queries/mutations | `src/lib/supabase/queries/*.ts` |
| Auth flow | `src/hooks/useCurrentUser.ts` + `src/lib/supabase/middleware.ts` |
| Email templates | `src/app/actions/email.ts` |

## Client Pipeline Stages (database order)
`questionnaire → proposal → strategy → contract → invoice → kickoff`

## Critical Rules
- **Identical roadmap**: The roadmap section on this landing page MUST match the andyk-landing site (`/root/andyk-landing/`). Always update both
- **Roadmap icons**: `STEP_ICONS` array is position-matched to `roadmapSteps`. Reorder icons when reordering steps
- **No translations file**: Unlike andyk-landing, this app has NO multi-language support. Text is directly in `data.ts` and components
- **Supabase on data-server**: Database is on data-server, NOT app-server. DB schema changes go through `ssh data-server`
- **shadcn/ui**: UI components live in `src/components/ui/`. Use existing patterns when adding new components

## Build & Deploy
```bash
cd /root/adam && npm run build   # Build check
# Deployment handled by Dokploy
```
