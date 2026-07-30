## UI Registry — SearchFilter

### Base Theme System & Light/Dark Mode
File: `frontend/src/index.css`, `frontend/src/App.jsx`
Last updated: 2026-07-29

| Property         | Light Mode (`:root`) | Dark Mode (`[data-theme="dark"]`) |
| ---------------- | -------------------- | --------------------------------- |
| Canvas Background| `#fafafa` (`radial-gradient #ffffff -> #fafafa`) | `#050505` (`radial-gradient #121212 -> #050505`) |
| Surface / Cards  | `#ffffff` | `#0a0a0a` |
| Primary Text     | `#111111` (Charcoal) | `#ededed` (Off-white) |
| Secondary Text   | `#666666` | `#888888` |
| Border Color     | `#eaeaea` | `rgba(255, 255, 255, 0.08)` |
| Card Hover Border| `#cccccc` | `rgba(255, 255, 255, 0.18)` |
| Card Shadow      | `0 2px 8px rgba(0, 0, 0, 0.03)` | `0 4px 20px rgba(0, 0, 0, 0.4)` |
| Accent Action    | `#111111` | `#ededed` |

**Pattern notes:**
- The app uses dynamic CSS variables that switch automatically when `data-theme="dark"` is set on `document.documentElement`.
- Navbar includes a persistent theme toggle button saved in `localStorage`.

---

### Vercel Aesthetic Result Card Component (`.vercel-card`)
File: `frontend/src/components/ResultCard.jsx`, `frontend/src/index.css`  
Last updated: 2026-07-29 (Inspired by `jakubkrehel/better-ui` & `leonxlnx/minimalist-ui`)

| Property | Class / Value |
| --- | --- |
| Container | `.vercel-card`: `background: var(--card-bg)`, `border: 1px solid var(--card-border)`, `border-radius: 12px` |
| Concentric Radii | Outer card `12px` ➔ Thumbnail `8px` ➔ Badges `4px-6px` |
| Image Outline | Thumbnail overlay: `outline: 1px solid var(--img-outline); outline-offset: -1px` |
| Hover State | `border-color: var(--card-hover-border)`, `transform: translateY(-2px)`, `box-shadow: var(--card-hover-shadow)` |
| Title Typography | `color: var(--text-primary)`, `1.05rem`, `letter-spacing: -0.01em`, hover highlight `#ef4444` / `#2563eb` |
| Tabular Numbers | Duration & view counts use `font-variant-numeric: tabular-nums` |
| Watch Action CTA | `.watch-btn`: `background: rgba(239, 68, 68, 0.12)`, `border: 1px solid rgba(239, 68, 68, 0.35)`, `color: #ef4444`, active `scale(0.97)` |
| Preference Badges| `.pref-btn`: prefer (`var(--prefer-bg)`), neutral (`var(--neutral-bg)`), avoid (`var(--avoid-bg)`) |

**Pattern notes:**
- Follows concentric border radius principles (`outer = inner + padding`).
- Thumbnail outlines automatically adapt (`rgba(0,0,0,0.1)` in light mode, `rgba(255,255,255,0.1)` in dark mode).
- Micro-interactions include hover scale on thumbnails (`scale(1.04)`), play button overlay fade-in, and tactile press scaling (`scale(0.97)`).

---

### SearchBar & Filter Control Bar
File: `frontend/src/components/SearchBar.jsx`, `frontend/src/index.css`
Last updated: 2026-07-29

| Property | Class / Value |
| --- | --- |
| Search Input | `.search-input`: `border-radius: 99px`, `background: var(--input-bg)`, `border: 1px solid var(--border-color)` |
| Engine Toggles | `.open-btn`: Active (`background: var(--accent-color)`, `color: var(--bg-color)`) / Inactive (`var(--btn-secondary-bg)`) |
| YouTube Filter Bar | `background: #f6f8fa`, `border: 1px solid #d0d7de`, `border-radius: 12px` |
| History Dropdown | `.history-dropdown`: `background: var(--dropdown-bg)`, `<kbd>` shortcuts (`font-family: monospace`) |

**Pattern notes:**
- Engine controls use full pill geometry (`99px`).
- Search history shortcuts format keystrokes in `<kbd>` tags.

---

### GitHub Engine Toolbar & Repository Cards
File: `frontend/src/components/SearchBar.jsx`, `frontend/src/components/ResultCard.jsx`
Last updated: 2026-07-29

| Property | Class / Value |
| --- | --- |
| GitHub Engine Button | `.open-btn`: Active (`background: #24292e`, `color: #ffffff`, `border-color: #24292e`) / Inactive (`#f6f8fa`, `#24292e`) |
| GitHub Filter Bar | `background: #f6f8fa`, `border: 1px solid #d0d7de`, `border-radius: 12px`, `font-size: 0.85rem` |
| GitHub Star Dropdown | `Max Stars`: `< 100` (Ultra Small), `< 500` (Hidden Gems), `< 1,000` (Under-the-radar), `< 5,000` |
| GitHub Language Filter| `Language`: JavaScript, TypeScript, Python, Rust, Go, C++, Java, All |
| GitHub Repo Card | Avatar thumbnail (`44px`, `border-radius: 10px`), Title (`owner/repo`), Star/Fork/Language pill tags |
| Quality Score Badge | `Quality Score: XX` formatted in `font-family: monospace` |

**Pattern notes:**
- Reuses exact Vercel card concentric radii and pastel background structure as YouTube and Google result cards.
- Star, Fork, and Language pill tags use GitHub neutral pastel tokens (`#f6f8fa`, `#ddf4ff`, `#0969da`).

---

### Hacker News Engine Toolbar & Submission Cards
File: `frontend/src/components/SearchBar.jsx`, `frontend/src/components/ResultCard.jsx`
Last updated: 2026-07-30

| Property | Class / Value |
| --- | --- |
| HN Engine Button | `.open-btn`: Active (`background: #24292e`, `color: #ffffff`, `border-color: #24292e`) / Inactive (`#f6f8fa`, `#24292e`) |
| HN Filter Bar | `background: #f6f8fa`, `border: 1px solid #d0d7de`, `border-radius: 12px`, `font-size: 0.85rem` |
| HN Type Filter | `Type`: Stories (`story`), Ask HN (`ask_hn`), Show HN (`show_hn`), Polls (`poll`), Comments (`comment`), All (`all`) |
| HN Numeric Filters | `Min Points`: 0, 10+, 50+, 100+, 500+ \| `Min Comments`: 0, 5+, 20+, 50+ |
| HN Date Filter | `Date Range`: All Time, Past 24 Hours, Past Week, Past Month, Past Year |
| Search Submit CTA | `background: #24292e`, `border-color: #24292e`, `color: #ffffff` |
| HN Card Design | `.vercel-card`: `border-radius: 12px`, `border: 1px solid var(--card-border)` |
| HN Discussion CTA | `.open-btn`: `background: var(--btn-secondary-bg)`, `border-color: var(--border-color)`, `color: var(--text-primary)` |
| HN Metadata Tags | Points (`#f6f8fa`, `#24292e`), Comments (`#f6f8fa`, `#57606a`), Author (`#f6f8fa`, `#57606a`), Post Type (`#ddf4ff`, `#0969da`) |

**Pattern notes:**
- Converted to match the standardized Vercel clean theme palette (`#24292e`, `#f6f8fa`, `#d0d7de`) used across GitHub and YouTube.
- Provides two distinct CTAs (**HN Discussion** and **Visit Site**) formatted with concentric border radii and subtle hover interactions.


