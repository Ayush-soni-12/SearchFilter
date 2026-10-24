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
| Cache Indicator | `.cache-pill-btn`: Compact inline pill button (`<Database size={13} /> Cached ▾`) positioned in `SearchBar` subrow next to Bookmarks toggle. Expands `.cache-popover-menu` with Pin, Renew, and Delete actions, eliminating all bulky banners from above the results grid. |
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
| Card Header Layout | `.result-header-main`: Left-aligned title (`flex: 1; min-width: 0`), clickable directly to destination.<br>`.result-header-actions`: Vertical column (`flex-direction: column`) on the right containing `.bookmark-btn`, `.visited-btn`, `.rating-btn-group`, and `.not-relevant-btn` without redundant "Open" button. |
| Dedicated Visited Action | `.visited-btn`: Dedicated visited toggle button (`<Check size={13} /> Visited`) allowing users to mark a resource as visited without needing to classify it as Good or Bad. Stored hybrid: instant optimistic update to `localStorage` + background persistence in `backend/visited.json`. Triggers `.is-visited` subtle emerald border feedback on card. |
| Resource Rating Action | `.rating-btn-group`: Good / Bad (`.like-btn` / `.dislike-btn`) toggle buttons. Green/emerald active state for Good (`.is-good`), rose/red active state with slight card dimming for Bad (`.is-bad`). Rating a resource also marks it as visited. Stored hybrid: instant optimistic update to `localStorage` + background persistence in `backend/ratings.json`. |
| Not Relevant Action | `.not-relevant-btn`: Dedicated toggle button (`<Ban size={12} /> Not Relevant`) allowing users to flag out results not relevant to their search query. Differentiated with violet/indigo accents (`#7c3aed` / `#a78bfa`), leaving amber exclusively for paywalls. Stored hybrid: instant optimistic update to `localStorage` + background persistence in `backend/notRelevant.json`. Triggers `.is-not-relevant` card styling (opacity 0.55, violet border, restore to 0.95 on hover) without redundant text clutter next to the domain. |
| Bookmark Action | `.bookmark-btn`: Toggle button (`Save` -> `Saved` with blue active state) allowing users to bookmark results |
| Rating, Visit & Relevance Filter Bar | `.results-header-bar` & `.rating-filter-group`: Filter pills (`All`, `Primary`, `Visited`, `Not Visited`, `Good`, `Bad`, `Not Relevant`) with live count badges, plus a dashed `Hide Not Relevant (N)` / `Hidden (N)` toggle button. The `Not Relevant` filter isolates flagged results, while the hide toggle allows hiding them during broad browsing. |
| Pagination Prompt | `.load-more-prompt`: Manual confirmation card asking the user if they want more results before fetching. Eliminates unexpected automatic auto-scrolling fetches. |
| Manual Paywall Flag | `.action-icon-mini-btn.paywall-toggle-btn`: Discreet 25px x 25px lock icon button in `.result-header-actions` next to Bookmark. Allows 1-click toggling of paywall status stored in `backend/paywalls.json` and synced optimistically. Flagged links display `.paywall-badge.manual` in amber next to the domain. |
| Primary Source Engine & Badges | `.engine-btn.primary-engine-btn`: Specialized search mode scoping Linux Kernel, USENIX/arXiv, and Hardware specs.<br>`.primary-source-badge`: Compact pill next to domain with category (`Linux Kernel` in sky blue, `Systems Research` in purple, `Hardware Spec` in orange).<br>`.primary-pdf-badge`: Emerald green badge for 1-click access to open-access paper PDFs. |
| Information Depth Badges | `.depth-badge.deep`: Cyan pill (`⚡ Deep Mechanics`) indicating concrete registers, kernel structures, and low-level code tokens.<br>`.depth-badge.shallow`: Rose pill (`⚠️ Cliché Heavy`) flagging empty buzzwords and superficial fluff. |
| Redundant Cluster Accordion | `.cluster-container` & `.cluster-toggle-btn`: Accordion at card bottom collapsing redundant 101 overviews under 1 representative card. Expands `.cluster-variants-list` with direct links and snippets without polluting the viewport. |




