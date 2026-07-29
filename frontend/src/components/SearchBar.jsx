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

  const [maxStars, setMaxStars] = useState(0);
  const [githubLanguage, setGithubLanguage] = useState('all');
  const [blacklistedOrgs, setBlacklistedOrgs] = useState('');
  const [excludeStudyNotes, setExcludeStudyNotes] = useState(true);

  const getSearchPayload = () => ({
    searchInBookmarks,
    engine,
    maxViews,
    hideShorts,
    blacklistedChannels,
    uploadTime,
    maxStars,
    githubLanguage,
    blacklistedOrgs,
    excludeStudyNotes
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (val.trim()) {
      setShowHistory(false);
      onSearch(val, getSearchPayload());
    }
  };

  const handleHistoryClick = (query) => {
    setVal(query);
    setShowHistory(false);
    onSearch(query, getSearchPayload());
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
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: '#666666', marginRight: '0.35rem', fontWeight: 500 }}>Engine:</span>
          <button
            type="button"
            className="open-btn"
            onClick={() => setEngine('google')}
            style={{
              fontSize: '0.82rem',
              padding: '0.35rem 0.85rem',
              background: engine === 'google' ? '#111111' : '#ffffff',
              borderColor: engine === 'google' ? '#111111' : '#eaeaea',
              color: engine === 'google' ? '#ffffff' : '#666666'
            }}
          >
            🌐 Google
          </button>
          <button
            type="button"
            className="open-btn"
            onClick={() => setEngine('duckduckgo')}
            style={{
              fontSize: '0.82rem',
              padding: '0.35rem 0.85rem',
              background: engine === 'duckduckgo' ? '#111111' : '#ffffff',
              borderColor: engine === 'duckduckgo' ? '#111111' : '#eaeaea',
              color: engine === 'duckduckgo' ? '#ffffff' : '#666666'
            }}
          >
            🦆 DuckDuckGo
          </button>
          <button
            type="button"
            className="open-btn"
            onClick={() => setEngine('bing')}
            style={{
              fontSize: '0.82rem',
              padding: '0.35rem 0.85rem',
              background: engine === 'bing' ? '#111111' : '#ffffff',
              borderColor: engine === 'bing' ? '#111111' : '#eaeaea',
              color: engine === 'bing' ? '#ffffff' : '#666666'
            }}
          >
            🔍 Bing
          </button>
          <button
            type="button"
            className="open-btn"
            onClick={() => setEngine('youtube')}
            style={{
              fontSize: '0.82rem',
              padding: '0.35rem 0.85rem',
              background: engine === 'youtube' ? '#24292e' : '#f6f8fa',
              borderColor: engine === 'youtube' ? '#24292e' : '#d0d7de',
              color: engine === 'youtube' ? '#ffffff' : '#24292e'
            }}
          >
            ▶️ YouTube (Hidden Gems)
          </button>
          <button
            type="button"
            className="open-btn"
            onClick={() => setEngine('github')}
            style={{
              fontSize: '0.82rem',
              padding: '0.35rem 0.85rem',
              background: engine === 'github' ? '#24292e' : '#f6f8fa',
              borderColor: engine === 'github' ? '#24292e' : '#d0d7de',
              color: engine === 'github' ? '#ffffff' : '#24292e'
            }}
          >
            🐙 GitHub (Hidden Gems)
          </button>
        </div>
      )}

      {/* YouTube Specific Filter Bar (Clean Vercel Theme) */}
      {!searchInBookmarks && engine === 'youtube' && (
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          padding: '0.75rem 1rem',
          background: '#f6f8fa',
          border: '1px solid #d0d7de',
          borderRadius: '12px',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#24292e', fontWeight: 600 }}>Max Views:</span>
            <select
              value={maxViews}
              onChange={(e) => setMaxViews(Number(e.target.value))}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e5e5',
                color: '#111111',
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
            <span style={{ color: '#24292e', fontWeight: 600 }}>Upload Date:</span>
            <select
              value={uploadTime}
              onChange={(e) => setUploadTime(e.target.value)}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e5e5',
                color: '#111111',
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

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: '#57606a' }}>
            <input
              type="checkbox"
              checked={hideShorts}
              onChange={(e) => setHideShorts(e.target.checked)}
              style={{ accentColor: '#24292e' }}
            />
            <span>Hide Shorts</span>
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
            <span style={{ color: '#57606a', whiteSpace: 'nowrap' }}>Blacklist Channels:</span>
            <input
              type="text"
              placeholder="e.g. 5-Minute Crafts, T-Series"
              value={blacklistedChannels}
              onChange={(e) => setBlacklistedChannels(e.target.value)}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e5e5',
                color: '#111111',
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                width: '100%'
              }}
            />
          </div>
        </div>
      )}

      {/* GitHub Specific Filter Bar (Vercel Clean Theme) */}
      {!searchInBookmarks && engine === 'github' && (
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          padding: '0.75rem 1rem',
          background: '#f6f8fa',
          border: '1px solid #d0d7de',
          borderRadius: '12px',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#24292e', fontWeight: 600 }}>Max Stars:</span>
            <select
              value={maxStars}
              onChange={(e) => setMaxStars(Number(e.target.value))}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e5e5',
                color: '#111111',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}
            >
              <option value={0}>No star limit (All repos / Top stars)</option>
              <option value={100}>Under 100 stars (Ultra Small)</option>
              <option value={500}>Under 500 stars (Hidden Gems)</option>
              <option value={1000}>Under 1,000 stars (Under-the-radar)</option>
              <option value={5000}>Under 5,000 stars</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#24292e', fontWeight: 600 }}>Language:</span>
            <select
              value={githubLanguage}
              onChange={(e) => setGithubLanguage(e.target.value)}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e5e5',
                color: '#111111',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}
            >
              <option value="all">All Languages</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="rust">Rust</option>
              <option value="go">Go</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#24292e', fontWeight: 600 }}>Activity:</span>
            <select
              value={uploadTime}
              onChange={(e) => setUploadTime(e.target.value)}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e5e5',
                color: '#111111',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}
            >
              <option value="all">Anytime</option>
              <option value="month">Pushed in Past Month</option>
              <option value="6months">Pushed in Past 6 Months</option>
              <option value="year">Pushed in Past Year</option>
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: '#57606a' }}>
            <input
              type="checkbox"
              checked={excludeStudyNotes}
              onChange={(e) => setExcludeStudyNotes(e.target.checked)}
              style={{ accentColor: '#24292e' }}
            />
            <span>Exclude Lists/Notes</span>
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
            <span style={{ color: '#57606a', whiteSpace: 'nowrap' }}>Blacklist Orgs:</span>
            <input
              type="text"
              placeholder="e.g. spam-org, test-user"
              value={blacklistedOrgs}
              onChange={(e) => setBlacklistedOrgs(e.target.value)}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e5e5',
                color: '#111111',
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
            placeholder={searchInBookmarks ? "Search your saved bookmarks..." : `Search ${engine === 'google' ? 'Google' : engine === 'duckduckgo' ? 'DuckDuckGo' : engine === 'bing' ? 'Bing' : engine === 'youtube' ? 'YouTube (Hidden Gems)' : 'GitHub (Hidden Gems)'}...`}
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
                color: '#737373',
                borderBottom: '1px solid #eaeaea',
                background: '#fafafa'
              }}>
                <span>Search History</span>
                <span>
                  <kbd style={{ background: '#ffffff', padding: '2px 5px', borderRadius: '4px', border: '1px solid #e5e5e5', fontFamily: 'monospace' }}>Esc</kbd> hide • <kbd style={{ background: '#ffffff', padding: '2px 5px', borderRadius: '4px', border: '1px solid #e5e5e5', fontFamily: 'monospace' }}>Ctrl+Space</kbd> show
                </span>
              </div>
              {history.map((item, idx) => (
                <button 
                  key={idx} 
                  type="button"
                  className="history-item"
                  onClick={() => handleHistoryClick(item.query)}
                >
                  <Clock size={15} />
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
          style={(engine === 'youtube' || engine === 'github') ? { background: '#24292e', borderColor: '#24292e', color: '#ffffff' } : {}}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: '0.25rem' }}>
        <button
          type="button"
          className="open-btn"
          onClick={() => setSearchInBookmarks(!searchInBookmarks)}
          style={{
            fontSize: '0.82rem',
            padding: '0.35rem 0.8rem',
            background: searchInBookmarks ? '#111111' : '#ffffff',
            borderColor: searchInBookmarks ? '#111111' : '#eaeaea',
            color: searchInBookmarks ? '#ffffff' : '#666666'
          }}
        >
          <Bookmark size={14} />
          <span>{searchInBookmarks ? 'Searching Bookmarks Only (ON)' : 'Search in Bookmarks Only'}</span>
        </button>
      </div>
    </div>
  );
}
