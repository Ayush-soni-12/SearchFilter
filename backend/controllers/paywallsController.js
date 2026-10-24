import { storageService } from '../services/storageService.js';

export const getPaywalls = async (req, res) => {
  try {
    const paywalls = await storageService.getPaywalls();
    res.json(paywalls);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get paywalls' });
  }
};

export const setPaywall = async (req, res) => {
  try {
    const { url, isPaywalled } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const updated = await storageService.setPaywall({ url, isPaywalled });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update paywall flag' });
  }
};

export const syncPaywalls = async (req, res) => {
  try {
    const { paywalls } = req.body;
    if (!paywalls || typeof paywalls !== 'object') {
      return res.status(400).json({ error: 'Paywalls map is required' });
    }
    const updated = await storageService.syncPaywalls(paywalls);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync paywalls' });
  }
};
