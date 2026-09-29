---
version: alpha
name: SuaraDagang
description: Editorial workspace for Bali UMKM — ink-on-paper editorial serif with fuel-orange action accent, hairline structure, dark rail command panel.
colors:
  primary: "#17150f"
  secondary: "#5c574c"
  tertiary: "#e8542f"
  neutral: "#f6f3ec"
  panel: "#fffdf8"
  moss: "#3f7d5a"
  rail: "#17150f"
  rail-ink: "#f6f3ec"
  rail-soft: "#a7a196"
  faint: "#8f897b"
  line: "#17150f"
typography:
  h1:
    fontFamily: Fraunces
    fontSize: 3.8rem
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  h2:
    fontFamily: Fraunces
    fontSize: 2.25rem
    fontWeight: 700
    lineHeight: 1.15
  body-md:
    fontFamily: Space Grotesk
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  kicker:
    fontFamily: IBM Plex Mono
    fontSize: 0.7rem
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.14em"
rounded:
  none: 0px
  sm: 2px
  pill: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  section: 64px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "#fffdf8"
    rounded: "{rounded.none}"
    padding: 12px 24px
    typography:
      fontFamily: Space Grotesk
      fontWeight: 700
      fontSize: 0.875rem
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    rounded: "{rounded.none}"
    padding: 12px 24px
  input:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
  input-rail:
    backgroundColor: transparent
    textColor: "{colors.rail-ink}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
  output-card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.primary}"
    rounded: "{rounded.none}"
    padding: 20px
  tone-chip:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.primary}"
    rounded: "{rounded.none}"
    padding: 6px 11px
  tone-chip-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.none}"
    padding: 6px 11px
---

## Overview

SuaraDagang is a caption + hashtag generator for Bali UMKM (small businesses).
The visual language is **editorial workspace**, not SaaS marketing: ink on warm
paper, serif display headlines, monospace metadata, hairline structure, and a
single dark command rail. The surface archetype is *Operate* — the user is
doing work, not being sold to. Landing content exists only as a compact band
above the tool.

## Colors

- **Primary (#17150f):** near-black warm ink for text, hairlines, and hard
  offset shadows. The structural backbone.
- **Tertiary (#e8542f):** "fuel" orange — the ONLY high-emphasis action
  color (Generate, primary CTAs). Never decorative.
- **Neutral (#f6f3ec):** warm paper background. Never pure white as page bg.
- **Moss (#3f7d5a):** secondary positive accent (hero word highlight, step
  02 marker). Never a button.
- **Rail (#17150f) / rail-ink / rail-soft:** the left command slab. Dark in
  BOTH light and dark mode — it is a fixed anchor, not a theme surface.
- **Dark mode overrides:** paper → #141310, panel → #1d1b17, ink → #f0ece2,
  soft → #b3ac9e, faint → #7d7768, line → #f0ece2, rail → #0c0b09. Applied
  via CSS variables (`:root` / `.dark`), never hardcoded per component.

## Typography

- **Fraunces (display):** headlines, big numbers, empty-state statements.
  Editorial serif gives the tool a crafted, non-template voice.
- **Space Grotesk (body):** all UI text, buttons, form controls.
- **IBM Plex Mono (kicker):** uppercase micro-labels, letterspacing 0.14em —
  section labels, meta rows, step indices. Never for body copy.

## Layout

- Landing band: left-aligned, max-w-6xl, no centered hero.
- Workspace: asymmetric split `grid-cols-[380px_1fr]` — sticky dark rail
  left, output feed right. Stacks vertically under `lg`.
- Sections are separated by hairlines (1.5px solid line), not shadows or
  cards. Output items are full-bleed panels, not floating cards.

## Elevation & Depth

Hard offset shadows only (`3px 3px 0` on buttons, translating on hover/
active). No blur shadows, no glassmorphism. Depth comes from the rail slab
against paper.

## Shapes

Square by default (rounded: none on buttons and output panels), 2px on form
fields, pills only on tone chips. Hard edges match the editorial register.

## Components

- `button-primary` (fuel) is the only high-emphasis action per view. At most
  one per band.
- `button-ghost` for secondary actions (Salin, Lihat cara kerja).
- `tone-chip` segmented control — mono uppercase, active state inverts to
  ink/paper.
- `input` (feed side) vs `input-rail` (dark rail side) — same geometry,
  token-driven colors. Never hardcode either.
- `output-card`: hairline border + panel bg, NO offset shadow.

## Do's and Don'ts

- DO keep fuel orange exclusive to primary actions.
- DO use kickers (mono uppercase) for every meta label.
- DO separate sections with hairlines.
- DON'T add gradient backgrounds, glass cards, or blurred shadows.
- DON'T center the hero or build a 3-equal-card feature grid.
- DON'T add emoji except the theme toggle control.
- DON'T invent fake metrics, testimonials, or pricing.
