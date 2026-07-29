import { useState, useRef, useEffect } from 'react';
import { Clock, Bookmark } from 'lucide-react';

export default function SearchBar({ onSearch, initialQuery = '', isLoading, history = [] }) {
  const [val, setVal] = useState(initialQuery);
  const [showHistory, setShowHistory] = useState(false);
  const [searchInBookmarks, setSearchInBookmarks] = useState(false);
  const [engine, setEngine] = useState('google');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [maxViews, setMaxViews] = useState(50000);
  const [hideShorts, setHideShorts] = useState(true);
  const [blacklistedChannels, setBlacklistedChannels] = useState('');
  const [uploadTime, setUploadTime] = useState('all');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (val.trim()) {
      setShowHistory(false);
      onSearch(val, { searchInBookmarks, engine, maxViews, hideShorts, blacklistedChannels, uploadTime });
    }
  };

  const handleHistoryClick = (query) => {
    setVal(query);
    setShowHistory(false);
    onSearch(query, { searchInBookmarks, engine, maxViews, hideShorts, blacklistedChannels, uploadTime });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowHistory(false);
    } else if (e.ctrlKey && (e.key === ' ' || e.code === 'Space')) {
      e.preventDefault();
      setShowHistory(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', marginBottom: '2rem' }}>
      {!searchInBookmarks && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '0.25rem' }}>Engine:</span>
          <button
            type="button"
            className="open-btn"
            onClick={() => setEngine('google')}
            style={{
              fontSize: '0.85rem',
              padding: '0.35rem 0.75rem',
              background: engine === 'google' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.05)',
              borderColor: engine === 'google' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(255,255,255,0.1)',
              color: engine === 'google' ? '#60a5fa' : 'var(--text-secondary)'
            }}
          >
            🌐 Google
          </button>
          <button
            type="button"
            className="open-btn"
            onClick={() => setEngine('duckduckgo')}
            style={{
              fontSize: '0.85rem',
              padding: '0.35rem 0.75rem',
              background: engine === 'duckduckgo' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.05)',
              borderColor: engine === 'duckduckgo' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(255,255,255,0.1)',
              color: engine === 'duckduckgo' ? '#60a5fa' : 'var(--text-secondary)'
            }}
          >
            🦆 DuckDuckGo (Fast)
          </button>
          <button
            type="button"
            className="open-btn"
            onClick={() => setEngine('bing')}
            style={{
              fontSize: '0.85rem',
              padding: '0.35rem 0.75rem',
              background: engine === 'bing' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.05)',
              borderColor: engine === 'bing' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(255,255,255,0.1)',
              color: engine === 'bing' ? '#60a5fa' : 'var(--text-secondary)'
            }}
          >
            🔍 Bing (Fast)
          </button>
          <button
            type="button"
            className="open-btn"
            onClick={() => setEngine('youtube')}
            style={{
              fontSize: '0.85rem',
              padding: '0.35rem 0.75rem',
              background: engine === 'youtube' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255,255,255,0.05)',
              borderColor: engine === 'youtube' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255,255,255,0.1)',
              color: engine === 'youtube' ? '#f87171' : 'var(--text-secondary)'
            }}
          >
            ▶️ YouTube (Hidden Gems)
          </button>
        </div>
      )}

      {/* YouTube Specific Filter Bar */}
      {!searchInBookmarks && engine === 'youtube' && (
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          padding: '0.75rem 1rem',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '12px',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#f87171', fontWeight: 600 }}>Max Views:</span>
            <select
              value={maxViews}
              onChange={(e) => setMaxViews(Number(e.target.value))}
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}
            >
              <option value={10000}>Under 10,000 views (Ultra Small)</option>
              <option value={50000}>Under 50,000 views (Hidden Gems)</option>
              <option value={100000}>Under 100,000 views (Under-the-radar)</option>
              <option value={500000}>Under 500,000 views</option>
              <option value={0}>No view limit (All videos)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#f87171', fontWeight: 600 }}>Upload Date:</span>
            <select
              value={uploadTime}
              onChange={(e) => setUploadTime(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}
            >
              <option value="all">Anytime</option>
              <option value="hour">Past Hour</option>
              <option value="today">Past 24 Hours</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="year">Past Year</option>
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={hideShorts}
              onChange={(e) => setHideShorts(e.target.checked)}
              style={{ accentColor: '#ef4444' }}
            />
            <span>Hide Shorts</span>
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
            <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Blacklist Channels:</span>
            <input
              type="text"
              placeholder="e.g. 5-Minute Crafts, T-Series"
              value={blacklistedChannels}
              onChange={(e) => setBlacklistedChannels(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                width: '100%'
              }}
            />
          </div>
        </div>
      )}

      <form className="search-container" style={{ marginBottom: 0 }} onSubmit={handleSubmit}>
        <div className="search-wrapper" ref={wrapperRef}>
          <input
            type="text"
            className="search-input"
            style={{ width: '100%' }}
            placeholder={searchInBookmarks ? "Search your saved bookmarks..." : `Search ${engine === 'google' ? 'Google' : engine === 'duckduckgo' ? 'DuckDuckGo' : engine === 'bing' ? 'Bing' : 'YouTube (Hidden Gems)'}...`}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onFocus={() => setShowHistory(true)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          
          {showHistory && history.length > 0 && !isLoading && (
            <div className="history-dropdown animate-slide-up">
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.4rem 1rem',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(0,0,0,0.2)'
              }}>
                <span>Search History</span>
                <span>
                  <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)' }}>Esc</kbd> hide • <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)' }}>Ctrl+Space</kbd> show
                </span>
              </div>
              {history.map((item, idx) => (
                <button 
                  key={idx} 
                  type="button"
                  className="history-item"
                  onClick={() => handleHistoryClick(item.query)}
                >
                  <Clock size={16} />
                  <span className="history-text">{item.query}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="search-button"
          disabled={isLoading || !val.trim()}
          style={engine === 'youtube' ? { background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)' } : {}}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: '0.5rem' }}>
        <button
          type="button"
          className="open-btn"
          onClick={() => setSearchInBookmarks(!searchInBookmarks)}
          style={{
            fontSize: '0.85rem',
            padding: '0.4rem 0.8rem',
            background: searchInBookmarks ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.05)',
            borderColor: searchInBookmarks ? 'rgba(59, 130, 246, 0.6)' : 'rgba(255,255,255,0.1)',
            color: searchInBookmarks ? '#60a5fa' : 'var(--text-secondary)'
          }}
        >
          <Bookmark size={14} />
          <span>{searchInBookmarks ? 'Searching Bookmarks Only (ON)' : 'Search in Bookmarks Only'}</span>
        </button>
      </div>
    </div>
  );
}

