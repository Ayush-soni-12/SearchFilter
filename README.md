# SearchFilter 🔍

A privacy-first, local-only search engine re-ranker and knowledge bookmarking tool. SearchFilter sits between you and Google, allowing you to permanently downrank spam domains, boost high-quality sites you actually want to read, and save useful links locally.

## ✨ Features
- **Local-Only Privacy**: Your search history, domain preferences, and bookmarks never leave your machine (`history.json`, `preferences.json`, `bookmarks.json`).
- **Local Result Bookmarking**: Save useful search results locally. Bookmarks are automatically grouped under their search queries and stored offline.
- **🔖 Search in Bookmarks Only**: Toggle instant, 0ms offline search over your saved bookmarks matching keywords across titles, snippets, domains, URLs, or query names without launching web scrapers.
- **Dedicated Bookmarks View**: View all your saved links in a clean list interface.
- **Live Re-ranking**: Upvote or downvote domains on the fly, and watch your search results re-sort instantly.
- **Junk Filtering**: Results from your "avoid" domains are completely hidden from the main view to keep your feed clean, with a toggle to reveal them if necessary.
- **Smart Result Caching**: Automatically caches recent searches locally (`searchCache/`) with options to pin, renew, or force fresh searches.
- **Glassmorphism UI**: A modern, responsive React interface with dark mode aesthetics.
- **Headful Scraping**: Bypasses bot detection using a persistent headful Chromium instance via Playwright, making CAPTCHA resolution effortless.
- **Deep Pagination**: Scrapes 4 full pages (up to 40 results) behind the scenes for maximum filtering coverage.

## 🚀 How to Run Locally

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Clone and Install
Clone the repository and install all dependencies:

```bash
# Install root dependencies (concurrently)
npm install

# Install backend dependencies
cd backend
npm install

# Install Playwright Chromium browser (CRITICAL)
npx playwright install chromium

# Install frontend dependencies
cd ../frontend
npm install

cd ..
```

### 3. Start the Application
Run both the frontend and backend servers at once using a single command from the project root:

```bash
npm run dev
```

### 4. Start Searching & Bookmarking
Open your browser and navigate to `http://localhost:5173`. 
- Use **Prefer** and **Avoid** to re-rank domain preferences.
- Click **Bookmark** on any search result to save it locally.
- Click **Bookmarks** in the top navigation bar to view your saved collection.
- Toggle **Search in Bookmarks Only** on the search bar for instant offline keyword search over your saved bookmarks!

---
*Note: The first time you execute a live search, a Chromium browser window will open in the background. Do not close it! If Google asks for a CAPTCHA, solve it directly in that browser window, and your search will automatically resume.*
