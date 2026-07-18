import { GoogleSearchService } from '../services/googleSearchService.js';

const googleService = new GoogleSearchService();

export const handleSearch = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const rawResults = await googleService.search(query);
    
    // TODO: Add Preference Engine ranking here later
    // For now, we just assign the raw position score based on the Google ranking
    const totalResults = rawResults.length;
    const rankedResults = rawResults.map((result, index) => {
      return {
        ...result,
        positionScore: totalResults - index,
        preferenceScore: 0, // Default for now
        finalScore: totalResults - index
      };
    });
    
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
