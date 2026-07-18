import { GoogleSearchService } from '../services/googleSearchService.js';
import { preferenceEngine } from '../services/preferenceEngine.js';
import { storageService } from '../services/storageService.js';

const googleService = new GoogleSearchService();

export const handleSearch = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    // Log history
    await storageService.addHistory(query);

    const rawResults = await googleService.search(query);
    const rankedResults = await preferenceEngine.rankResults(rawResults);
    
    res.json({
      query,
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
