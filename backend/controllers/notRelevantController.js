import { storageService } from '../services/storageService.js';

export const getNotRelevant = async (req, res) => {
  try {
    const notRelevant = await storageService.getNotRelevant();
    res.json(notRelevant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get not relevant results' });
  }
};

export const setNotRelevant = async (req, res) => {
  try {
    const { url, isNotRelevant } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const updated = await storageService.setNotRelevant({ url, isNotRelevant });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update not relevant status' });
  }
};

export const syncNotRelevant = async (req, res) => {
  try {
    const { notRelevant } = req.body;
    if (!notRelevant || typeof notRelevant !== 'object') {
      return res.status(400).json({ error: 'Not relevant map is required' });
    }
    const updated = await storageService.syncNotRelevant(notRelevant);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync not relevant status' });
  }
};
