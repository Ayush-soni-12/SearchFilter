import { storageService } from '../services/storageService.js';

export const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await storageService.getBookmarks();
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get bookmarks' });
  }
};

export const toggleBookmark = async (req, res) => {
  try {
    const { query, result } = req.body;
    if (!result || !result.url) {
      return res.status(400).json({ error: 'Result with a URL is required' });
    }
    const updated = await storageService.toggleBookmark({ query, result });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
};

export const removeBookmark = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const updated = await storageService.removeBookmark(url);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
};
