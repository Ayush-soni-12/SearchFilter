# PROJECT MAP — SearchFilter

> **Agent Guidance**: Consult this map first before reading or searching the codebase. Use the paths below to target only the files relevant to the user request. Update this file whenever files, endpoints, or core architecture change.

---

## 1. System Overview
- **Type**: Multi-engine search aggregator with customizable preferences, caching, and bookmarking.
- **Backend**: Node.js + Express (ES Modules) running on `http://localhost:4001`.
- **Frontend**: React 18 + Vite running on `http://localhost:5173`.
- **Styling**: Vanilla CSS with CSS variables (`index.css`), light/dark themes (`data-theme`).
- **Active Specification**: [`noise_reduction_architecture_plan.md`](file:///home/username_anna/Desktop/SearchFilter/noise_reduction_architecture_plan.md) — 5-phase plan for paywall shields, primary source engines, pre-flight content screeners, and anti-echo chamber deduplication.

---

## 2. Backend Architecture (`/backend`)

### Core Entrypoint
- [`backend/server.js`](file:///home/username_anna/Desktop/SearchFilter/backend/server.js): Express server initialization, CORS configuration, route mounting, and `/health` check.

### API Routes & Controllers
- [`backend/routes/searchRoutes.js`](file:///home/username_anna/Desktop/SearchFilter/backend/routes/searchRoutes.js) → [`backend/controllers/searchController.js`](file:///home/username_anna/Desktop/SearchFilter/backend/controllers/searchController.js):
  - `GET /api/search`: Main query endpoint. Orchestrates search provider, preference ranking, and caching.
- [`backend/routes/preferencesRoutes.js`](file:///home/username_anna/Desktop/SearchFilter/backend/routes/preferencesRoutes.js) → [`backend/controllers/preferencesController.js`](file:///home/username_anna/Desktop/SearchFilter/backend/controllers/preferencesController.js):
  - `GET/POST /api/preferences`: User domain boost/block rules and engine preferences.
- [`backend/routes/historyRoutes.js`](file:///home/username_anna/Desktop/SearchFilter/backend/routes/historyRoutes.js) → [`backend/controllers/historyController.js`](file:///home/username_anna/Desktop/SearchFilter/backend/controllers/historyController.js):
  - `GET/POST/DELETE /api/history`: Recent search history management.
- [`backend/routes/bookmarksRoutes.js`](file:///home/username_anna/Desktop/SearchFilter/backend/routes/bookmarksRoutes.js) → [`backend/controllers/bookmarksController.js`](file:///home/username_anna/Desktop/SearchFilter/backend/controllers/bookmarksController.js):
  - `GET/POST/DELETE /api/bookmarks`: Saved result bookmarks.
- [`backend/routes/ratingsRoutes.js`](file:///home/username_anna/Desktop/SearchFilter/backend/routes/ratingsRoutes.js) → [`backend/controllers/ratingsController.js`](file:///home/username_anna/Desktop/SearchFilter/backend/controllers/ratingsController.js):
  - `GET/POST /api/ratings`, `POST /api/ratings/sync`: Good/Bad resource rating persistence (`ratings.json`).
- [`backend/routes/paywallsRoutes.js`](file:///home/username_anna/Desktop/SearchFilter/backend/routes/paywallsRoutes.js) → [`backend/controllers/paywallsController.js`](file:///home/username_anna/Desktop/SearchFilter/backend/controllers/paywallsController.js):
  - `GET/POST /api/paywalls`, `POST /api/paywalls/sync`: User-flagged paywall persistence (`paywalls.json`).
- [`backend/routes/visitedRoutes.js`](file:///home/username_anna/Desktop/SearchFilter/backend/routes/visitedRoutes.js) → [`backend/controllers/visitedController.js`](file:///home/username_anna/Desktop/SearchFilter/backend/controllers/visitedController.js):
  - `GET/POST /api/visited`, `POST /api/visited/sync`: Dedicated visited tracking persistence (`visited.json`).
- [`backend/routes/notRelevantRoutes.js`](file:///home/username_anna/Desktop/SearchFilter/backend/routes/notRelevantRoutes.js) → [`backend/controllers/notRelevantController.js`](file:///home/username_anna/Desktop/SearchFilter/backend/controllers/notRelevantController.js):
  - `GET/POST /api/not-relevant`, `POST /api/not-relevant/sync`: User-flagged irrelevance persistence (`notRelevant.json`).

### Services (`/backend/services`)
- [`searchProviderFactory.js`](file:///home/username_anna/Desktop/SearchFilter/backend/services/searchProviderFactory.js): Factory returning provider instance by name (`google`, `duckduckgo`, `brave`, `primary`, `github`, `hn`, `youtube`).
- **Engine Providers**:
  - [`googleSearchService.js`](file:///home/username_anna/Desktop/SearchFilter/backend/services/googleSearchService.js): Google Custom Search / scraping provider.
  - [`duckDuckGoSearchService.js`](file:///home/username_anna/Desktop/SearchFilter/backend/services/duckDuckGoSearchService.js): DuckDuckGo API / scraping provider.
  - [`braveSearchService.js`](file:///home/username_anna/Desktop/SearchFilter/backend/services/braveSearchService.js): Brave Search API provider.
  - [`primarySourcesSearchService.js`](file:///home/username_anna/Desktop/SearchFilter/backend/services/primarySourcesSearchService.js): Dedicated primary sources provider interleaving arXiv research papers and scoped Linux kernel/systems web docs.
  - [`githubSearchService.js`](file:///home/username_anna/Desktop/SearchFilter/backend/services/githubSearchService.js): GitHub repository/code search.
  - [`hnSearchService.js`](file:///home/username_anna/Desktop/SearchFilter/backend/services/hnSearchService.js): Algolia Hacker News search API.
  - [`youtubeSearchService.js`](file:///home/username_anna/Desktop/SearchFilter/backend/services/youtubeSearchService.js): YouTube search with durations and metadata.
- **Support Services**:
  - [`cacheService.js`](file:///home/username_anna/Desktop/SearchFilter/backend/services/cacheService.js): File-based query caching in `backend/searchCache/`.
  - [`storageService.js`](file:///home/username_anna/Desktop/SearchFilter/backend/services/storageService.js): Local JSON persistence (`history.json`, `bookmarks.json`, `preferences.json`, `ratings.json`, `paywalls.json`, `visited.json`, `notRelevant.json`).
  - [`primarySourcesService.js`](file:///home/username_anna/Desktop/SearchFilter/backend/services/primarySourcesService.js): Authoritative domain profile registry (`Linux Kernel`, `Systems Research`, `Hardware Spec`, `Standards & RFCs`, `Academic Research`) and result annotation.
  - [`echoChamberService.js`](file:///home/username_anna/Desktop/SearchFilter/backend/services/echoChamberService.js): Information Depth scoring (concrete low-level mechanisms vs empty buzzwords), cliché carbon-copy detection, and semantic clustering of redundant 101 overviews.
  - [`preferenceEngine.js`](file:///home/username_anna/Desktop/SearchFilter/backend/services/preferenceEngine.js): Re-ranks and filters search results against user preferences, automatically boosting primary sources (+15 pts), rewarding deep mechanics (+10 pts), penalizing shallow fluff (-10 pts) and echo chambers (-15 pts), and grouping duplicate variants.

---

## 3. Frontend Architecture (`/frontend`)

### Entry & Core
- [`frontend/src/main.jsx`](file:///home/username_anna/Desktop/SearchFilter/frontend/src/main.jsx): React root mounting into `index.html`.
- [`frontend/src/App.jsx`](file:///home/username_anna/Desktop/SearchFilter/frontend/src/App.jsx): Main application container. Manages active engine, query state, filter drawer toggles, rating, visit & relevance filter toggles (`All`, `Primary`, `Visited`, `Not Visited`, `Good`, `Bad`, `Not Relevant`), compact cache pill button with action popover (`Pin`, `Renew`, `Delete`), user-confirmed pagination prompt, bookmarks/history modals, theme toggle, and results grid.
- [`frontend/src/api.js`](file:///home/username_anna/Desktop/SearchFilter/frontend/src/api.js): Centralized API client functions (`search`, `fetchPreferences`, `savePreference`, `fetchBookmarks`, `getVisited`, `setVisited`, `getNotRelevant`, `setNotRelevant`, etc.).
- [`frontend/src/index.css`](file:///home/username_anna/Desktop/SearchFilter/frontend/src/index.css): Design tokens, theme variables (`--bg`, `--card-bg`, `--border-color`), layout styles, responsive media queries.
- [`frontend/ui-registry.md`](file:///home/username_anna/Desktop/SearchFilter/frontend/ui-registry.md): Living design system specs, color tokens, and card geometry reference.

### Components (`/frontend/src/components`)
- [`SearchBar.jsx`](file:///home/username_anna/Desktop/SearchFilter/frontend/src/components/SearchBar.jsx):
  - Primary search input with shortcut listener (`/` to focus, `Esc` to blur).
  - Search engine pill selector (`all`, `google`, `duckduckgo`, `brave`, `primary`, `github`, `youtube`, `hn`).
  - Expandable filter drawer (domain exclusions, date filters, safe search, primary sources index overview, de-duplicate echoes toggle).
  - Search history dropdown with quick-clear and re-query.
- [`ResultCard.jsx`](file:///home/username_anna/Desktop/SearchFilter/frontend/src/components/ResultCard.jsx):
  - Polymorphic card renderer tailored by result type (Web, YouTube video with duration, GitHub repo with stars/languages, Hacker News story with points).
  - Bookmark toggle (`Save`/`Saved`), dedicated `Visited` toggle button (`.visited-btn` with `<Check size={13} />`), Good/Bad resource rating buttons (`👍 Good`/`👎 Bad`), dedicated `Not Relevant` toggle button (`.not-relevant-btn` with `<Ban size={12} />`), discreet manual paywall toggle button (`<Lock size={12} />`), authoritative `.primary-source-badge`, `.depth-badge` (`Deep Mechanics` / `Cliché Heavy`), direct research `.primary-pdf-badge`, paper author metadata, and expandable `.cluster-container` collapsing redundant 101 overviews.

---

## 4. Key Data Flows

### Search Query Flow
```
[SearchBar.jsx] 
   └── calls api.js:search(query, engine, filters)
         └── HTTP GET /api/search?q=...&engine=...
               └── [searchController.js]
                     ├── check [cacheService.js] (hit -> return cached)
                     ├── [searchProviderFactory.js] -> queries selected engine service
                     ├── passes results to [preferenceEngine.js] (boost/filter)
                     ├── saves/appends to [cacheService.js] (accumulates paged URLs; destroys old on forceSearch)
                     ├── records query in [history.json]
                     └── returns JSON results to [App.jsx] -> renders [ResultCard.jsx]
```

### Preference, Bookmark, Visited, Rating & Relevance Flow
- User actions in `SearchBar.jsx` or `ResultCard.jsx` trigger calls in `api.js`.
- Updates persist to `backend/bookmarks.json`, `backend/preferences.json`, `backend/ratings.json`, `backend/visited.json`, or `backend/notRelevant.json` via `storageService.js`.
- Ratings, visited status, and relevance use a hybrid offline-first flow: optimistic instant update to `localStorage` + background async sync to `ratings.json`, `visited.json`, and `notRelevant.json`.

---

## 5. Agent Update Rules
1. **Targeting**: When answering any task, use this map to identify the exact 1–2 files to open. Avoid running exploratory `grep` or directory scans across the whole project.
2. **Maintenance**: If you add/delete routes, components, or services, or modify core data contracts, update the relevant section of this `PROJECT_MAP.md` as the final step of your task.
