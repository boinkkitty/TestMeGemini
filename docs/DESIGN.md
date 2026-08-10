# TestMeGemini — Design System

> Last updated: April 2026  
> Stack: Next.js · Tailwind v4 · shadcn/ui · DM Sans

---

## Philosophy

**Modern, sleek, minimal.** The UI should feel like a focused study tool — not a toy. Every design decision favors clarity, information density, and calm. No rainbow chaos, no loud borders, no decorative noise.

Three principles:
1. **Content first** — chrome should disappear; content should shine.
2. **Consistent affordances** — same category always same color; same action always same button style.
3. **Progressive disclosure** — show the overview first, let users drill in.

---

## Color Tokens

Defined in `src/app/globals.css` as CSS custom properties, consumed by Tailwind via `@theme inline`.

### Core palette

| Token | Light value | Usage |
|---|---|---|
| `--background` | `oklch(0.985 0.003 80)` | Page background — warm off-white, not stark |
| `--foreground` | `oklch(0.14 0.005 260)` | Primary text |
| `--card` | `oklch(1 0 0)` | Card / surface backgrounds |
| `--border` | `oklch(0.91 0.004 80)` | Borders, dividers |
| `--border-subtle` | `oklch(0.94 0.003 80)` | Hairline dividers within cards |
| `--muted` | `oklch(0.96 0.004 80)` | Subtle fills (hover, secondary bg) |
| `--muted-foreground` | `oklch(0.52 0.008 260)` | Secondary / tertiary text |

### Accent (primary)

| Token | Value | Usage |
|---|---|---|
| `--primary` | `oklch(0.55 0.2 245)` | Blue — buttons, links, active states |
| `--primary-foreground` | `oklch(1 0 0)` | Text on primary bg |
| `--accent` | `oklch(0.96 0.025 245)` | Light blue tint — hover fills, active nav bg, icon boxes |
| `--accent-foreground` | `oklch(0.55 0.2 245)` | Text on accent bg |
| `--ring` | `oklch(0.55 0.2 245)` | Focus ring |

### Semantic

| Token | Value | Usage |
|---|---|---|
| `--destructive` | `oklch(0.577 0.245 27.325)` | Delete, error states |

### Chart colors

| Token | Hue | Usage |
|---|---|---|
| `--chart-1` | Blue 245 | Primary data series |
| `--chart-2` | Teal 195 | Secondary series |
| `--chart-3` | Violet 275 | Tertiary series |
| `--chart-4` | Amber 65 | Quaternary series |
| `--chart-5` | Rose 354 | Quinary series |

---

## Typography

**Font:** DM Sans via `next/font/google`
Fallback: `system-ui, sans-serif`

Configured in `src/app/layout.tsx` (`DM_Sans`, weights 300–700), token `--font-sans: var(--font-dm-sans)` in globals.css.

| Role | Size | Weight | Class |
|---|---|---|---|
| Page title | 22px / 1.375rem | 700 | `text-2xl font-bold tracking-tight` |
| Section heading | 14–15px | 700 | `text-sm font-bold tracking-tight` |
| Body | 13.5–14px | 400 | `text-sm` |
| Label / caption | 11–12px | 600 | `text-xs font-semibold` |
| Overline | 11px | 700 | `text-[11px] font-bold uppercase tracking-widest` |

**Key rule:** Headings are never blue and never underlined. Color = hierarchy through weight and size only.

---

## Spacing & Layout

| Token | Value |
|---|---|
| `--radius` | `0.625rem` (10px) |
| `--radius-sm` | `6px` |
| `--radius-md` | `8px` |
| `--radius-lg` | `10px` |
| `--radius-xl` | `14px` |

**Sidebar width:** 232px (`position: fixed`, `top-0 left-0 bottom-0 h-screen`)
**Main content offset:** `ml-[232px]` on `<main>` in `(protected)/layout.tsx`
**Page padding:** `p-8` (32px) on all protected pages  
**Card gap:** `gap-4` to `gap-6` depending on density  
**Section gap within a card:** `gap-2.5` to `gap-3`

