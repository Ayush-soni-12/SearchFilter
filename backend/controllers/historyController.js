import { storageService } from '../services/storageService.js';

export const getHistory = async (req, res) => {
  try {
    const history = await storageService.getHistory();
    // Return top 10 recent searches for the UI
    res.json(history.slice(0, 10));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get history' });
  }
};
