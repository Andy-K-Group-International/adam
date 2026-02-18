# A.D.A.M. Design System

**Product**: A.D.A.M. — Automated Document & Account Manager
**Stack**: Next.js 16 + Convex + Auth0 + Tailwind v4
**Type**: SaaS application (landing page, questionnaire flow, client dashboard, admin panel, contracts)

---

## 1. Brand Identity

A.D.A.M. is a professional business-operations platform built by Andy'K Group International. The visual language communicates **precision**, **trust**, and **modern sophistication** — sharp geometry balanced by warm rose/eggplant accents.

Key traits:

- **Sharp, deliberate** — no rounded buttons, clean grid structures
- **Warm but professional** — rose and eggplant accents soften a dark, technical palette
- **Information-dense** — admin and dashboard views prioritise clarity and scanability
- **Layered texture** — dot grids, noise overlays, and glassmorphism add depth without clutter

---

## 2. Color System

All tokens are defined in `globals.css` via Tailwind v4 `@theme inline`.

| Token | Hex | Role |
|---|---|---|
| `--color-foreground` | `#01011b` | Primary text, headings, dark section backgrounds |
| `--color-eggplant` | `#31263b` | Secondary dark, gradient endpoints |
| `--color-highlight` | `#C9707D` | Primary accent — CTAs, active states, badges |
| `--color-rose` | `#F5C0C0` | Warm accent, gradient tints |
| `--color-rose-dark` | `#cda0a5` | Darker rose, gradient border endpoints |
| `--color-muted` | `#525a70` | Body text |
| `--color-muted-2` | `#8b93a8` | Secondary text, labels, placeholders |
| `--color-grid-300` | `#f5f5f7` | Light backgrounds, secondary badge fills |
| `--color-grid-500` | `#e2e4ea` | Borders, dividers |
| `--color-grid-700` | `#c4c8d4` | Strong borders, hover borders |
| `--color-bg-light` | `#faf9fb` | Alternating section backgrounds |
| `--color-background` | `#ffffff` | Page background |
| `--color-success` | `#22c55e` | Success states |
| `--color-warning` | `#f59e0b` | Warning states |
| `--color-error` | `#ef4444` | Error / destructive states |
| `--color-info` | `#3b82f6` | Informational states |

### Semantic usage

- **Dark sections** (CTA, footer): `bg-foreground` with white/muted-2 text.
- **Status colours** (contracts, badges): use `bg-{status}/10 text-{status}` pattern (e.g. `bg-success/10 text-success`).
- **Gradient text**: `.gradient-text` — linear-gradient from eggplant to foreground, background-clipped.

---

## 3. Typography

| Role | Family | Variable |
|---|---|---|
| Body, headings, UI | IBM Plex Sans | `--font-sans` |
| Labels, code, mono elements | IBM Plex Mono | `--font-mono` |

Weights loaded: Sans 300-700, Mono 400/500/700. All fonts use `display: swap`.

### Scale

- **Hero headline**: `clamp(2.375rem, 1.6rem + 2.75vw, 3.75rem)`, bold, `gradient-text`
- **Section headings**: `clamp(1.875rem, 1.52rem + 1.25vw, 2.5rem)`, bold, tracking-tight
- **Subheadings**: `text-lg` / `text-xl`, font-light, `text-muted`
- **Body**: `text-sm` / `text-base`, font-light or regular, `text-muted`
- **Labels**: `.label-mono` — Plex Mono 10px, uppercase, tracking `0.25em`, `text-muted-2`
- **Step labels**: Plex Mono 9px, uppercase, tracking `0.2em`

### Heading pattern

Section headers follow a consistent structure:
```
<span class="label-mono">Section Label</span>
<h2>Main Heading with <span class="font-serif font-light italic">Emphasis</span></h2>
<p class="text-lg text-muted font-light">Supporting copy</p>
```

---

## 4. Layout & Grid

### Content widths

| Context | Max width |
|---|---|
| Hero / narrow sections | `max-w-[900px]` |
| General content | `max-w-[1200px]` |
| Pricing / card grids | `max-w-[960px]` |
| Text blocks | `max-w-[620px]` – `max-w-[700px]` |

### Padding

