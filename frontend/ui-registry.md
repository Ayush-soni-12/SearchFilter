## UI Registry — SearchFilter

### Base Application and Glass Panels
File: `frontend/src/index.css`
Last updated: 2026-07-29

| Property         | Class / Variable |
| ---------------- | --------------- |
| Background (App) | `var(--bg-color)` with radial gradient |
| Panel Background | `.glass-panel` (`var(--surface-color)`) / `.vercel-card` (`#0a0a0a`) |
| Panel Border     | `1px solid rgba(255, 255, 255, 0.08)` |
| Panel Radius     | `12px` (Vercel Cards) / `16px` (Panels) |
| Shadow           | `0 4px 20px rgba(0, 0, 0, 0.4)` |

**Pattern notes:**
The primary aesthetic is Vercel-inspired monochrome dark mode with subtle transparent borders, optical alignment, and concentric border radii. Any new container, card, or modal should use `.vercel-card` or `.glass-panel`.

### Vercel Aesthetic YouTube Video Card (UI Skills Imprint)
File: `frontend/src/components/ResultCard.jsx`, `frontend/src/index.css`  
Last updated: 2026-07-29 (Inspired by `jakubkrehel/better-ui`)  

| Property | Class / Value |
| --- | --- |
| Card Container | `.vercel-card`: `background: #0a0a0a`, `border: 1px solid rgba(255, 255, 255, 0.08)`, `border-radius: 12px` |
| Concentric Radii | Outer card `12px` ➔ Thumbnail `8px` ➔ Badges `4px-6px` |
| Image Outline | Thumbnail overlay: `outline: 1px solid rgba(255, 255, 255, 0.1); outline-offset: -1px` |
| Hover State | `border-color: rgba(255, 255, 255, 0.18)`, `transform: translateY(-2px)`, `box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6)` |
| Title Typography | `#ededed`, `1.05rem`, `letter-spacing: -0.01em`, hover highlight `#f87171` |
| Tabular Numbers | Duration & view counts use `font-variant-numeric: tabular-nums` |
| Watch CTA | `.watch-btn`: `background: rgba(239, 68, 68, 0.15)`, `border: 1px solid rgba(239, 68, 68, 0.35)`, `color: #fca5a5`, active `scale(0.97)` |

**Pattern notes:**
- Follows concentric border radius principles (`outer = inner + padding`).
- Employs low-opacity white outlines over thumbnails to ensure image crispness against dark backdrops.
- Micro-interactions include hover scale on thumbnails (`scale(1.04)`), play button overlay fade-in, and tactile press scaling (`scale(0.97)`).
