import { storageService } from '../services/storageService.js';

export const getHistory = async (req, res) => {
  try {
    const { engine } = req.query;
    let history = await storageService.getHistory();

    if (engine) {
      // Return entries matching this engine; old entries with no engine field are excluded
      history = history.filter(item => item.engine === engine);
    }

    // Return top 20 recent searches for the UI (more room now that it's per-engine)
    res.json(history.slice(0, 20));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get history' });
  }
};
