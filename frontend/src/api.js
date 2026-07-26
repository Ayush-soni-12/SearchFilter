const API_BASE = `http://${window.location.hostname}:4000/api`;

export const api = {
  search: async (query, options = {}) => {
    let url = `${API_BASE}/search?query=${encodeURIComponent(query)}`;
    if (options.forceSearch) url += '&forceSearch=true';
    if (options.useCacheId) url += `&useCacheId=${options.useCacheId}`;
    if (options.searchInBookmarks) url += '&searchInBookmarks=true';
    if (options.engine) url += `&engine=${encodeURIComponent(options.engine)}`;
    if (options.maxViews !== undefined) url += `&maxViews=${encodeURIComponent(options.maxViews)}`;
    if (options.hideShorts !== undefined) url += `&hideShorts=${encodeURIComponent(options.hideShorts)}`;
    if (options.blacklistedChannels) url += `&blacklistedChannels=${encodeURIComponent(options.blacklistedChannels)}`;
    
    const res = await fetch(url);
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
  },
  renewCache: async (id) => {
    const res = await fetch(`${API_BASE}/search/cache/${id}/renew`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to renew cache');
    return res.json();
  },
  pinCache: async (id) => {
    const res = await fetch(`${API_BASE}/search/cache/${id}/pin`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to pin cache');
    return res.json();
  },
  deleteCache: async (id) => {
    const res = await fetch(`${API_BASE}/search/cache/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete cache');
    return res.json();
  },
  getBookmarks: async () => {
    const res = await fetch(`${API_BASE}/bookmarks`);
    if (!res.ok) throw new Error('Failed to get bookmarks');
    return res.json();
  },
  toggleBookmark: async (query, result) => {
    const res = await fetch(`${API_BASE}/bookmarks/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, result })
    });
    if (!res.ok) throw new Error('Failed to toggle bookmark');
    return res.json();
  },
  removeBookmark: async (url) => {
    const res = await fetch(`${API_BASE}/bookmarks/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    if (!res.ok) throw new Error('Failed to remove bookmark');
    return res.json();
  }
};
