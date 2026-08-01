import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, '../searchCache');
const INDEX_FILE = path.join(CACHE_DIR, 'index.json');

const STALE_MS = 2 * 24 * 60 * 60 * 1000; // 2 days

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'for', 'of', 'to', 'with', 'and', 'or',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'by', 'about', 'how',
  'what', 'where', 'when', 'who', 'which', 'why', 'detail', 'details', 'more',
  'explain', 'show', 'list', 'please', 'get', 'give', 'me', 'i', 'my', 'it',
  'its', 'this', 'that', 'these', 'those', 'from', 'as'
]);

const tokenize = (q) => {
  if (!q || typeof q !== 'string') return [];
  const words = q.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
  const filtered = words.filter(w => !STOP_WORDS.has(w));
  return filtered.length > 0 ? filtered : words;
};

const calculateSimilarity = (query1, query2) => {
  const words1 = tokenize(query1);
  const words2 = tokenize(query2);

  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  if (set1.size === 0 && set2.size === 0) return 1;
  if (set1.size === 0 || set2.size === 0) return 0;

  let intersection = 0;
  for (const word of set1) {
    if (set2.has(word)) intersection++;
  }
  
  const union = set1.size + set2.size - intersection;
  const jaccard = intersection / union;

  const coverage1 = intersection / set1.size;
  const coverage2 = intersection / set2.size;
  const maxCoverage = Math.max(coverage1, coverage2);
  const minCoverage = Math.min(coverage1, coverage2);

  // If key tokens of one query are completely covered by the other query
  if (maxCoverage === 1.0 && intersection >= 1) {
    return Math.max(jaccard, 0.8 + (0.2 * jaccard));
  }

  // Hybrid score weighting Jaccard and Token Coverage
  return (0.6 * jaccard) + (0.4 * minCoverage);
};

