import { storageService } from '../services/storageService.js';

export const getPreferences = async (req, res) => {
  try {
    const prefs = await storageService.getPreferences();
    res.json(prefs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get preferences' });
  }
};

export const updatePreference = async (req, res) => {
  const { domain, status } = req.body;
  
  if (!domain || !['prefer', 'neutral', 'avoid'].includes(status)) {
    return res.status(400).json({ error: 'Invalid domain or status. Status must be prefer, neutral, or avoid.' });
  }

  try {
    const prefs = await storageService.getPreferences();
    if (status === 'neutral') {
      delete prefs[domain]; // Remove from file to save space and reset to neutral
    } else {
      prefs[domain] = status;
    }
    await storageService.savePreferences(prefs);
    res.json(prefs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update preference' });
  }
};
