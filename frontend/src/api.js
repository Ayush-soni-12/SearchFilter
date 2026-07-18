const API_BASE = `http://${window.location.hostname}:4000/api`;

export const api = {
  search: async (query) => {
    const res = await fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },
  getPreferences: async () => {
    const res = await fetch(`${API_BASE}/preferences`);
    if (!res.ok) throw new Error('Failed to get preferences');
    return res.json();
  },
  getHistory: async () => {
    const res = await fetch(`${API_BASE}/history`);
    if (!res.ok) throw new Error('Failed to get history');
    return res.json();
  },
  updatePreference: async (domain, status) => {
    const res = await fetch(`${API_BASE}/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, status })
    });
    if (!res.ok) throw new Error('Failed to update preference');
    return res.json();
  }
};
