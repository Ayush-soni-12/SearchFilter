import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PREFERENCES_FILE = path.join(__dirname, '../preferences.json');
const HISTORY_FILE = path.join(__dirname, '../history.json');

const readJsonFile = async (filePath, defaultData) => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(data);
    if (Array.isArray(defaultData) && !Array.isArray(parsed)) {
      console.warn(`Warning: Expected array in ${filePath}, got object. Resetting.`);
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
  }
};
