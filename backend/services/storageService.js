import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PREFERENCES_FILE = path.join(__dirname, '../preferences.json');
const HISTORY_FILE = path.join(__dirname, '../history.json');

const readJsonFile = async (filePath, defaultData) => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await writeJsonFile(filePath, defaultData);
      return defaultData;
    }
    console.error(`Error reading ${filePath}`, err);
    return defaultData;
  }
};

const writeJsonFile = async (filePath, data) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

export const storageService = {
  getPreferences: async () => readJsonFile(PREFERENCES_FILE, {}),
  savePreferences: async (prefs) => writeJsonFile(PREFERENCES_FILE, prefs),
  
  getHistory: async () => readJsonFile(HISTORY_FILE, []),
  addHistory: async (entry) => {
    const history = await readJsonFile(HISTORY_FILE, []);
    history.unshift({ query: entry, time: new Date().toISOString() });
    if (history.length > 100) history.pop();
    await writeJsonFile(HISTORY_FILE, history);
  }
};
