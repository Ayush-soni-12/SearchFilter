# UI Pattern Registry

All UI components in this codebase must adhere to the patterns documented here. When building new components, reference existing entries to ensure visual consistency across backgrounds, borders, typography, spacing, and interactive states.

### SearchBar Component

File: `frontend/src/components/SearchBar.jsx`  
Last updated: 2026-07-25  

| Property | Pattern / Token Class |
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
