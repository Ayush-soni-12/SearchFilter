import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PREFERENCES_FILE = path.join(__dirname, '../preferences.json');
const HISTORY_FILE = path.join(__dirname, '../history.json');

const BOOKMARKS_FILE = path.join(__dirname, '../bookmarks.json');

const readJsonFile = async (filePath, defaultData) => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(data);
    if (Array.isArray(defaultData) && !Array.isArray(parsed)) {
      console.warn(`Warning: Expected array in ${filePath}, got object. Resetting.`);
      return defaultData;
    }
    if (!Array.isArray(defaultData) && typeof defaultData === 'object' && Array.isArray(parsed)) {
      console.warn(`Warning: Expected object in ${filePath}, got array. Resetting.`);
      return defaultData;
    }
    return parsed;
  } catch (err) {
    if (err.code === 'ENOENT') {
      await writeJsonFile(filePath, defaultData);
      return defaultData;
    }
    console.error(`Error reading ${filePath}`, err);
    return defaultData;
  }
};

async function writeJsonFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export const storageService = {
  getPreferences: async () => readJsonFile(PREFERENCES_FILE, {}),
  savePreferences: async (prefs) => writeJsonFile(PREFERENCES_FILE, prefs),
  
  getHistory: async () => readJsonFile(HISTORY_FILE, []),
  addHistory: async (entry) => {
    let history = await readJsonFile(HISTORY_FILE, []);
    history = history.filter(item => item.query !== entry);
    history.unshift({ query: entry, time: new Date().toISOString() });
    if (history.length > 100) history.pop();
    await writeJsonFile(HISTORY_FILE, history);
  },

  getBookmarks: async () => readJsonFile(BOOKMARKS_FILE, {}),
  toggleBookmark: async ({ query, result }) => {
    const bookmarks = await readJsonFile(BOOKMARKS_FILE, {});
    const queryKey = query ? query.trim() : 'General';
    const list = bookmarks[queryKey] || [];
    
    const existingIndex = list.findIndex(item => item.url === result.url);
    if (existingIndex > -1) {
      list.splice(existingIndex, 1);
      if (list.length === 0) {
        delete bookmarks[queryKey];
      } else {
        bookmarks[queryKey] = list;
      }
    } else {
      const newBookmark = {
        title: result.title,
        url: result.url,
        snippet: result.snippet,
        domain: result.domain
      };
      list.push(newBookmark);
      bookmarks[queryKey] = list;
    }
    await writeJsonFile(BOOKMARKS_FILE, bookmarks);
    return bookmarks;
  },
  removeBookmark: async (url) => {
    const bookmarks = await readJsonFile(BOOKMARKS_FILE, {});
    for (const q of Object.keys(bookmarks)) {
      bookmarks[q] = bookmarks[q].filter(item => item.url !== url);
      if (bookmarks[q].length === 0) {
        delete bookmarks[q];
      }
    }
    await writeJsonFile(BOOKMARKS_FILE, bookmarks);
    return bookmarks;
  }
};

