## UI Registry — SearchFilter

### Base Application and Glass Panels
File: `frontend/src/index.css`
Last updated: 2026-07-18

| Property         | Class / Variable |
| ---------------- | --------------- |
| Background (App) | `var(--bg-color)` with radial gradient |
| Panel Background | `.glass-panel` (`var(--surface-color)`) |
| Panel Border     | `var(--border-color)` |
| Panel Radius     | `16px` |
| Shadow           | `0 4px 30px rgba(0, 0, 0, 0.1)` |

**Pattern notes:**
The primary aesthetic is glassmorphism. Any new container, card, or modal should use the `.glass-panel` class to inherit the correct blur, surface transparency, and 16px radius. Never hardcode container backgrounds.

### Typography and Colors
File: `frontend/src/index.css`
Last updated: 2026-07-18

| Property         | Class / Variable |
| ---------------- | --------------- |
| Font Family      | `Inter` |
| Text Primary     | `var(--text-primary)` |
| Text Secondary   | `var(--text-secondary)` |
| Result Titles    | `#60a5fa` |
| Prefer Status    | `var(--prefer-color)` / `var(--prefer-bg)` |
| Neutral Status   | `var(--neutral-color)` / `var(--neutral-bg)` |
| Avoid Status     | `var(--avoid-color)` / `var(--avoid-bg)` |

**Pattern notes:**
Always fall back to `var(--text-primary)` for standard text and `var(--text-secondary)` for metadata, hints, or domains. Status badges and preference buttons should strictly use the defined semantic color variables.

### Buttons and Inputs
File: `frontend/src/index.css`
Last updated: 2026-07-18

| Property         | Class / Variable |
| ---------------- | --------------- |
| Radius (Pill)    | `99px` (Primary buttons, inputs, status badges) |
| Radius (Small)   | `8px` (Secondary actions like `.open-btn`) |
| Primary Bg       | `var(--accent-color)` |
| Primary Hover    | `var(--accent-hover)`, `transform: translateY(-2px)` |
| Secondary Bg     | `rgba(255, 255, 255, 0.1)` |
| Secondary Hover  | `rgba(255, 255, 255, 0.2)` |

**Pattern notes:**
Primary interactive elements (search bar, main buttons) use the fully rounded `99px` pill shape. Secondary/utility buttons use `8px`. Hover states rely on slight background opacity increases or subtle Y-axis transforms, keeping the interface feeling dynamic but not overly heavy.

### Hidden Results Toggle Button
File: `frontend/src/index.css`
Last updated: 2026-07-20

| Property         | Class / Value                                                |
| ---------------- | ------------------------------------------------------------ |
| Background       | `rgba(239, 68, 68, 0.1)` (matches --avoid-bg)                 |
| Border           | `1px solid rgba(239, 68, 68, 0.2)`                            |
| Border radius    | `99px` (pill shape)                                          |
| Text — primary   | `#fca5a5` (light red)                                        |
| Text — secondary | `font-size: 0.95rem`, `font-weight: 500`                     |
| Spacing          | `padding: 0.75rem 1.5rem`, `gap: 0.5rem`                     |
| Hover state      | `background: rgba(239, 68, 68, 0.2)`, `transform: translateY(-2px)`, shadow |

**Pattern notes:**
Button uses a soft red tint to indicate it relates to "avoided" domains, matching the main `avoid` badge styling. Uses the standard pill-shape (`99px` radius) used by other primary buttons, and the same `-2px` Y-axis hover lift.

### Hidden Results Container
File: `frontend/src/index.css`
Last updated: 2026-07-20

| Property         | Class / Value                                                |
| ---------------- | ------------------------------------------------------------ |
| Border           | `border-top: 1px dashed var(--border-color)`                  |
| Spacing          | `margin-top: 2rem`, `padding-top: 1.5rem`                    |

**Pattern notes:**
Uses a dashed top-border to visually separate the hidden results from the primary results, clearly delineating the curated boundary.
