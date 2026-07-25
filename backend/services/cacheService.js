import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, '../searchCache');
const INDEX_FILE = path.join(CACHE_DIR, 'index.json');

const STALE_MS = 2 * 24 * 60 * 60 * 1000; // 2 days

const calculateSimilarity = (query1, query2) => {
  const getWords = q => new Set(q.toLowerCase().split(/\s+/).filter(w => w.length > 0));
  const set1 = getWords(query1);
  const set2 = getWords(query2);
  
  if (set1.size === 0 && set2.size === 0) return 1;
  if (set1.size === 0 || set2.size === 0) return 0;

  let intersection = 0;
  for (let word of set1) {
    if (set2.has(word)) intersection++;
  }
  
  const union = set1.size + set2.size - intersection;
  return intersection / union;
};

const formatToISO = (val) => {
  if (typeof val === 'number') {
    return new Date(val).toISOString();
  }
  return val;
};

const parseToTimestamp = (val) => {
  if (typeof val === 'number') return val;
  const parsed = new Date(val).getTime();
  return isNaN(parsed) ? 0 : parsed;
};

const readIndex = async () => {
  try {
    const data = await fs.readFile(INDEX_FILE, 'utf-8');
    const index = JSON.parse(data);
    
    // Auto-migrate any numeric timestamps to human-readable ISO date strings
    let hasChanges = false;
    for (const id of Object.keys(index)) {
      if (typeof index[id].createdAt === 'number') {
        index[id].createdAt = formatToISO(index[id].createdAt);
        hasChanges = true;
      }
      if (typeof index[id].staleAt === 'number') {
        index[id].staleAt = formatToISO(index[id].staleAt);
        hasChanges = true;
      }
    }
    if (hasChanges) {
      await writeIndex(index);
    }
    return index;
  } catch (err) {
    return {};
  }
};

const writeIndex = async (index) => {
  await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
};

export const cacheService = {
  initCache: async () => {
    try {
      await fs.mkdir(CACHE_DIR, { recursive: true });
      try {
        await fs.access(INDEX_FILE);
      } catch {
        await writeIndex({});
      }
      await readIndex(); // Trigger auto-migration if index exists
    } catch (err) {
      console.error('Error initializing cache:', err);
    }
  },

  findMatch: async (query) => {
    const index = await readIndex();
    const now = Date.now();
    let bestMatch = null;
    let highestScore = 0;

    for (const [id, meta] of Object.entries(index)) {
      const score = calculateSimilarity(query, meta.originalQuery);
      if (score >= 0.6 && score > highestScore) { // 60% similarity threshold
        highestScore = score;
        bestMatch = { id, meta };
      }
    }

    if (!bestMatch) return { available: false };

    const { id, meta } = bestMatch;
    const staleTime = parseToTimestamp(meta.staleAt);
    const isStale = now > staleTime && !meta.permanent;

    return {
      available: true,
      cacheInfo: {
        id,
        matchedQuery: meta.originalQuery,
        createdAt: meta.createdAt,
        staleAt: meta.staleAt,
        isStale,
        permanent: meta.permanent || false
      }
    };
  },

  getCache: async (id) => {
    try {
      const cachePath = path.join(CACHE_DIR, `${id}.json`);
      const data = await fs.readFile(cachePath, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error(`Failed to read cache file for ID ${id}`, err);
      return null;
    }
  },

  saveCache: async (query, results) => {
    const id = crypto.randomUUID();
    const now = Date.now();
    const cachePath = path.join(CACHE_DIR, `${id}.json`);
    
    await fs.writeFile(cachePath, JSON.stringify(results, null, 2), 'utf-8');
    
    const index = await readIndex();
    index[id] = {
      originalQuery: query,
      createdAt: new Date(now).toISOString(),
      staleAt: new Date(now + STALE_MS).toISOString(),
      permanent: false
    };
    await writeIndex(index);
    
    return id;
  },

  renewCache: async (id) => {
    const index = await readIndex();
    if (index[id]) {
      index[id].staleAt = new Date(Date.now() + STALE_MS).toISOString();
      await writeIndex(index);
      return true;
    }
    return false;
  },

  pinCache: async (id) => {
    const index = await readIndex();
    if (index[id]) {
      index[id].permanent = true;
      await writeIndex(index);
      return true;
    }
    return false;
  },

  deleteCache: async (id) => {
    const index = await readIndex();
    if (index[id]) {
      delete index[id];
      await writeIndex(index);
      try {
        await fs.unlink(path.join(CACHE_DIR, `${id}.json`));
      } catch (err) {
        console.warn(`Could not delete cache file ${id}.json`, err);
      }
      return true;
    }
    return false;
  }
};

cacheService.initCache();
