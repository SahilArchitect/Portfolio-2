# DESIGN

Apple-level minimalism. Linear / Vercel-grade restraint. Strict monochrome with one accent. Aggressive whitespace. Spring physics over eased curves. Eased curves only for non-organic motion (progress bars).

This document mirrors the token system at `packages/ui/src/tokens/`. When the token files change, this doc changes in the same commit.

---

## Color

Dark is the default. Light is a peer (not a derivation). The accent is used for **<5% of pixels** — never for body text, never for backgrounds larger than a button or pill.

### Dark theme (default)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0A0A0A` | Page background |
| `--bg-elev` | `#131313` | Cards, modals |
| `--fg` | `#F5F5F5` | Primary text |
| `--fg-muted` | `#888888` | Secondary text, captions |
| `--border` | `rgba(255,255,255,0.08)` | Hairlines |
| `--border-strong` | `rgba(255,255,255,0.16)` | Hover/focus borders |
| `--accent` | `#4FD1C5` | The single accent |
| `--accent-muted` | `rgba(79,209,197,0.16)` | Selection, accent backgrounds |
| `--danger` | `#F87171` | Errors |
| `--success` | `#4ADE80` | Confirmations |
| `--warning` | `#FBBF24` | Warnings |

### Light theme

| Token | Value |
|---|---|
| `--bg` | `#FAFAFA` |
| `--bg-elev` | `#FFFFFF` |
| `--fg` | `#0A0A0A` |
| `--fg-muted` | `#6B6B6B` |
| `--border` | `rgba(0,0,0,0.08)` |
| `--border-strong` | `rgba(0,0,0,0.16)` |
| `--accent` | `#4FD1C5` |
| `--accent-muted` | `rgba(79,209,197,0.12)` |
| `--danger` | `#DC2626` |
| `--success` | `#16A34A` |
| `--warning` | `#D97706` |

### Rules
- No gradients except one optional hero element.
- No glass-morphism. No translucent panels with backdrop blur.
- No shadow stacks. Elevation is communicated by `--bg-elev` and a hairline border.
- Never two accents.

---

## Typography

| Family | Stack |
|---|---|
| Display | `"Söhne", "Inter Tight", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` |
| Mono | `"JetBrains Mono", "Berkeley Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace` |

### Scale (token: `[size, line-height, letter-spacing]`)

| Token | Size | Line | Tracking |
|---|---|---|---|
| `display-xl` | 64 | 68 | -2.5% |
| `display-lg` | 44 | 48 | -2% |
| `display-md` | 32 | 36 | -1.5% |
| `display-sm` | 24 | 30 | -1% |
| `body` | 16 | 26 | 0% |
| `body-sm` | 14 | 22 | 0% |
| `micro` | 13 | 20 | +1% |
| `mono-sm` | 13 | 20 | 0% |

### Weights
- `regular` 400 — body
- `medium` 500 — display, links
- `semibold` 600 — only on micro labels meant to dominate

### Rules
- Tight tracking on display, comfortable on body.
- One face for display, one for mono. **No third face. Ever.**
- Body text minimum 16px on mobile.

---

## Spacing

4px base. Token names match Tailwind's scale (`spacing.4 = 16px`).

### Section rhythm
- Desktop: 120–160px between major sections.
- Mobile: 72–96px.

### Borders & radii
- Hairlines: 1px (`hairlines.thin`), 1.5px (`hairlines.medium`).
- Radii: `sm 4px`, `md 8px`, `lg 12px`, `xl 16px`, `full 9999px`.

### Z-index
| Token | Value |
|---|---|
| `base` | 0 |
| `raised` | 10 |
| `sticky` | 20 |
| `overlay` | 30 |
| `modal` | 40 |
| `cursor` | 9999 |

---

## Motion

Spring physics. Always. Eased curves are reserved for non-organic UI (progress bars, scrubbers).

### Springs

| Preset | Stiffness | Damping | Mass | When |
|---|---|---|---|---|
| `SPRING` | 260 | 30 | 0.8 | The default. Used everywhere unless noted. |
| `SPRING_SNAPPY` | 420 | 32 | 0.6 | Buttons, hovers, the cursor. |
| `SPRING_GENTLE` | 180 | 26 | 1.0 | Page transitions, panel reflow. |

### Variants (named, exported from `@engine-room/ui/motion`)

| Variant | Purpose |
|---|---|
| `fadeUp` | Default reveal. 16px Y travel + opacity. |
| `stagger` | Parent. Children inherit `visible` and animate one after another (60ms stride). |
| `cardHover` | Restrained hover for non-button surfaces: 2px Y nudge, 0.99 scale on tap. |
| `pageEnter` | Top-level route transition. 8px Y travel + opacity, gentle spring. |
| `scrollReveal` | Used with `useInView`. 24px Y travel + opacity. |
| `commandPaletteEnter` | ⌘K palette: scale from 0.96 + Y from -8 + opacity. |
| `progressFill` | The only eased variant. Decelerate easing. |

### Reduced motion
- Globally honored via `<MotionConfig reducedMotion="user">` in each app's root layout.
- The `useMotion()` hook returns `safe(variants)` to strip transforms when transforms (not just spring physics) should disappear entirely.
- The base CSS layer collapses any stray `animation` / `transition` to ~0ms.

### Rules
- **No bare CSS transitions** for entrance.
- **No inline easing curves** in components.
- Eased curves: only `EASE.productive` (200ms, productive curve) and `EASE.decelerate` (400ms, decelerate). Never invent new ones in components.

---

## Cursor

8px circle that scales to 32px on interactive elements. `mix-blend-difference` against the background for automatic legibility.

- Hidden on touch devices (`pointer: coarse`).
- Hidden under `prefers-reduced-motion: reduce`.
- Native I-beam preserved on text inputs and contenteditable surfaces.
- Detection of "interactive" is selector-based: `a, button, [role=button], input, textarea, select, [data-cursor="hover"]`. Custom surfaces opt in via `data-cursor="hover"`.

---

## Components (Phase 2)

shadcn/ui is used **only as a primitive layer**. Every component is restyled aggressively to match the token system. The default shadcn look is a non-starter.

Phase 2 owns the component library. Phase 1 only provides:
- `<Cursor />`
- `cn()` utility

Phase 2 will add: `Button`, `Card`, `Input`, `Textarea`, `Tag`, `Tabs`, `Dialog`, `CommandPalette`, `Markdown`, plus motion-aware section primitives (`<Section>`, `<Reveal>`, `<Stagger>`).
