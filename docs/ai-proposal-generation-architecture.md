# AI Proposal Generation — Architecture Plan

> **Status:** Architecture document — NOT yet implemented
> **Author:** Claude (AI architect) + Andy'K Group team
> **Date:** 2026-02-26
> **Context:** This document describes the planned AI-powered proposal generation system for A.D.A.M. Step 2 (Proposal) in the client lifecycle.

---

## 1. Overview

After a client completes the questionnaire (Step 1), the AI reviews all answers and generates an initial proposal with recommended services. The proposal flows through internal review, then to the client for feedback — creating a collaborative, intelligent proposal process.

### Lifecycle Flow

```
Questionnaire Submitted
       ↓
  AI Evaluation
       ↓
  Draft Proposal (auto-generated)
       ↓
  Internal Review (staff adjusts)
       ↓
  Proposal Sent to Client
       ↓
  Client Reviews & Modifies
       ↓
  Proposal Approved → Contract (Step 3)
```

---

## 2. AI Model Selection

### Recommended: Claude (Anthropic API)

| Criteria | Claude 3.5 Sonnet | GPT-4o | Gemini 1.5 Pro |
|----------|-------------------|--------|----------------|
| **Structured output** | Excellent (JSON mode) | Good | Good |
| **Long context** | 200K tokens | 128K tokens | 1M tokens |
| **Cost efficiency** | Best for this use case | Higher cost | Comparable |
| **Data privacy** | No training on inputs | No training on inputs | Requires opt-out |
| **Integration fit** | Native to our stack | Separate SDK | Separate SDK |

**Decision:** Use **Claude 3.5 Sonnet** via the Anthropic API.

- **Primary model:** `claude-sonnet-4-20250514` for proposal generation
- **Fallback model:** `claude-haiku-4-20250414` for quick evaluations (e.g., flagging incomplete questionnaires)
- **Why Claude:** Already used in our automation stack, excellent structured JSON output, strong reasoning for business analysis, competitive pricing (~$3/M input, $15/M output tokens for Sonnet)

### API Integration

```typescript
// Server-side only — never expose API key to client
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

---

## 3. Data Flow: Questionnaire → AI → Proposal

### Step 1: Trigger

When a questionnaire status changes from `draft` → `submitted`:

1. A database trigger (or application-level hook) fires
2. The questionnaire data is formatted into a structured prompt
3. The AI evaluation job is queued

### Step 2: AI Evaluation

```
┌─────────────────────────────────────────────────────┐
│  INPUT                                              │
│                                                     │
│  - All questionnaire answers (structured JSON)      │
│  - Service type (b2b / b2g / adam / e2e)            │
│  - Pre-qualification data                           │
│  - Company profile                                  │
│  - Historical proposal data (for pattern matching)  │
│  - Service catalog with pricing                     │
└──────────────────────┬──────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  CLAUDE AI                                          │
│                                                     │
│  System prompt:                                     │
│  - Role: Senior business development analyst        │
│  - Task: Analyze questionnaire, recommend services  │
│  - Output: Structured JSON proposal                 │
│  - Constraints: Only recommend from our catalog     │
│  - Tone: Professional, strategic, data-driven       │
└──────────────────────┬──────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  OUTPUT (structured JSON)                           │
│                                                     │
│  {                                                  │
│    "executive_summary": "...",                      │
│    "client_analysis": {                             │
│      "strengths": [...],                            │
│      "gaps": [...],                                 │
│      "opportunities": [...]                         │
│    },                                               │
│    "recommended_services": [                        │
│      {                                              │
│        "service_id": "b2b_advance",                 │
│        "name": "B2B ADVANCE Package",               │
│        "rationale": "...",                           │
│        "monthly_price": 1445,                        │
│        "currency": "GBP",                            │
│        "selected": true                              │
│      }                                              │
│    ],                                               │
│    "estimated_timeline": "...",                      │
│    "risk_flags": [...],                              │
│    "confidence_score": 0.85                          │
│  }                                                  │
└─────────────────────────────────────────────────────┘
```

### Step 3: Store & Notify

1. AI output is stored in the `proposals` table
2. Staff receive email notification: "New AI-generated proposal ready for review"
3. Proposal status: `evaluating` → `draft`

---

## 4. Proposal Editor UI

### 4A. Internal Review (Admin Dashboard)

**Route:** `/admin/proposals/[id]`

```
┌──────────────────────────────────────────────────────┐
│  Proposal for: Acme Corp          Status: AI Draft   │
│  Service: End-to-End              Confidence: 85%    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Executive Summary                          [Edit]   │
│  ┌──────────────────────────────────────────────┐    │
│  │ AI-generated summary text...                 │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  Client Analysis                                     │
│  ┌─────────────┬─────────────┬──────────────┐       │
│  │ Strengths   │ Gaps        │ Opportunities │       │
│  │ • ...       │ • ...       │ • ...         │       │
│  └─────────────┴─────────────┴──────────────┘       │
│                                                      │
│  Recommended Services                                │
│  ☑ B2B ADVANCE — £1,445/mo     "Strong fit..."      │
│  ☐ B2G GovExpand — £1,300/mo   "Moderate fit..."    │
│  ☑ A.D.A.M. Config — Custom    "High priority..."   │
│  ☐ CTO-as-a-Service — €200/hr  "Optional..."        │
│                                                      │
│  [Regenerate AI Analysis]  [Send to Client]          │
└──────────────────────────────────────────────────────┘
```

**Key features:**
- Checkbox toggles for each recommended service
- Inline editing of AI-generated text (summary, rationale)
- "Regenerate" button to re-run AI with adjusted parameters
- Side-by-side view: questionnaire answers ↔ proposal
- Audit trail: who changed what, when
- Risk flags highlighted in yellow/red

### 4B. Client-Facing Proposal (Client Dashboard)

**Route:** `/dashboard/proposals/[id]`

```
┌──────────────────────────────────────────────────────┐
│  Your Proposal                       Andy'K Group    │
│  Prepared for: Acme Corp                             │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Executive Summary                                   │
│  Based on your questionnaire responses, we           │
│  recommend the following strategic engagement...     │
│                                                      │
│  Recommended Services                                │
│  ☑ B2B ADVANCE Package — £1,445/mo                  │
│    ↳ 60 qualified leads, multi-touch campaigns...   │
│  ☑ A.D.A.M. Configuration — Custom pricing          │
│    ↳ Full workflow automation setup...              │
│                                                      │
│  Optional Add-ons                                    │
│  ☐ B2G GovExpand — £1,300/mo                        │
│  ☐ CTO-as-a-Service — €200/hr                       │
│                                                      │
│  Estimated Monthly: £2,745                           │
│                                                      │
│  [Request Changes]  [Approve Proposal]               │
└──────────────────────────────────────────────────────┘
```

**Key features:**
- Client can toggle optional services on/off
- "Request Changes" opens a comment thread (existing ContractComment pattern)
- "Approve Proposal" moves to contract generation (Step 3)
- Price auto-calculates based on selected services
- Currency conversion using existing CurrencyContext

---

## 5. Database Schema Additions

### 5A. Extend `proposals` Table

The existing `proposals` table already has these relevant columns:
- `id`, `questionnaire_id`, `client_id`, `status`
- `ai_evaluation` (jsonb) — already exists for AI data

**Add these columns:**

```sql
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS
  ai_model text;                           -- 'claude-sonnet-4-20250514'