- Section padding: `py-20 px-8`
- Navbar: `px-6 sm:px-8`, fixed height `h-[60px]`
- Card padding: `p-5` or `p-6`

### Grid patterns

- **Stats cards**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`
- **Pricing cards**: `grid-cols-1 md:grid-cols-3 gap-6`
- **Admin pipeline**: Kanban-style horizontal board
- **Dashboard**: Sidebar + main content area

### Background structures

Layered backgrounds provide depth. Applied via utility classes:

| Class | Description |
|---|---|
| `.cartesian-grid` | 16px dot grid, eggplant-tinted |
| `.cartesian-grid-glow` | Radial highlight glow under dot grid |
| `.hero-gradient` | Radial gradient, white to light pink |
| `.noise-texture` | Animated fractal-noise SVG overlay, 6% opacity |
| `.noise-eggplant` | Eggplant-tinted noise, 3% opacity |
| `.section-bg-grid` | 40px line grid on `bg-light` |
| `.line-grid` | 40px line grid, semi-transparent |
| `.glass-card` | Glassmorphism — translucent fill + inset shadow + backdrop-blur |
| `.section-radial-bg` | Radial rose glow at top of section |
| `.tron-line` | Gradient horizontal divider |

---

## 5. Button System

### CRITICAL RULE: NO border-radius on buttons

All buttons and CTAs must have **sharp corners**. Do not apply `rounded-lg`, `rounded-md`, `rounded-sm`, `rounded-full`, or any border-radius utility to buttons. This is a firm brand decision.

> Cards/containers may use `rounded-xl`.
> Badges/pills may use `rounded-full`.
> **Buttons — NEVER rounded.**

### Variants

#### Primary — `.btn-primary-gradient`
Gradient border (rose-dark to eggplant) with white fill. Inner `::after` pseudo-element adds a subtle rose tint. On hover, the inner layer fades to 30% opacity.

```html
<button class="btn-primary-gradient h-12 px-8 text-sm font-medium text-foreground">
  <span class="relative z-10">Label</span>
</button>
```

#### Default (filled gradient)
Gradient fill from highlight to darker highlight. White text. Used for dashboard/admin actions.

```html
<Button variant="default">Label</Button>
```

#### Secondary — `.btn-secondary`
Transparent background, `border-grid-500`. On hover, border shifts to rose-dark with a faint rose wash.

```html
<Button variant="secondary">Label</Button>
```

#### Dark-section CTA
White background, foreground text. No border-radius. Used inside `bg-foreground` sections.

```html
<a class="bg-white text-foreground py-3 px-4 text-sm font-medium">Label</a>
```

#### Ghost
No border or background. Foreground text. Hover adds `bg-grid-300`.

#### Link
Text-only, highlight colour, underline on hover.

### Sizing

| Size | Height | Padding |
|---|---|---|
| `sm` | `h-8` | `px-3` |
| `default` | `h-10` | `px-5` |
| `lg` | `h-12` | `px-8` |
| `icon` | `h-10 w-10` | — |

**Minimum touch target**: 44px on mobile (achieved via `h-10`+ or `h-12`).

### Known issue in `button.tsx`

The `buttonVariants` base class currently includes `rounded-lg`, and the `sm`/`lg` size variants include `rounded-md`/`rounded-lg`. These must be removed to comply with the no-border-radius rule. Any button usage adding rounding classes inline must also be cleaned up.

---

## 6. Card Patterns

### Standard card

`rounded-xl border border-grid-300 bg-background shadow-sm` (via the `<Card>` component).

### Stats card (admin)

```html
<div class="bg-white rounded-xl border border-grid-300 p-5">
  <!-- icon badge + value + label -->
</div>
```

Icon badges use `p-2 rounded-lg bg-{color}/10`.

### Glass card

`.glass-card` — translucent white fill, multi-layered box-shadow, 7.5px backdrop-blur. Used for feature highlights on the landing page.

### Pricing card

`rounded-xl` container. Highlighted variant uses `bg-foreground text-white` with elevated shadow. Default uses `bg-white border border-grid-300`.

### Highlighted pricing badge

```html
<span class="rounded-full px-3 py-1 text-[10px] uppercase tracking-widest font-mono bg-highlight text-white">
  Popular
