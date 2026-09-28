---
name: Campus Operations Command
colors:
  surface: '#fff9ee'
  surface-dim: '#dfd9cf'
  surface-bright: '#fff9ee'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f3e8'
  surface-container: '#f3ede2'
  surface-container-high: '#ede7dd'
  surface-container-highest: '#e8e2d7'
  on-surface: '#1d1b15'
  on-surface-variant: '#494740'
  inverse-surface: '#333029'
  inverse-on-surface: '#f6f0e5'
  outline: '#7a776f'
  outline-variant: '#cbc6bd'
  surface-tint: '#605e59'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1d1c17'
  on-primary-container: '#86837d'
  inverse-primary: '#cac6bf'
  secondary: '#0159c7'
  on-secondary: '#ffffff'
  secondary-container: '#548dfe'
  on-secondary-container: '#002760'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#3f0400'
  on-tertiary-container: '#eb4c30'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e7e2db'
  primary-fixed-dim: '#cac6bf'
  on-primary-fixed: '#1d1c17'
  on-primary-fixed-variant: '#494741'
  secondary-fixed: '#d9e2ff'
  secondary-fixed-dim: '#afc6ff'
  on-secondary-fixed: '#001944'
  on-secondary-fixed-variant: '#004299'
  tertiary-fixed: '#ffdad3'
  tertiary-fixed-dim: '#ffb4a5'
  on-tertiary-fixed: '#3f0400'
  on-tertiary-fixed-variant: '#8f1200'
  background: '#fff9ee'
  on-background: '#1d1b15'
  surface-variant: '#e8e2d7'
typography:
  display-accent:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.015em
  body-default:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: -0.01em
  body-strong:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
  code-base:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  code-badge:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-compact: 0.5rem
  margin: 1rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.375rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system synthesizes mission-critical air traffic control precision with structured Swiss graphic editorialism. Engineered for high-density campus incident dispatch, logistics, and infrastructure intelligence, the interface functions as an analytical cockpit. 

The emotional tone is calm, authoritative, and relentlessly functional. It strips away all decorative artifacts: no blurred transparencies, no skeuomorphic gradients, no casual emoji signifiers, and no playful curves. Visual priority is dictated entirely by information architecture, structural borders, typographic scale, and deliberate, desaturated signal indicators that demand exact operational responses.

## Colors

The palette employs an archival warm bone canvas in light mode and a deep carbon background in dark mode, bypassing sterile clinical whites and harsh pure blacks.

### Base Canvases & Surfaces
- **Canvas Base:** `#F6F4EF` (Light) / `#0C0C0B` (Dark)
- **Primary Panel Surface:** `#FFFFFF` (Light) / `#141412` (Dark)
- **Elevated/Sub-surface:** `#EDE9DE` (Light) / `#1C1B18` (Dark)

### Ink Tokens
- **Ink Primary:** `#14130F` (Light) / `#EDE9DE` (Dark) — Primary headers, core values, dynamic values.
- **Ink Secondary:** `#4A4741` (Light) / `#A39F93` (Dark) — Labels, table column titles, breadcrumbs.
- **Ink Tertiary:** `#8A867D` (Light) / `#66635B` (Dark) — Inactive timestamps, keyboard shortcut keys, inactive metadata.

### Borders
- **Crisp Structural Stroke:** 1px hairline `#E4E0D6` (Light) / `#26251F` (Dark).

### Operational Signal Tokens
Signal colors are restricted strictly to state telemetry and incident priority tiers; they are never used for decorative accents:
- **Critical (P0):** `#E5482D` (Vermilion) — Facility compromise, active hazard, life safety.
- **High (P1):** `#E59B1F` (Amber) — Power outage, HVAC failure, rapid escalation needed.
- **Medium (P2):** `#2F6FDE` (Cobalt) — Maintenance queue, room access lock, scheduled servicing.
- **Low (P3):** `#7A8A7C` (Sage Grey) — Minor cosmetic repairs, telemetry drift, low-urgency tasks.
- **Resolved / Stable:** `#1F8A5B` (Deep Green) — Restored, closed ticket, telemetry verified nominal.

## Typography

The type system pairs modern engineering precision with editorial gravitas:

- **Editorial Anchor (`Newsreader`):** Used sparingly for high-level briefing titles, system incident recaps, and overarching status headers. It acts as the "Swiss editorial" signature against the utilitarian backdrop.
- **Workhorse Engine (`Geist`):** Delivers clean readability across dense data grids, sidebars, and control forms. Configured throughout with tight tracking (`-0.02em` to `-0.01em`) to maintain structural density.
- **Telemetry & Identity (`JetBrains Mono`):** Applied exclusively with tabular numerals (`font-variant-numeric: tabular-nums`) to all incident IDs (e.g., `#INC-8092`), timestamps, coordinates, real-time counters, SLA clocks, and hotkey hints.