ALTER TABLE proposals ADD COLUMN IF NOT EXISTS
  ai_prompt_version text;                  -- 'v1.0' for prompt versioning

ALTER TABLE proposals ADD COLUMN IF NOT EXISTS
  ai_confidence_score numeric(3,2);        -- 0.00-1.00

ALTER TABLE proposals ADD COLUMN IF NOT EXISTS
  recommended_services jsonb DEFAULT '[]'; -- AI-recommended service list

ALTER TABLE proposals ADD COLUMN IF NOT EXISTS
  selected_services jsonb DEFAULT '[]';    -- Staff/client-adjusted selections

ALTER TABLE proposals ADD COLUMN IF NOT EXISTS
  client_modifications jsonb;              -- Track what client changed

ALTER TABLE proposals ADD COLUMN IF NOT EXISTS
  estimated_monthly_total numeric(10,2);

ALTER TABLE proposals ADD COLUMN IF NOT EXISTS
  estimated_currency text DEFAULT 'GBP';
```

### 5B. New `service_catalog` Table

```sql
CREATE TABLE service_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id text UNIQUE NOT NULL,        -- 'b2b_core', 'b2g_govstarter', etc.
  category text NOT NULL,                 -- 'b2b', 'b2g', 'adam', 'tech', 'e2e'
  name text NOT NULL,
  description text,
  base_price numeric(10,2) NOT NULL,
  base_currency text NOT NULL DEFAULT 'GBP',
  billing_period text DEFAULT 'monthly',  -- 'monthly', 'hourly', 'one-time'
  features jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 5C. New `proposal_service_selections` Table

```sql
CREATE TABLE proposal_service_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES proposals(id) NOT NULL,
  service_id text REFERENCES service_catalog(service_id) NOT NULL,
  selected_by text NOT NULL,              -- 'ai', 'staff', 'client'
  is_selected boolean DEFAULT true,
  ai_rationale text,
  ai_fit_score numeric(3,2),             -- 0.00-1.00
  custom_price numeric(10,2),            -- Override if different from catalog
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(proposal_id, service_id)
);
```

---

## 6. System Prompt Design

