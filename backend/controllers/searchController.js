import { searchProviderFactory } from '../services/searchProviderFactory.js';
import { preferenceEngine } from '../services/preferenceEngine.js';
import { storageService } from '../services/storageService.js';
import { cacheService } from '../services/cacheService.js';

export const handleSearch = async (req, res) => {
  const {
    query,
    forceSearch,
    useCacheId,
    searchInBookmarks,
    engine,
    maxViews,
    hideShorts,
    blacklistedChannels,
    uploadTime,
    maxStars,
    minStars,
    githubLanguage,
    blacklistedOrgs,
    excludeStudyNotes,
    hnType,
    hnSort,
    minPoints,
    minComments,
    hnDateRange,
    continuationToken,
    apiKey,
    cleanWeb,
    antiSeo,
    blacklistedDomains
  } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    // Log history with engine context
    await storageService.addHistory({ query, engine: engine || 'google' });

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
    const parsedCleanWeb = cleanWeb === 'true';
    const parsedAntiSeo = antiSeo === 'true';
    const parsedBlacklistedDomains = blacklistedDomains ? String(blacklistedDomains).split(',').map(s => s.trim()).filter(Boolean) : [];

    const parsedMaxViews = maxViews !== undefined ? parseInt(maxViews, 10) : 50000;
    const parsedHideShorts = hideShorts === 'true';
    const parsedBlacklist = blacklistedChannels ? String(blacklistedChannels).split(',').map(s => s.trim()).filter(Boolean) : [];
    const parsedUploadTime = uploadTime || 'all';

    const parsedMaxStars = maxStars !== undefined ? parseInt(maxStars, 10) : 500;
    const parsedMinStars = minStars !== undefined ? parseInt(minStars, 10) : 5;
    const parsedGithubLanguage = githubLanguage || 'all';
    const parsedBlacklistedOrgs = blacklistedOrgs ? String(blacklistedOrgs).split(',').map(s => s.trim()).filter(Boolean) : [];
    const parsedExcludeStudyNotes = excludeStudyNotes === 'true';

    const parsedHnType = hnType || 'story';
    const parsedHnSort = hnSort || 'relevance';
    const parsedMinPoints = minPoints !== undefined ? parseInt(minPoints, 10) : 0;
    const parsedMinComments = minComments !== undefined ? parseInt(minComments, 10) : 0;
    const parsedHnDateRange = hnDateRange || 'all';

    const cacheOptions = {
      engine: selectedEngine,
      cleanWeb: parsedCleanWeb,
      antiSeo: parsedAntiSeo,
      blacklistedDomains: parsedBlacklistedDomains,
      maxViews: parsedMaxViews,
      hideShorts: parsedHideShorts,
      blacklistedChannels: parsedBlacklist,
      uploadTime: parsedUploadTime,
      maxStars: parsedMaxStars,
      minStars: parsedMinStars,
      githubLanguage: parsedGithubLanguage,
      blacklistedOrgs: parsedBlacklistedOrgs,
      excludeStudyNotes: parsedExcludeStudyNotes,
      hnType: parsedHnType,
      hnSort: parsedHnSort,
      minPoints: parsedMinPoints,
      minComments: parsedMinComments,
      hnDateRange: parsedHnDateRange
    };

    // If fetching next page via continuationToken, skip cache match check
    if (!continuationToken && forceSearch !== 'true') {
      const match = await cacheService.findMatch(query, cacheOptions);
      if (match.available) {
        return res.json({
          cacheAvailable: true,
          cacheInfo: match.cacheInfo
        });
      }
    }

    const provider = searchProviderFactory.getProvider(selectedEngine);
    const searchResponse = await provider.search(query, {
      cleanWeb: parsedCleanWeb,
      antiSeo: parsedAntiSeo,
      excludeDomains: parsedBlacklistedDomains,
      maxViews: parsedMaxViews,
      hideShorts: parsedHideShorts,
      blacklistedChannels: parsedBlacklist,
      uploadTime: parsedUploadTime,
      maxStars: parsedMaxStars,
      minStars: parsedMinStars,
      githubLanguage: parsedGithubLanguage,
      blacklistedOrgs: parsedBlacklistedOrgs,
      excludeStudyNotes: parsedExcludeStudyNotes,
      hnType: parsedHnType,
      hnSort: parsedHnSort,
      minPoints: parsedMinPoints,
      minComments: parsedMinComments,
      hnDateRange: parsedHnDateRange,
      continuationToken,
      apiKey
    });

    let rawResults = [];
    let nextContinuationToken = null;
    let returnedApiKey = null;

    if (Array.isArray(searchResponse)) {
      rawResults = searchResponse;
    } else if (searchResponse && typeof searchResponse === 'object') {
      rawResults = searchResponse.results || [];
      nextContinuationToken = searchResponse.nextContinuationToken || null;
      returnedApiKey = searchResponse.apiKey || null;
    }

    const rankedResults = await preferenceEngine.rankResults(rawResults, {
      antiSeo: parsedAntiSeo,
      blacklistedDomains: parsedBlacklistedDomains
    });
    
    // Only save initial search results to cache, not sub-continuation pages
    if (!continuationToken) {
      await cacheService.saveCache(query, rankedResults, {
        engine: selectedEngine,
        filters: {
          maxViews: parsedMaxViews,
          hideShorts: parsedHideShorts,
          blacklistedChannels: parsedBlacklist,
          uploadTime: parsedUploadTime,
          maxStars: parsedMaxStars,
          minStars: parsedMinStars,
          githubLanguage: parsedGithubLanguage,
          blacklistedOrgs: parsedBlacklistedOrgs,
          excludeStudyNotes: parsedExcludeStudyNotes,
          hnType: parsedHnType,
          hnSort: parsedHnSort,
          minPoints: parsedMinPoints,
          minComments: parsedMinComments,
          hnDateRange: parsedHnDateRange
        }
      });
    }

    res.json({
      query,
      engine: selectedEngine,
      results: rankedResults,
      nextContinuationToken,
      apiKey: returnedApiKey
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