## Layout & Spacing

Layout geometry follows an unbroken operational grid designed to display large quantities of relational data without visual fatigue:

- **Grid Architecture:** Multi-column split canvas. A fixed 240px telemetry navigation rail anchors the left, an adaptive 12-column core workspace populates the center, and an optional 380px contextual inspector anchors the right.
- **Rhythm:** Dense 4px base multiplier. Internal component padding favors the compact spectrum (`0.375rem` to `0.75rem`) to maximize visible information density per viewport.
- **Reflow & Responsiveness:** Below 1280px, the right inspector collapses into an overlay drawer. Below 768px, multi-column tables convert to single-column telemetry cards, with primary action bars locking to the bottom screen edge.

## Elevation & Depth

This system avoids ambient dropshadows, blurred halos, and simulated Z-axis elevations. Depth is structured purely through tonal layering and 1px borders:

- **Level 0 (Base Canvas):** `#F6F4EF` light / `#0C0C0B` dark.
- **Level 1 (Data Surfaces & Workspaces):** `#FFFFFF` light / `#141412` dark, bounded by a 1px border (`#E4E0D6` / `#26251F`).
- **Level 2 (Popovers, Dropdowns, Flyout Menus):** Match Surface Level 1, delineated by the same 1px border coupled with an ultra-subtle, non-diffused structural hard shadow: `0 4px 12px rgba(20, 19, 15, 0.06)` light / `0 4px 12px rgba(0, 0, 0, 0.4)` dark.
- **Level 3 (Modal Dialogs):** Centered surfaces bordered by `#E4E0D6` / `#26251F`, placed above a solid 30% tinted backdrop mask (`rgba(20, 19, 15, 0.4)`).

## Shapes

Rounded shapes are tightly controlled to enforce a crisp, machine-tooled posture. Pill shapes, large stadium radiuses, and fully circular interactive elements are prohibited.

- **Interactive Controls (Inputs, Buttons, Dropdowns):** Exact `6px` corner radius.
- **Segmented Tags & Monospace Badges:** Exact `4px` corner radius.
- **Panels, Table Containers, and Cards:** Exact `10px` corner radius.
- **Dialogs & Overlay Modals:** Exact `14px` corner radius.

## Components

### Buttons
- **Primary:** Solid `#14130F` background with `#F6F4EF` text (Light) / `#EDE9DE` with `#0C0C0B` text (Dark). `6px` radius, `height: 32px`, `padding: 0 12px`. Font: `Geist` 13px weight 500. Focus ring: 2px offset border in `#2F6FDE`.
- **Secondary / Ghost:** Transparent background with 1px border `#E4E0D6` (`#26251F` Dark) and `#14130F` text. Active hover state toggles background to `#EDE9DE` (`#1C1B18` Dark).
- **Destructive:** 1px border `#E5482D` with `#E5482D` text. Hover fills background with 10% opacity vermilion.

### Data Chips & Status Badges
- Built using `JetBrains Mono` 11px uppercase tabular type. `4px` radius.
- Composed with a solid 6px indicator dot alongside status text.
- Example (Critical): Background `rgba(229, 72, 45, 0.08)`, border `1px solid rgba(229, 72, 45, 0.25)`, text and dot `#E5482D`.

### Inputs & Form Controls
- Height: `32px`. Radius: `6px`. 1px border `#E4E0D6` on `#FFFFFF` background.
- Focus: Border shifts to `#14130F` with no glowing halo.
- Monospace keyboard shortcut indicators (e.g., `⌘K`) placed flush inside the right padding using tertiary ink.

### Selection Controls (Checkboxes & Radios)
- Square `14px` geometry with `3px` radius for checkboxes; clean circles for radios.
- Inactive: 1px border `#8A867D`. Checked: Solid `#14130F` fill with crisp white vector tick.

### Tables & Dense Lists
- Rows have fixed `36px` heights with 1px horizontal separator rules.
- Header cells: `Geist` 11px uppercase (`label-caps`) in `#4A4741`.
- Row hover: Full row background tint (`#EDE9DE` at 50% opacity in light mode).

### Cards & Dispatch Panels
- `10px` radius, 1px `#E4E0D6` border, `#FFFFFF` interior.
- Header bands are delineated by an internal 1px horizontal rule separating metadata from the card body. No soft drop shadows.