</span>
```

---

## 7. Animation & Motion

### Principles

- Prefer CSS transitions over JS animation for standard UI.
- Keep durations short: `200ms` for hovers, `300ms` for state changes, `500ms` for progress bars.
- Use `ease` or `ease-out` easing.

### Implemented animations

| Animation | Duration | Usage |
|---|---|---|
| Button hover | `200ms ease` | All button variants via `transition-all duration-200` |
| Card hover shadow | `300ms` | Pricing cards, feature cards |
| Step progress fill | `500ms ease-out` | `StepProgressBar` connector width |
| Step dot ring | `300ms` | Active step ring expansion |
| Noise texture loop | `8s linear infinite` | Background noise pan |
| Scroll banner | `30s linear infinite` | Logo/partner marquee |
| FAQ expand | `300ms ease` | Max-height transition on `.faq-answer` |

### Fade masks

- `.fade-mask-bottom` / `.fade-mask-top` — CSS `mask-image` linear gradients for soft section edges.
- `.hero-noise-wrapper` — Fades noise upward in the hero.
- `.line-grid-fade` — Fades line grid at top and bottom edges.

---

## 8. Responsive Strategy

### Breakpoints (Tailwind v4 defaults)

| Prefix | Min-width |
|---|---|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |

### Approach

- **Mobile-first**: Base styles target phones; breakpoints add complexity.
- **Fluid typography**: `clamp()` on headings — no hard jumps between sizes.
- **Stack-to-grid**: Card grids collapse to single column on mobile, expand at `sm`/`md`/`lg`.
- **Sidebar collapse**: Dashboard and admin sidebars are visible at `md`+; on mobile, content goes full-width (or uses off-canvas menu).
- **Navbar**: Desktop nav is centered links + right-aligned CTA. Below `md`, a hamburger opens a full-screen overlay menu. Body scroll is locked when open.
- **Form layout**: Hero email + CTA stacks vertically on mobile (`flex-col`), goes horizontal at `sm` (`sm:flex-row`).
- **Touch targets**: All interactive elements maintain 44px minimum tap area on mobile.

---

## 9. Accessibility

### Requirements

- **Focus indicators**: All interactive elements use `focus-visible:ring-2 focus-visible:ring-highlight/50 focus-visible:ring-offset-2`.
- **Colour contrast**: `foreground` (#01011b) on white passes WCAG AAA. `muted` (#525a70) on white passes AA. Avoid `muted-2` as the only text colour for essential information.
- **Semantic markup**: Use `<nav>`, `<section>`, `<main>`, `<button>` (not `<div>` with click handlers).
- **ARIA labels**: Hamburger menu button includes `aria-label`. Icon-only buttons must always have an `aria-label`.
- **Reduced motion**: Respect `prefers-reduced-motion` for non-essential animations (noise, marquee). Critical UI transitions (focus rings, state changes) should remain.
- **Keyboard navigation**: All interactive elements must be reachable via Tab. Modal/menu should trap focus.
- **Form labels**: All form inputs in the questionnaire and admin must have associated `<label>` elements (via the `<Label>` component).

---

## 10. Performance Constraints

### Budgets

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **JavaScript bundle**: Keep initial bundle lean; use dynamic imports for admin/dashboard/contract views.

### Rules

- **Fonts**: IBM Plex Sans + Mono loaded via `next/font/google` with `display: swap`. Only load the weights actually used (Sans: 300-700, Mono: 400/500/700).
- **Images**: Use `next/image` with explicit `width`/`height`. Hero logo is `priority`. All other images are lazy-loaded by default.
- **SVG icons**: Inline SVGs for small icons (nav, check marks). Use Lucide React for admin/dashboard icons — tree-shaken by import.
- **Background textures**: Noise overlays use inline SVG data URIs (no network requests). Keep opacity low to avoid compositing cost.
- **Convex**: Real-time subscriptions are scoped to the active view. Unsubscribe on route change. Questionnaire drafts debounce saves.
- **Auth0**: Auth state is server-checked on protected routes. Client-side `Auth0Provider` wraps the entire app for session awareness.
- **Code splitting**: Admin (`/admin/*`), dashboard (`/dashboard/*`), and contract views (`/contracts/*`) each have their own layout and are code-split at the route level.
