import { storageService } from '../services/storageService.js';

export const getVisited = async (req, res) => {
  try {
    const visited = await storageService.getVisited();
    res.json(visited);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get visited results' });
  }
};

export const setVisited = async (req, res) => {
  try {
    const { url, isVisited } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const updated = await storageService.setVisited({ url, isVisited });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update visited status' });
  }
};

export const syncVisited = async (req, res) => {
  try {
    const { visited } = req.body;
    if (!visited || typeof visited !== 'object') {
      return res.status(400).json({ error: 'Visited map is required' });
    }
    const updated = await storageService.syncVisited(visited);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync visited status' });
  }
};
