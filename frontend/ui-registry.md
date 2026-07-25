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

### SearchBar Component

File: `frontend/src/components/SearchBar.jsx`  
Last updated: 2026-07-25  

| Property | Class / Value |
| --- | --- |
| Background | Input: `rgba(15, 23, 42, 0.6)` / Dropdown: `var(--surface-color)` (blur 16px) |
| Border | Input & Dropdown: `1px solid var(--border-color)` (`rgba(255,255,255,0.08)`) |
| Border radius | Input/Button: `99px` (Pill) / Dropdown: `16px` / Buttons: `8px` / Kbd: `4px` |
| Text — primary | Input & Active Buttons: `var(--text-primary)` (`#f8fafc`), Active Accent: `#60a5fa` |
| Text — secondary | Helper Labels & Shortcuts: `var(--text-secondary)` (`#94a3b8`) |
| Spacing | Input Padding: `1rem 1.5rem` / Dropdown Item: `0.75rem 1.5rem` / Container Gap: `0.75rem` |
| Hover state | Buttons: `background: rgba(255,255,255,0.2)` / Items: `background: rgba(255,255,255,0.05)` |
| Shadow | Dropdown: `0 10px 40px rgba(0, 0, 0, 0.3)` / Focus ring: `0 0 0 3px rgba(59, 130, 246, 0.2)` |
| Accent usage | Primary Action: `var(--accent-color)` (`#3b82f6`) / Active Engine: `#60a5fa` |

**Pattern notes:**
- Search input uses pill radius (`99px`) with glassmorphism backdrop filter (`blur(8px)`).
- History dropdown uses absolute positioning below input with high z-index (`50`), slide-up animation (`animate-slide-up`), and keyboard shortcut indicator header (`Esc` / `Ctrl+Space`).
- Interactive engine toggle buttons use subtle transparent backgrounds with active blue highlight (`rgba(59, 130, 246, 0.25)`).

### CachePopup Card & Button System

File: `frontend/src/App.jsx`, `frontend/src/index.css`  
Last updated: 2026-07-25  

| Property | Class / Value |
| --- | --- |
| Background | Container: `linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)` (blur 16px) |
| Primary Button | `.primary-btn`: `linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)`, text `#ffffff` |
| Secondary Button | `.secondary-btn`: `rgba(255, 255, 255, 0.08)`, border `rgba(255, 255, 255, 0.12)`, text `#e2e8f0` |
| Border | Card: `1px solid rgba(59, 130, 246, 0.35)` |
| Border radius | Card: `20px` / Buttons: `99px` (Pill) / Tag: `6px` |
| Text — primary | Card Title: `#f8fafc` (`1.35rem`, bold) / Primary Action: `#ffffff` |
| Text — secondary | Card Description: `#94a3b8` (`1rem`) / Tag Text: `#60a5fa` |
| Spacing | Card Padding: `2rem` / Button Padding: `0.75rem 1.5rem` / Button Gap: `1rem` |
| Hover state | Primary: `linear-gradient(135deg, #60a5fa, #3b82f6)` (`translateY(-2px)`) / Secondary: `rgba(255, 255, 255, 0.16)` |
| Shadow | Card: `0 12px 40px rgba(0, 0, 0, 0.35)`, `0 0 20px rgba(59, 130, 246, 0.15)` |

**Pattern notes:**
- CachePopup uses glassmorphic dark panel with a soft blue ambient glow (`0 0 20px rgba(59, 130, 246, 0.15)`).
- Matched queries are rendered inside `.matched-query-tag` pill badges (`rgba(59, 130, 246, 0.15)` background, monospace font).
- Action buttons follow the standard app button system (`.primary-btn` for primary CTA, `.secondary-btn` for secondary CTA) with smooth hover transitions (`all 0.25s cubic-bezier(0.16, 1, 0.3, 1)`).

