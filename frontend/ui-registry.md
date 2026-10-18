## UI Registry — SearchFilter

### Base Theme System & Light/Dark Mode
Files: [index.css](file:///home/username_anna/Desktop/SearchFilter/frontend/src/index.css), [App.jsx](file:///home/username_anna/Desktop/SearchFilter/frontend/src/App.jsx)  
Last updated: 2026-10-18

| Property | Light Mode (`:root`) | Dark Mode (`[data-theme="dark"]`) |
| --- | --- | --- |
| Canvas Background | `#f8fafc` (`radial-gradient #ffffff -> #f1f5f9`) | `#090a0f` (`radial-gradient #131722 -> #090a0f`) |
| Surface / Cards | `#ffffff` | `#12151e` |
| Primary Text | `#0f172a` (Deep Slate) | `#f8fafc` (Off-white) |
| Secondary Text | `#64748b` (Slate-500) | `#94a3b8` (Slate-400) |
| Border Color (Explicit) | `#cbd5e1` (Slate-300 crisp boundary) | `#262a36` (Clearly visible charcoal border) |
| Card Hover Border | `#64748b` | `#475569` |
| Card Shadow | `0 1px 3px rgba(15, 23, 42, 0.05)` | `0 4px 16px rgba(0, 0, 0, 0.4)` |
| Filter Drawers Background | `#f8fafc` (`var(--filter-bg)`) | `#10131b` (`var(--filter-bg)`) |
| Accent Action | `#0f172a` | `#f8fafc` |

**Pattern notes:**
- The app uses semantic dynamic CSS variables that switch automatically when `data-theme="dark"` is set on `document.documentElement`.
- Navbar includes a persistent theme toggle button saved in `localStorage`.
- All hardcoded hex codes (`#f6f8fa`, `#24292e`, `#d0d7de`) have been eliminated from JSX in favor of CSS variables, ensuring seamless, zero-glare dark/light mode switching.

---

### Minimalist Search Bar Profile (`.search-bar-section`)
Files: [SearchBar.jsx](file:///home/username_anna/Desktop/SearchFilter/frontend/src/components/SearchBar.jsx), [index.css](file:///home/username_anna/Desktop/SearchFilter/frontend/src/index.css)  
Last updated: 2026-10-18

| Property | Value / Class |
| --- | --- |
| Container | `.search-bar-section`: `max-width: 760px; margin: 0 auto 2rem auto; width: 100%` |
| Input Geometry | `.search-input`: `border-radius: 8px; padding: 0.65rem 1rem 0.65rem 2.4rem; font-size: 0.92rem` |
| Integrated Icon | `.search-icon-inside`: Subtle search icon placed inside the left padding of the input |
| Action Button | `.search-button`: `border-radius: 8px; padding: 0.65rem 1.25rem; font-size: 0.88rem; font-weight: 600` |
| Engine Switcher | `.engine-bar`: Compact pill buttons with clean active states (`border-radius: 6px; font-size: 0.8rem`) |
| Filter Drawers | `.filter-drawer`: Clean panel adapting to active theme with explicit `1px solid var(--border-color)` |
| Cache Banner | `.cache-banner`: `max-width: 760px; margin: 0 auto 1.5rem auto; width: 100%` (aligned with `.filter-drawer` width) |
| Keyboard Shortcuts | `Press / to search`: Global key listener focuses search bar and places cursor at end.<br>`Esc`: Blurs / leaves focus from search bar and dismisses history dropdown. |

---

### Multi-Card Results Grid (`.results-grid`)
Files: [App.jsx](file:///home/username_anna/Desktop/SearchFilter/frontend/src/App.jsx), [ResultCard.jsx](file:///home/username_anna/Desktop/SearchFilter/frontend/src/components/ResultCard.jsx), [index.css](file:///home/username_anna/Desktop/SearchFilter/frontend/src/index.css)  
Last updated: 2026-10-18

| Property | Value / Class |
| --- | --- |
| Grid Layout | `.results-grid`: `display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1.15rem; width: 100%` |
| App Container | `.app-container`: `max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem` |
| Cards in Window | Shows **4 to 6 result cards** simultaneously in the viewport without requiring continuous scrolling |
| Card Geometry | `.vercel-card`: `display: flex; flex-direction: column; justify-content: space-between; height: 100%; border: 1px solid var(--card-border); border-radius: 10px` |
| Text Clamping | `.result-snippet`, `.yt-snippet`: 3-line clamp for uniform, balanced card heights across each row |
| YouTube Cards | Clean thumbnail on top with duration badge and play hover effect, metadata row, snippet, and actions pinned to bottom |
| HN & GitHub Cards | Clean title header, owner avatar/author badges, stars/points pills (`.meta-badge`), and score footer |
