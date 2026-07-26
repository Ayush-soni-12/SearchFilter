import { searchProviderFactory } from '../services/searchProviderFactory.js';
import { preferenceEngine } from '../services/preferenceEngine.js';
import { storageService } from '../services/storageService.js';
import { cacheService } from '../services/cacheService.js';

export const handleSearch = async (req, res) => {
  const { query, forceSearch, useCacheId, searchInBookmarks, engine, maxViews, hideShorts, blacklistedChannels } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    // Log history
    await storageService.addHistory(query);

    if (searchInBookmarks === 'true') {
      const bookmarkResults = await storageService.searchBookmarks(query);
      const rankedResults = await preferenceEngine.rankResults(bookmarkResults);
      return res.json({
        query,
        results: rankedResults,
        fromBookmarks: true
      });
    }

    if (useCacheId) {
      const cachedResults = await cacheService.getCache(useCacheId);
      if (cachedResults) {
        return res.json({
          query,
          results: cachedResults,
          fromCache: true
        });
      }
    }

    const selectedEngine = engine || 'google';
    const parsedMaxViews = maxViews !== undefined ? parseInt(maxViews, 10) : 50000;
    const parsedHideShorts = hideShorts === 'true';
    const parsedBlacklist = blacklistedChannels ? String(blacklistedChannels).split(',').map(s => s.trim()).filter(Boolean) : [];
    
    const cacheKey = `${selectedEngine}:${query}:${parsedMaxViews}:${parsedHideShorts}:${parsedBlacklist.join('-')}`;

    if (forceSearch !== 'true') {
      const match = await cacheService.findMatch(cacheKey);
      if (match.available) {
        return res.json({
          cacheAvailable: true,
          cacheInfo: match.cacheInfo
        });
      }
    }

    const provider = searchProviderFactory.getProvider(selectedEngine);
    const rawResults = await provider.search(query, {
      maxViews: parsedMaxViews,
      hideShorts: parsedHideShorts,
      blacklistedChannels: parsedBlacklist
    });
    const rankedResults = await preferenceEngine.rankResults(rawResults);
    
    await cacheService.saveCache(cacheKey, rankedResults);

    res.json({
      query,
      engine: selectedEngine,
      results: rankedResults
    });
  } catch (error) {
    console.error('Search error:', error);
    
    if (error.message && error.message.includes('Timeout')) {
      return res.status(504).json({ error: 'Timeout: Search blocked or CAPTCHA unsolved' });
    }
    
    res.status(500).json({ error: 'Failed to perform search' });
  }
};

export const renewCache = async (req, res) => {
  const { id } = req.params;
  const success = await cacheService.renewCache(id);
  res.json({ success });
};

export const pinCache = async (req, res) => {
  const { id } = req.params;
  const success = await cacheService.pinCache(id);
  res.json({ success });
};

export const deleteCache = async (req, res) => {
  const { id } = req.params;
  const success = await cacheService.deleteCache(id);
  res.json({ success });
};
