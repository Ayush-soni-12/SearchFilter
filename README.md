# SearchFilter 🔍

A privacy-first, local-only search engine re-ranker. SearchFilter sits between you and Google, allowing you to permanently downrank spam domains and boost high-quality sites you actually want to read.

## ✨ Features
- **Local-Only Privacy**: Your history and preferences never leave your machine (`history.json` and `preferences.json`).
- **Live Re-ranking**: Upvote or downvote domains on the fly, and watch your search results re-sort instantly.
- **Glassmorphism UI**: A beautiful, premium React interface.
- **Headful Scraping**: Bypasses bot detection by using a persistent, headful Chromium instance that allows you to easily solve CAPTCHAs if they appear.
- **Deep Pagination**: Scrapes 4 full pages (up to 40 results) behind the scenes to give you maximum filtering power.

## 🚀 How to Run Locally

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Clone and Install
First, clone the repository to your machine. Then, install the dependencies for both the frontend and the backend.

```bash
# Install backend dependencies
cd backend
npm install

# Install Playwright Chromium browser (CRITICAL)
npx playwright install chromium

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Start the Application
You will need two terminal windows open.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### 4. Start Searching
Open your browser and navigate to `http://localhost:5173`. 
Search for anything, and when the results appear, use the **Prefer** and **Avoid** buttons to tailor your web!

---
*Note: The first time you search, a Chromium browser window will open in the background. Do not close it! If Google asks for a CAPTCHA, simply solve it in that window, and your search will automatically continue.*