const formatReadableDate = (val) => {
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

const parseToTimestamp = (val) => {
  if (typeof val === 'number') return val;
  const parsed = new Date(val).getTime();
  return isNaN(parsed) ? 0 : parsed;
};

const ensureCacheDir = async () => {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (err) {
    console.error('Error ensuring cache directory:', err);
  }
};

const readIndex = async () => {
  try {
    await ensureCacheDir();
    const data = await fs.readFile(INDEX_FILE, 'utf-8');
    const index = JSON.parse(data);
    
    // Auto-migrate any numeric/ISO timestamps and old prefixed originalQuery strings
    let hasChanges = false;
    for (const id of Object.keys(index)) {
      const item = index[id];

      // Auto-parse legacy "engine:query:maxViews:hideShorts:blacklist" strings
      if (typeof item.originalQuery === 'string' && item.originalQuery.includes(':')) {
        const parts = item.originalQuery.split(':');
        const first = parts[0].toLowerCase();
        if (['youtube', 'yt', 'google', 'duckduckgo', 'ddg'].includes(first)) {
          item.engine = first;
          item.originalQuery = parts[1] || item.originalQuery;
          if (parts.length >= 4) {
            item.filters = {
              maxViews: parseInt(parts[2], 10) || 50000,
              hideShorts: parts[3] === 'true',
              blacklistedChannels: parts[4] ? parts[4].split('-') : [],
              uploadTime: parts[5] || 'all'
            };
          }
          hasChanges = true;
        }
      }

      if (typeof item.createdAt === 'number' || (typeof item.createdAt === 'string' && item.createdAt.includes('T'))) {
        item.createdAt = formatReadableDate(item.createdAt);
        hasChanges = true;
      }
      if (typeof item.staleAt === 'number' || (typeof item.staleAt === 'string' && item.staleAt.includes('T'))) {
        item.staleAt = formatReadableDate(item.staleAt);
        hasChanges = true;
      }
    }
    if (hasChanges) {
      await writeIndex(index);
    }
    return index;
  } catch (err) {
    if (err.code === 'ENOENT') {
      try {
        await writeIndex({});
      } catch {
        // ignore
      }
    }
    return {};
  }
};

const writeIndex = async (index) => {
  await ensureCacheDir();
  await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
};

export const cacheService = {
  initCache: async () => {
    try {
      await ensureCacheDir();
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

  findMatch: async (query, options = {}) => {
    const index = await readIndex();
    const now = Date.now();
    let bestMatch = null;
    let highestScore = 0;

    const targetEngine = (options.engine || 'google').toLowerCase();

    for (const [id, meta] of Object.entries(index)) {
      // 1. Engine must match exactly
      const metaEngine = (meta.engine || 'google').toLowerCase();
      if (metaEngine !== targetEngine) continue;

      // 2. If engine is YouTube or GitHub, filter options must match exactly
      if (targetEngine === 'youtube') {
        const targetMaxViews = options.maxViews !== undefined ? Number(options.maxViews) : 50000;
        const targetHideShorts = Boolean(options.hideShorts);
        const targetBlacklist = (options.blacklistedChannels || []).join(',');
        const targetUploadTime = options.uploadTime || 'all';

        const metaMaxViews = meta.filters?.maxViews !== undefined ? Number(meta.filters.maxViews) : 50000;
        const metaHideShorts = Boolean(meta.filters?.hideShorts);
        const metaBlacklist = (meta.filters?.blacklistedChannels || []).join(',');
        const metaUploadTime = meta.filters?.uploadTime || 'all';

        if (
          targetMaxViews !== metaMaxViews ||
          targetHideShorts !== metaHideShorts ||
          targetBlacklist !== metaBlacklist ||
          targetUploadTime !== metaUploadTime
        ) {
          continue;
        }
      } else if (targetEngine === 'github' || targetEngine === 'gh') {
        const targetMaxStars = options.maxStars !== undefined ? Number(options.maxStars) : 500;
        const targetMinStars = options.minStars !== undefined ? Number(options.minStars) : 5;
        const targetLanguage = options.githubLanguage || 'all';
        const targetBlacklist = (options.blacklistedOrgs || []).join(',');
        const targetExcludeNotes = Boolean(options.excludeStudyNotes);
        const targetUploadTime = options.uploadTime || 'all';

        const metaMaxStars = meta.filters?.maxStars !== undefined ? Number(meta.filters.maxStars) : 500;
        const metaMinStars = meta.filters?.minStars !== undefined ? Number(meta.filters.minStars) : 5;
        const metaLanguage = meta.filters?.githubLanguage || 'all';
        const metaBlacklist = (meta.filters?.blacklistedOrgs || []).join(',');
        const metaExcludeNotes = Boolean(meta.filters?.excludeStudyNotes);
        const metaUploadTime = meta.filters?.uploadTime || 'all';

        if (
          targetMaxStars !== metaMaxStars ||
          targetMinStars !== metaMinStars ||
          targetLanguage !== metaLanguage ||
          targetBlacklist !== metaBlacklist ||
          targetExcludeNotes !== metaExcludeNotes ||
          targetUploadTime !== metaUploadTime
        ) {
          continue;
        }
      } else if (targetEngine === 'hackernews' || targetEngine === 'hn') {
        const targetHnType = options.hnType || 'story';
        const targetHnSort = options.hnSort || 'relevance';
        const targetMinPoints = options.minPoints !== undefined ? Number(options.minPoints) : 0;
        const targetMinComments = options.minComments !== undefined ? Number(options.minComments) : 0;
        const targetHnDateRange = options.hnDateRange || 'all';

        const metaHnType = meta.filters?.hnType || 'story';
        const metaHnSort = meta.filters?.hnSort || 'relevance';
        const metaMinPoints = meta.filters?.minPoints !== undefined ? Number(meta.filters.minPoints) : 0;
        const metaMinComments = meta.filters?.minComments !== undefined ? Number(meta.filters.minComments) : 0;
        const metaHnDateRange = meta.filters?.hnDateRange || 'all';

        if (
          targetHnType !== metaHnType ||
          targetHnSort !== metaHnSort ||
          targetMinPoints !== metaMinPoints ||
          targetMinComments !== metaMinComments ||
          targetHnDateRange !== metaHnDateRange
        ) {
          continue;
        }
      }

      // 3. Textual query similarity match on clean query string
      const score = calculateSimilarity(query, meta.originalQuery);
      if (score >= 0.6 && score > highestScore) {
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
      await ensureCacheDir();
      const cachePath = path.join(CACHE_DIR, `${id}.json`);
      const data = await fs.readFile(cachePath, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error(`Failed to read cache file for ID ${id}`, err);
      return null;
    }
  },

  saveCache: async (query, results, options = {}) => {
    try {
      await ensureCacheDir();
      const id = crypto.randomUUID();
      const now = Date.now();
      const cachePath = path.join(CACHE_DIR, `${id}.json`);
      
      await fs.writeFile(cachePath, JSON.stringify(results, null, 2), 'utf-8');
      
      const index = await readIndex();
      index[id] = {
        originalQuery: query,
        engine: (options.engine || 'google').toLowerCase(),
        filters: options.filters || {},
        createdAt: formatReadableDate(now),
        staleAt: formatReadableDate(now + STALE_MS),
        permanent: false
      };
      await writeIndex(index);
      
      return id;
    } catch (err) {
      console.warn('Cache save warning (continuing search without throwing):', err.message);
      return null;
    }
  },

  renewCache: async (id) => {
    const index = await readIndex();
    if (index[id]) {
      index[id].staleAt = formatReadableDate(Date.now() + STALE_MS);
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