---

## Components

### Sidebar

- **Background:** `bg-card` with `border-r border-border`
- **Position:** `fixed top-0 left-0 bottom-0 h-screen w-[232px] z-10`
- **Logo mark:** 28×28px, `bg-primary`, rounded-lg, white icon
- **Upload CTA:** Full-width `bg-primary` button, `rounded-lg`, `py-2`
- **Nav items:** `text-muted-foreground`, on active → `bg-accent text-primary font-semibold`
- **User chip:** At bottom — 28px avatar circle (`bg-accent text-primary`), initials, username + email. Fetched via `getUserInfo()`.
- **No dark background** — sidebar is light/white like the rest of the app

### Cards

```
bg-card border border-border rounded-xl
```

- Hover: `hover:shadow-md hover:-translate-y-px`
- No colored borders — color comes from content (badges), not the card itself
- Card header/body separated by `border-b border-border`

### Chapter Cards (`ChapterCard.tsx`)

- `min-h-[180px]`, flex column with `gap-3`
- Top row: category badge (left) + delete icon (right)
- Body: title (15px bold) + description (line-clamp-3)
- Footer: question count (left) + Browse button + Quiz → button (right)
- `onQuiz` prop navigates to `/quiz`; `onClick` opens the chapter browse view

### Attempt Rows (`ChapterAttemptCard.tsx`)

- SVG ring score indicator: 44×44px, `r=18`, `stroke-dasharray`/`strokeDashoffset`, rotated −90°
- Ring track: `var(--border)`, fill: `var(--primary)`
- Score label centered over ring: `text-[11px] font-bold`
- Entire row is clickable (no separate "View →" button)
- Right badge: Great / Decent / Retry with green / orange / red bg

### Category Badges

Deterministic color per category name — same subject always same hue.

```tsx
import { getCategoryColor } from "@/utils/chapterStyles";
const color = getCategoryColor(chapter.category);

<span style={{ background: color.bg, color: color.text }}>
  <span style={{ background: color.dot }} /> {chapter.category}
</span>
```

**Palette (8 slots, hash-assigned):**

| # | BG | Text | Dot |
|---|---|---|---|
| 0 | `#eef2ff` | `#3730a3` | `#6366f1` Indigo |
| 1 | `#f0fdf4` | `#166534` | `#22c55e` Green |
| 2 | `#fff7ed` | `#9a3412` | `#f97316` Orange |
| 3 | `#fdf4ff` | `#6b21a8` | `#a855f7` Purple |
| 4 | `#f0fdfa` | `#115e59` | `#14b8a6` Teal |
| 5 | `#fef9c3` | `#713f12` | `#eab308` Yellow |
| 6 | `#ffe4e6` | `#9f1239` | `#f43f5e` Rose |
| 7 | `#e0f2fe` | `#075985` | `#0ea5e9` Sky |

### Buttons

| Variant | Classes |
|---|---|
| Primary | `bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-semibold` |
| Outline | `bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 rounded-md px-4 py-2 text-sm font-semibold` |
| Destructive | `bg-destructive/10 text-destructive hover:bg-destructive/20` |

### Form Inputs

```
px-3 py-2.5 bg-background border border-border rounded-md text-sm
focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition
```

Labels: `text-xs font-semibold text-muted-foreground tracking-wide`
Textarea: same classes, add `resize-none`

### Empty States

Pattern used when a list has no items or filters return nothing:

```tsx
<div className="flex flex-col items-center gap-3 py-14 text-center border-[1.5px] border-dashed border-border rounded-xl bg-card">
  <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-1">
    {/* contextual SVG icon, text-primary stroke */}
  </div>
  <p className="text-sm font-bold text-foreground">{title}</p>
  <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">{subtitle}</p>
  {/* optional CTA button */}
</div>
```

