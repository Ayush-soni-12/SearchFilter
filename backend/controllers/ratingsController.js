import { storageService } from '../services/storageService.js';

export const getRatings = async (req, res) => {
  try {
    const ratings = await storageService.getRatings();
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get ratings' });
  }
};

export const setRating = async (req, res) => {
  try {
    const { url, rating } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const updated = await storageService.setRating({ url, rating });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update rating' });
  }
};

export const syncRatings = async (req, res) => {
  try {
    const { ratings } = req.body;
    if (!ratings || typeof ratings !== 'object') {
      return res.status(400).json({ error: 'Ratings map is required' });
    }
    const updated = await storageService.syncRatings(ratings);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync ratings' });
  }
};