```
You are a senior business development analyst at Andy'K Group International.

TASK: Analyze a completed client questionnaire and generate a structured proposal recommendation.

INPUT: You will receive:
1. Pre-qualification data (company basics, situation, objectives)
2. Full questionnaire answers (goals, company profile, service preferences)
3. Service catalog (available packages with pricing)

OUTPUT: Return valid JSON with this exact structure:
{
  "executive_summary": "2-3 paragraph analysis of the client's needs",
  "client_analysis": {
    "strengths": ["list of business strengths identified"],
    "gaps": ["list of gaps/weaknesses identified"],
    "opportunities": ["list of growth opportunities"]
  },
  "recommended_services": [
    {
      "service_id": "from catalog",
      "rationale": "why this service fits",
      "priority": "essential|recommended|optional",
      "fit_score": 0.0-1.0
    }
  ],
  "risk_flags": ["any concerns about engagement success"],
  "estimated_timeline": "recommended engagement timeline",
  "confidence_score": 0.0-1.0,
  "notes_for_team": "internal notes for staff review"
}

RULES:
- Only recommend services from the provided catalog
- Be conservative with "essential" — max 2-3 services
- Flag risk if budget doesn't align with recommendations
- For E2E clients, consider the full service stack
- confidence_score reflects how well questionnaire data supports the recommendation
- Always provide rationale grounded in specific questionnaire answers
```

---

## 7. Implementation Phases

### Phase 1: Core AI Pipeline (2-3 weeks)
- [ ] Install `@anthropic-ai/sdk`
- [ ] Create `src/lib/ai/proposal-generator.ts` with prompt + API call
- [ ] Create `service_catalog` table and seed with current packages
- [ ] Add proposal generation trigger on questionnaire submission
- [ ] Store AI output in `proposals.ai_evaluation`
- [ ] Email notification to staff

### Phase 2: Internal Editor UI (2-3 weeks)
- [ ] Build proposal editor page at `/admin/proposals/[id]/edit`
- [ ] Checkbox service selection with price calculation
- [ ] Inline text editing for AI-generated content
- [ ] "Regenerate" functionality with adjusted parameters
- [ ] Side-by-side questionnaire viewer

### Phase 3: Client-Facing Proposal (1-2 weeks)
- [ ] Build `/dashboard/proposals/[id]` view
- [ ] Client service toggle (optional services only)
- [ ] "Request Changes" comment thread (reuse ContractComment)
- [ ] "Approve Proposal" action → trigger contract generation
- [ ] Price auto-calculation with currency conversion

### Phase 4: Licensing for Other Businesses (ongoing)
- [ ] Multi-tenant support: each business gets their own service catalog
- [ ] Custom system prompts per tenant (business-specific AI behavior)
- [ ] White-label proposal templates
- [ ] Tenant-scoped data isolation
- [ ] API for external integrations

---

## 8. How This Fits A.D.A.M.'s Architecture

### Current Pipeline
```
questionnaire → proposal → strategy → contract → invoice → kickoff
```

### With AI Proposal Generation
```
questionnaire → [AI EVALUATION] → proposal (AI draft)
                                     ↓
                              internal review (staff)
                                     ↓
                              client review
                                     ↓
                              approved proposal → contract → ...
```

### Existing Code Integration Points

| Component | How AI Proposals Connect |
|-----------|------------------------|
| `questionnaires.ts` queries | Trigger AI evaluation on `status: 'submitted'` |
| `proposals.ts` queries | Store AI output, manage status transitions |
| `ProposalTemplate` model | AI uses templates as output structure guidance |
| `PipelineBoard.tsx` | Show AI proposal status in visual pipeline |
| `ActivityLog` | Log AI evaluation events |
| `email.ts` actions | Notify staff of new AI proposals, clients of sent proposals |
| `ContractComment` | Reuse for proposal change requests |
| `CurrencyContext` | Apply to proposal pricing display |

### A.D.A.M. as Licensed Product

When sold to other businesses:
1. **Each licensee** gets their own Supabase project (or schema)
2. **Service catalog** is per-tenant — each business defines their own offerings
3. **System prompt** is customizable per tenant — the AI adapts to their business
4. **Proposal templates** are tenant-specific branding
5. **The AI pipeline is the same** — only the data and prompts change
6. **Pricing:** Anthropic API costs passed through + margin, or flat monthly fee with usage cap

---

## 9. Cost Estimation

| Item | Cost |
|------|------|
| Claude Sonnet per proposal (~4K input, ~2K output tokens) | ~$0.04/proposal |
| Claude Haiku for pre-screening | ~$0.001/evaluation |
| 100 proposals/month estimate | ~$4-5/month API cost |
| Development time (Phases 1-3) | ~5-8 weeks |

The AI cost per proposal is negligible. The main investment is development time.

---

## 10. Security & Privacy Considerations

- **API key server-side only** — never exposed to client
- **Data minimization** — only send relevant questionnaire fields to AI, not raw DB records
- **Audit trail** — log every AI call (model, prompt version, input hash, output)
- **Human in the loop** — AI proposals ALWAYS reviewed by staff before client sees them
- **GDPR compliance** — AI processing disclosed in privacy policy, right to human review
- **Data retention** — AI inputs/outputs stored alongside proposal, deleted with client data
- **Prompt injection protection** — questionnaire answers sanitized before inclusion in prompt