Key details: `border-dashed` (not solid), icon box `bg-accent`, icon `text-primary` (stroke).

### Quiz Choices

| State | Border | Background | Text |
|---|---|---|---|
| Default | `border-border` | transparent | `text-foreground` |
| Hovered | `border-primary/40` | `bg-accent/50` | — |
| Selected | `border-primary` | `bg-accent` | `text-primary font-semibold` |
| Correct | `border-green-500` | `bg-green-50` | `text-green-800 font-semibold` |
| Incorrect | `border-red-400` | `bg-red-50` | `text-red-800` |

- **MCQ:** Round indicator (`rounded-full`)
- **MRQ:** Square indicator (`rounded`) + "SELECT ALL THAT APPLY" pill in `bg-accent text-primary`

### Score / Attempt Badges

| Range | Classes |
|---|---|
| ≥ 70% | `bg-green-100 text-green-700` |
| 40–69% | `bg-orange-100 text-orange-700` |
| < 40% | `bg-red-100 text-red-700` |

---

## Page Layouts

### Dashboard (3-zone)

```
┌─────────────────────────────────────────┐
│  Header: greeting + Upload Notes CTA    │
├─────────┬──────────┬──────────┬─────────┤
│ Chapters│ Attempts │ Avg Score│ Best    │  ← Stats strip (4 tiles)
├─────────┴──┬────────────────────────────┤
│            │  Weekly Activity           │
│ Continue   ├────────────────────────────┤
│ Studying   │  Score Trend (bar chart)   │
│ (4 rows)   │                            │
├────────────┴────────────────────────────┤
│  Recent Attempts (3 rows, SVG ring)     │
└─────────────────────────────────────────┘
```

Continue Studying rows: Quiz → button visible on hover. Recent Attempts use SVG ring (same as ChapterAttemptCard).

### Chapters

- Search bar + subject filter select
- `grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))]`
- Each card: category badge (top-left), delete (top-right), title, description, footer with Browse + Quiz buttons
- Empty state: dashed border, book icon, title, subtitle, Upload CTA
- Chapter detail: breadcrumb back, progress bar, paginated questions, Show/Hide Answer toggle

### Quiz

1. Chapter selector list
2. Active quiz: category badge, chapter title, progress bar, question card, Previous/Next/Submit nav
3. Results card: score display, Try again

### Attempts

- List: SVG score ring, title, category badge, date, score/max, badge
- Empty state: dashed border, clock icon, title, subtitle
- Detail: per-question review with correct/incorrect/missed highlighted, MRQ labelled

### Upload

- `max-w-[900px]` card
- Section header: "Chapter details" overline
- Top row: Chapter Title + Subject/Category (2-col)
- Two-column main area:
  - Left: PDF dropzone (dashed border, upload icon box, `min-h-[180px]`) + selected file chips
  - Right: Description textarea (optional) + "What happens next" 3-step panel (numbered circles, `bg-accent`)
- Full-width Generate Questions button

### Login / Sign Up

- Centered card (`max-w-sm`), logo mark, tagline, form fields, primary submit button, footer link

---

## Interaction Patterns

- **Hover on cards:** `hover:shadow-md hover:-translate-y-px transition-all` — subtle lift
- **Button press:** `active:scale-[0.98]` where appropriate
- **Focus ring:** 2px, `ring-primary/15` — visible but not loud
- **Nav active state:** background fill + primary text color (no underlines)
- **Loading:** `<LoadingSpinner message="…" />` — keep copy descriptive

---

## What to Avoid

- ❌ Rainbow-colored cards (use category badges instead)
- ❌ Blue underlined headings (use weight/size for hierarchy)
- ❌ Loud colored card borders (orange, blue outlines on stats)
- ❌ Dark navy sidebar
- ❌ Inline `alert()` for errors — use inline error state in form
- ❌ Emoji in UI (except the greeting on Dashboard)
- ❌ Inter or Roboto — stick to DM Sans
- ❌ Solid borders on empty states — always use `border-dashed`
