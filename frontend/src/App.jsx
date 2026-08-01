import { useState, useEffect } from 'react';
import { Settings, Search as SearchIcon, Trash2, AlertCircle, Bookmark, Sun, Moon } from 'lucide-react';
import { api } from './api';
import SearchBar from './components/SearchBar';
import ResultCard from './components/ResultCard';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [activePage, setActivePage] = useState('home');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [history, setHistory] = useState([]);
  const [bookmarks, setBookmarks] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [cacheNotification, setCacheNotification] = useState(null);
  const [activeCache, setActiveCache] = useState(null);
  const [isFromBookmarks, setIsFromBookmarks] = useState(false);
  const [activeEngine, setActiveEngine] = useState('google');
  const [lastOptions, setLastOptions] = useState({});
  const [nextContinuationToken, setNextContinuationToken] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [blockedChannels, setBlockedChannels] = useState(() => {
    try { return JSON.parse(localStorage.getItem('blockedChannels') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const blockChannel = (channelName) => {
    if (!channelName || !channelName.trim()) return;
    const name = channelName.trim();
    setBlockedChannels(prev => {
      if (prev.includes(name)) return prev;
      const next = [...prev, name];
      localStorage.setItem('blockedChannels', JSON.stringify(next));
      return next;
    });
  };

  const unblockChannel = (channelName) => {
    setBlockedChannels(prev => {
      const next = prev.filter(c => c !== channelName);
      localStorage.setItem('blockedChannels', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    // Load preferences, history, and bookmarks on mount
    api.getPreferences().then(setPreferences).catch(console.error);
    api.getHistory().then(setHistory).catch(console.error);
    api.getBookmarks().then(setBookmarks).catch(console.error);
  }, []);

  const handleSearch = async (searchQuery, options = {}) => {
    if (!searchQuery.trim()) return;
    
    const engineToUse = options.engine || activeEngine;
    if (options.engine) {
      setActiveEngine(options.engine);
    }

    if (options.isContinuation) {
      setIsLoadingMore(true);
      try {
        const searchOptions = {
          ...lastOptions,
          ...options,
          engine: engineToUse,
          continuationToken: options.continuationToken || nextContinuationToken,
          apiKey: options.apiKey || apiKey
        };
        const data = await api.search(searchQuery, searchOptions);
        if (data.results && data.results.length > 0) {
          setResults(prev => [...prev, ...data.results]);
        }
        setNextContinuationToken(data.nextContinuationToken || null);
        if (data.apiKey) setApiKey(data.apiKey);
      } catch (error) {
        console.error('Continuation search error:', error);
      } finally {
        setIsLoadingMore(false);
      }
      return;
    }
    
    if (!options.forceSearch && !options.useCacheId) {
      setQuery(searchQuery);
      setLastOptions(options);
      setCacheNotification(null);
      setActiveCache(null);
    }
    
    setIsLoading(true);
    setErrorMsg('');
    setActivePage('results');
    setShowHidden(false);
    setIsFromBookmarks(false);
    setNextContinuationToken(null);
    setApiKey(null);
    setIsLoadingMore(false);
    
    try {
      const searchOptions = { ...lastOptions, ...options, engine: engineToUse };
      const data = await api.search(searchQuery, searchOptions);
      
      if (data.cacheAvailable) {
        setCacheNotification(data.cacheInfo);
        setResults([]);
        return;
      }

      setResults(data.results || []);
      setNextContinuationToken(data.nextContinuationToken || null);
      if (data.apiKey) setApiKey(data.apiKey);
      setIsFromBookmarks(!!data.fromBookmarks);
      if (options.useCacheId && cacheNotification) {
        setActiveCache(cacheNotification);
      } else {
        setActiveCache(null);
      }
      
      api.getHistory().then(setHistory).catch(console.error);
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!nextContinuationToken || isLoadingMore || isLoading) return;
    handleSearch(query, {
      ...lastOptions,
      isContinuation: true,
      continuationToken: nextContinuationToken,
      apiKey: apiKey
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (activePage !== 'results' || !nextContinuationToken || isLoadingMore || isLoading) return;
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.offsetHeight - 600;
      if (scrollPosition >= threshold) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage, nextContinuationToken, isLoadingMore, isLoading, query, lastOptions, apiKey]);

  const proceedWithCache = () => {
    handleSearch(query, { ...lastOptions, useCacheId: cacheNotification.id, engine: activeEngine });
    setCacheNotification(null);
  };

  const forceSearchAnyway = () => {
    handleSearch(query, { ...lastOptions, forceSearch: true, engine: activeEngine });
    setCacheNotification(null);
  };

  const handleRenew = async () => {
    try {
      await api.renewCache(activeCache.id);
      setActiveCache(prev => ({ ...prev, isStale: false }));
      alert('Cache renewed successfully!');
    } catch (err) {
      alert('Failed to renew cache.',err);
    }
  };

  const handlePin = async () => {
    try {
      await api.pinCache(activeCache.id);
      setActiveCache(prev => ({ ...prev, permanent: true }));
      alert('Cache pinned permanently!');
    } catch (err) {
      alert('Failed to pin cache.',err);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteCache(activeCache.id);
      setActiveCache(null);
      setResults([]);
      alert('Cache deleted. Search again to fetch new results.');
    } catch (err) {
      alert('Failed to delete cache.',err);
    }
  };

  const handlePreferenceChange = async (domain, newStatus) => {
    try {
      // Optimistic update
      const updatedPrefs = { ...preferences };
      if (newStatus === 'neutral') delete updatedPrefs[domain];
      else updatedPrefs[domain] = newStatus;
      
      setPreferences(updatedPrefs);

      // Re-sort results instantly
      setResults(prev => {
        const newResults = prev.map(r => {
          if (r.domain !== domain) return r;
          let prefScore = 0;
          if (newStatus === 'prefer') prefScore = 20;
          if (newStatus === 'avoid') prefScore = -20;
          return {
            ...r,
            preferenceScore: prefScore,
            finalScore: r.positionScore + prefScore
          };
        });
        return newResults.sort((a, b) => b.finalScore - a.finalScore);
      });

      // API call
      await api.updatePreference(domain, newStatus);
    } catch (error) {
      console.error('Failed to update preference', error);
      // Revert on failure (simplified)
      api.getPreferences().then(setPreferences);
    }
  };

  const isBookmarked = (url) => {
    return Object.values(bookmarks).some(list => Array.isArray(list) && list.some(item => item.url === url));
  };

  const handleBookmarkToggle = async (result) => {
    try {
      const updated = await api.toggleBookmark(query, result);
      setBookmarks(updated);
    } catch (error) {
      console.error('Failed to toggle bookmark', error);
    }
  };

  const handleRemoveBookmark = async (url) => {
    try {
      const updated = await api.removeBookmark(url);
      setBookmarks(updated);
    } catch (error) {
      console.error('Failed to remove bookmark', error);
    }
  };

  const getFlatBookmarks = () => {
    const seen = new Set();
    const list = [];
    for (const q of Object.keys(bookmarks)) {
      if (Array.isArray(bookmarks[q])) {
        for (const item of bookmarks[q]) {
          if (!seen.has(item.url)) {
            seen.add(item.url);
            list.push(item);
          }
        }
      }
    }
    return list;
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand" onClick={() => setActivePage(results.length > 0 ? 'results' : 'home')}>
          SearchFilter
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            className="open-btn" 
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <button 
            className="open-btn" 
            onClick={() => setActivePage(activePage === 'bookmarks' ? (results.length > 0 ? 'results' : 'home') : 'bookmarks')}
            style={{
              background: activePage === 'bookmarks' ? 'rgba(59, 130, 246, 0.25)' : undefined,
              borderColor: activePage === 'bookmarks' ? 'rgba(59, 130, 246, 0.6)' : undefined,
              color: activePage === 'bookmarks' ? '#60a5fa' : undefined
            }}
          >
            <Bookmark size={18} />
            <span>Bookmarks</span>
          </button>
          <button 
            className="open-btn" 
            onClick={() => setActivePage(activePage === 'settings' ? (results.length > 0 ? 'results' : 'home') : 'settings')}
          >
            <Settings size={18} />
            {activePage === 'settings' ? 'Close Settings' : 'Settings'}
          </button>
        </div>
      </nav>

      <main>
        {activePage !== 'settings' && activePage !== 'bookmarks' && (
          <SearchBar
            onSearch={handleSearch}
            initialQuery={query}
            isLoading={isLoading}
            history={history}
            blockedChannels={blockedChannels}
            onBlockChannel={blockChannel}
            onUnblockChannel={unblockChannel}
          />
        )}

        {errorMsg && (
          <div className="error-message animate-slide-up">
            <AlertCircle size={20} />
            {errorMsg}
          </div>
        )}

        {isLoading && (
          <div className="loader animate-slide-up">
            <SearchIcon size={48} className="animate-pulse" />
            <p>Searching and ranking results...</p>
          </div>
        )}

        {!isLoading && activePage === 'results' && cacheNotification && (
          <div className="cache-popup-card animate-slide-up">
            <h3 className="cache-popup-title">
              <span>🔍</span> Cache Found!
            </h3>
            <p className="cache-popup-desc">
              We found a cached result for a similar query: <span className="matched-query-tag">"{cacheNotification.matchedQuery}"</span>
            </p>
            {cacheNotification.isStale && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                padding: '0.4rem 1rem',
                borderRadius: '99px',
                fontSize: '0.85rem',
                marginBottom: '1.25rem'
              }}>
                <AlertCircle size={15} />
                <span>This cache is older than 2 days (stale)</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}>
              <button className="primary-btn" onClick={proceedWithCache}>
                View Cached Results
              </button>
              <button className="secondary-btn" onClick={forceSearchAnyway}>
                Search Anyway
              </button>
            </div>
          </div>
        )}

        {!isLoading && activePage === 'results' && !cacheNotification && (
          <div className="animate-slide-up">
            {isFromBookmarks && (
              <div className="cache-banner" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.5)' }}>
                <Bookmark size={20} style={{ color: '#60a5fa' }} />
                <div>
                  <strong>Searching Bookmarks Only</strong> — Showing results matching your local bookmarks.
                </div>
              </div>
            )}

            {activeCache && (
              <div className="cache-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.5)' }}>
                <div>
                  <strong>Viewing Cached Results</strong>
                  {activeCache.isStale && <span style={{ marginLeft: '10px', color: '#f87171' }}>(Stale)</span>}
                  {activeCache.permanent && <span style={{ marginLeft: '10px', color: '#4ade80' }}>(Pinned)</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {!activeCache.permanent && <button className="secondary-btn" onClick={handlePin} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>📌 Pin</button>}
                  {activeCache.isStale && !activeCache.permanent && <button className="secondary-btn" onClick={handleRenew} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>🔄 Renew</button>}
                  <button className="secondary-btn" onClick={handleDelete} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.5)' }}>🗑 Delete</button>
                </div>
              </div>
            )}

            {results.length === 0 ? (
              <p>No results found.</p>
            ) : (
              (() => {
                const visibleResults = results.filter(r => (preferences[r.domain] || 'neutral') !== 'avoid');
                const hiddenResults = results.filter(r => (preferences[r.domain] || 'neutral') === 'avoid');
                
                return (
                  <>
                    {hiddenResults.length > 0 && (
                      <div className="hidden-results-container" style={{ marginBottom: '1.5rem' }}>
                        <button 
                          className="toggle-hidden-btn"
                          onClick={() => setShowHidden(!showHidden)}
                        >
                          {showHidden ? `Hide ${hiddenResults.length} avoided results` : `👀 Show ${hiddenResults.length} hidden results (avoided domains)`}
                        </button>
                        
                        {showHidden && (
                          <div className="hidden-results-list animate-slide-up" style={{ marginTop: '1rem', opacity: 0.8 }}>
                            {hiddenResults.map((result, i) => (
                              <ResultCard 
                                key={result.url + i} 
                                result={result} 
                                currentPref={preferences[result.domain] || 'neutral'}
                                onPreferenceChange={(status) => handlePreferenceChange(result.domain, status)}
                                isBookmarked={isBookmarked(result.url)}
                                onBookmarkToggle={() => handleBookmarkToggle(result)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {visibleResults.map((result, i) => (
                      <ResultCard
                        key={result.url + i}
                        result={result}
                        currentPref={preferences[result.domain] || 'neutral'}
                        onPreferenceChange={(status) => handlePreferenceChange(result.domain, status)}
                        isBookmarked={isBookmarked(result.url)}
                        onBookmarkToggle={() => handleBookmarkToggle(result)}
                        onBlockChannel={result.isYouTube ? blockChannel : undefined}
                        blockedChannels={blockedChannels}
                      />
                    ))}

                    {/* Pagination & Infinite Scroll Controls */}
                    {isLoadingMore && (
                      <div className="loader animate-slide-up" style={{ padding: '1.5rem 0', margin: '1rem 0' }}>
                        <SearchIcon size={32} className="animate-pulse" style={{ color: '#ef4444' }} />
                        <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>Fetching more filtered YouTube videos...</p>
                      </div>
                    )}

                    {!isLoadingMore && nextContinuationToken && (
                      <div style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
                        <button 
                          className="secondary-btn" 
                          onClick={handleLoadMore}
                          style={{
                            padding: '0.75rem 2rem',
                            borderRadius: '99px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            borderColor: 'rgba(239, 68, 68, 0.4)',
                            color: '#f87171',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          🎬 Load More Filtered Videos
                        </button>
                      </div>
                    )}
                  </>
                );
              })()
            )}
          </div>
        )}

        {activePage === 'bookmarks' && (
          <div className="glass-panel animate-slide-up" style={{ padding: '2rem' }}>
            <div className="settings-header">
              <h2>Bookmarked Results</h2>
              <p>Your saved results stored locally.</p>
            </div>
            
            <div>
              {getFlatBookmarks().length === 0 ? (
                <p>No bookmarks saved yet. Search and bookmark useful results!</p>
              ) : (
                <div>
                  {getFlatBookmarks().map((result, i) => (
                    <ResultCard 
                      key={result.url + i} 
                      result={result} 
                      currentPref={preferences[result.domain] || 'neutral'}
                      onPreferenceChange={(status) => handlePreferenceChange(result.domain, status)}
                      isBookmarked={true}
                      onBookmarkToggle={() => handleRemoveBookmark(result.url)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activePage === 'settings' && (
          <div className="glass-panel animate-slide-up" style={{ padding: '2rem' }}>
            <div className="settings-header">
              <h2>Domain Preferences</h2>
              <p>Manage how specific websites are ranked.</p>
            </div>
            
            <div>
              {Object.keys(preferences).length === 0 ? (
                <p>No preferences set yet. Search and rank some domains!</p>
              ) : (
                <ul className="settings-list">
                  {Object.entries(preferences).map(([domain, status]) => (
                    <li key={domain} className="settings-item">
                      <div className="settings-item-info">
                        <span className="settings-domain">{domain}</span>
                        <span className={`settings-status ${status}`}>
                          {status.toUpperCase()}
                        </span>
                      </div>
                      <button 
                        className="settings-remove-btn" 
                        title="Remove preference"
                        onClick={() => handlePreferenceChange(domain, 'neutral')}
                      >
                        <Trash2 size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

