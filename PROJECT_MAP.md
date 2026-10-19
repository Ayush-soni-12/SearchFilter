# PROJECT MAP — SearchFilter

> **Agent Guidance**: Consult this map first before reading or searching the codebase. Use the paths below to target only the files relevant to the user request. Update this file whenever files, endpoints, or core architecture change.

---

## 1. System Overview
- **Type**: Multi-engine search aggregator with customizable preferences, caching, and bookmarking.
- **Backend**: Node.js + Express (ES Modules) running on `http://localhost:4001`.
- **Frontend**: React 18 + Vite running on `http://localhost:5173`.
- **Styling**: Vanilla CSS with CSS variables (`index.css`), light/dark themes (`data-theme`).

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

### Services (`/backend/services`)
- [`searchProviderFactory.js`](file:///home/username_anna/Desktop/SearchFilter/backend/services/searchProviderFactory.js): Factory returning provider instance by name (`google`, `duckduckgo`, `brave`, `github`, `hn`, `youtube`).
- **Engine Providers**:
  - [`googleSearchService.js`](file:///home/username_anna/Desktop/SearchFilter/backend/services/googleSearchService.js): Google Custom Search / scraping provider.
  - [`duckDuckGoSearchService.js`](file:///home/username_anna/Desktop/SearchFilter/backend/services/duckDuckGoSearchService.js): DuckDuckGo API / scraping provider.
  - [`braveSearchService.js`](file:///home/username_anna/Desktop/SearchFilter/backend/services/braveSearchService.js): Brave Search API provider.
  - [`githubSearchService.js`](file:///home/username_anna/Desktop/SearchFilter/backend/services/githubSearchService.js): GitHub repository/code search.
  - [`hnSearchService.js`](file:///home/username_anna/Desktop/SearchFilter/backend/services/hnSearchService.js): Algolia Hacker News search API.
  - [`youtubeSearchService.js`](file:///home/username_anna/Desktop/SearchFilter/backend/services/youtubeSearchService.js): YouTube search with durations and metadata.
- **Support Services**:
  - [`cacheService.js`](file:///home/username_anna/Desktop/SearchFilter/backend/services/cacheService.js): File-based query caching in `backend/searchCache/`.
  - [`storageService.js`](file:///home/username_anna/Desktop/SearchFilter/backend/services/storageService.js): Local JSON persistence (`history.json`, `bookmarks.json`, `preferences.json`, `ratings.json`).
  - [`preferenceEngine.js`](file:///home/username_anna/Desktop/SearchFilter/backend/services/preferenceEngine.js): Re-ranks and filters search results against user preferences.

---

## 3. Frontend Architecture (`/frontend`)

### Entry & Core
- [`frontend/src/main.jsx`](file:///home/username_anna/Desktop/SearchFilter/frontend/src/main.jsx): React root mounting into `index.html`.
- [`frontend/src/App.jsx`](file:///home/username_anna/Desktop/SearchFilter/frontend/src/App.jsx): Main application container. Manages active engine, query state, filter drawer toggles, rating filter toggles (`All`, `Good`, `Bad`, `Not Visited`), bookmarks/history modals, theme toggle, and results grid.
- [`frontend/src/api.js`](file:///home/username_anna/Desktop/SearchFilter/frontend/src/api.js): Centralized API client functions (`search`, `fetchPreferences`, `savePreference`, `fetchBookmarks`, etc.).
- [`frontend/src/index.css`](file:///home/username_anna/Desktop/SearchFilter/frontend/src/index.css): Design tokens, theme variables (`--bg`, `--card-bg`, `--border-color`), layout styles, responsive media queries.
- [`frontend/ui-registry.md`](file:///home/username_anna/Desktop/SearchFilter/frontend/ui-registry.md): Living design system specs, color tokens, and card geometry reference.

### Components (`/frontend/src/components`)
- [`SearchBar.jsx`](file:///home/username_anna/Desktop/SearchFilter/frontend/src/components/SearchBar.jsx):
  - Primary search input with shortcut listener (`/` to focus, `Esc` to blur).
  - Search engine pill selector (`all`, `google`, `github`, `youtube`, `hn`, etc.).
  - Expandable filter drawer (domain exclusions, date filters, safe search).
  - Search history dropdown with quick-clear and re-query.
- [`ResultCard.jsx`](file:///home/username_anna/Desktop/SearchFilter/frontend/src/components/ResultCard.jsx):
  - Polymorphic card renderer tailored by result type (Web, YouTube video with duration, GitHub repo with stars/languages, Hacker News story with points).
  - Bookmark toggle (`Save`/`Saved`) and Good/Bad resource rating buttons (`👍 Good`/`👎 Bad`) with card border feedback.

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
                     ├── saves to [cacheService.js] & records in [history.json]
                     └── returns JSON results to [App.jsx] -> renders [ResultCard.jsx]
```

### Preference, Bookmark & Rating Flow
- User actions in `SearchBar.jsx` or `ResultCard.jsx` trigger calls in `api.js`.
- Updates persist to `backend/bookmarks.json`, `backend/preferences.json`, or `backend/ratings.json` via `storageService.js`.
- Ratings use a hybrid offline-first flow: optimistic instant update to `localStorage` + background async sync to `ratings.json`.

---

## 5. Agent Update Rules
1. **Targeting**: When answering any task, use this map to identify the exact 1–2 files to open. Avoid running exploratory `grep` or directory scans across the whole project.
2. **Maintenance**: If you add/delete routes, components, or services, or modify core data contracts, update the relevant section of this `PROJECT_MAP.md` as the final step of your task.
