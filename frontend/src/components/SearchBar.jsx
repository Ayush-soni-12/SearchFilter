import { useState, useRef, useEffect } from 'react';
import { Clock, Bookmark } from 'lucide-react';

export default function SearchBar({ onSearch, initialQuery = '', isLoading, history = [] }) {
  const [val, setVal] = useState(initialQuery);
  const [showHistory, setShowHistory] = useState(false);
  const [searchInBookmarks, setSearchInBookmarks] = useState(false);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (val.trim()) {
      setShowHistory(false);
      onSearch(val, { searchInBookmarks });
    }
  };

  const handleHistoryClick = (query) => {
    setVal(query);
    setShowHistory(false);
    onSearch(query, { searchInBookmarks });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', marginBottom: '2rem' }}>
      <form className="search-container" style={{ marginBottom: 0 }} onSubmit={handleSubmit}>
        <div className="search-wrapper" ref={wrapperRef}>
          <input
            type="text"
            className="search-input"
            style={{ width: '100%' }}
            placeholder={searchInBookmarks ? "Search your saved bookmarks..." : "What do you want to learn today?"}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onFocus={() => setShowHistory(true)}
            disabled={isLoading}
          />
          
          {showHistory && history.length > 0 && !isLoading && (
            <div className="history-dropdown animate-slide-up">
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

