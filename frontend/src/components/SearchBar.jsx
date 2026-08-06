import { useState, useRef, useEffect } from 'react';
import { Clock, Bookmark } from 'lucide-react';

export default function SearchBar({ onSearch, initialQuery = '', isLoading, history = [], blockedChannels = [], onBlockChannel, onUnblockChannel, onEngineChange }) {
  const [val, setVal] = useState(initialQuery);
  const [showHistory, setShowHistory] = useState(false);
  const [activeHistoryIndex, setActiveHistoryIndex] = useState(-1);
  const [searchInBookmarks, setSearchInBookmarks] = useState(false);
  const [engine, setEngine] = useState('google');
  const handleEngineChange = (newEngine) => {
    setEngine(newEngine);
    if (onEngineChange) onEngineChange(newEngine);
  };
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll the highlighted item into view when navigating with the keyboard
  useEffect(() => {
    if (activeHistoryIndex < 0 || !dropdownRef.current) return;
    const activeItem = dropdownRef.current.querySelectorAll('.history-item')[activeHistoryIndex];
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' });
    }
  }, [activeHistoryIndex]);

  const [maxViews, setMaxViews] = useState(50000);
  const [hideShorts, setHideShorts] = useState(true);
  const [channelInput, setChannelInput] = useState('');
  const [uploadTime, setUploadTime] = useState('all');

  const [cleanWeb, setCleanWeb] = useState(true);
  const [antiSeo, setAntiSeo] = useState(true);
  const [showFilterInfo, setShowFilterInfo] = useState(false);

  const [maxStars, setMaxStars] = useState(0);
  const [githubLanguage, setGithubLanguage] = useState('all');
  const [blacklistedOrgs, setBlacklistedOrgs] = useState('');
  const [excludeStudyNotes, setExcludeStudyNotes] = useState(true);

  const [hnType, setHnType] = useState('story');
  const [hnSort, setHnSort] = useState('relevance');
  const [minPoints, setMinPoints] = useState(0);
  const [minComments, setMinComments] = useState(0);
  const [hnDateRange, setHnDateRange] = useState('all');

  const getSearchPayload = () => ({
    searchInBookmarks,
    engine,
    cleanWeb,
    antiSeo,
    maxViews,
    hideShorts,
    blacklistedChannels: blockedChannels.join(','),
    uploadTime,
    maxStars,
    githubLanguage,
    blacklistedOrgs,
    excludeStudyNotes,
    hnType,
    hnSort,
    minPoints,
    minComments,
    hnDateRange
  });

  const insertOperator = (op) => {
    if (op === 'exact') {
      if (val.trim() && !val.startsWith('"') && !val.endsWith('"')) {
        setVal(`"${val.trim()}"`);
      } else if (!val.trim()) {
        setVal('""');
      }
    } else if (op === 'site') {
      setVal(prev => prev + (prev.endsWith(' ') || !prev ? '' : ' ') + 'site:');
    } else if (op === 'filetype') {
      setVal(prev => prev + (prev.endsWith(' ') || !prev ? '' : ' ') + 'filetype:pdf');
    } else if (op === 'intitle') {
      setVal(prev => prev + (prev.endsWith(' ') || !prev ? '' : ' ') + 'intitle:');
    } else if (op === 'inurl') {
      setVal(prev => prev + (prev.endsWith(' ') || !prev ? '' : ' ') + 'inurl:');
    } else if (op === 'exclude') {
      setVal(prev => prev + (prev.endsWith(' ') || !prev ? '' : ' ') + '-');
    } else if (op === 'after') {
      const currentYear = new Date().getFullYear();
      setVal(prev => prev + (prev.endsWith(' ') || !prev ? '' : ' ') + `after:${currentYear - 1}`);
    } else if (op === 'or') {
      setVal(prev => prev + (prev.endsWith(' ') || !prev ? '' : ' ') + 'OR ');
    } else if (op === 'related') {
      setVal(prev => prev + (prev.endsWith(' ') || !prev ? '' : ' ') + 'related:');
    }
  };

  const commitChannelInput = () => {
    const name = channelInput.trim().replace(/,$/, '').trim();
    if (name && onBlockChannel) {
      onBlockChannel(name);
      setChannelInput('');
    }
  };

  const handleChannelInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitChannelInput();
    } else if (e.key === 'Backspace' && channelInput === '' && blockedChannels.length > 0 && onUnblockChannel) {
      onUnblockChannel(blockedChannels[blockedChannels.length - 1]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (val.trim()) {
      setShowHistory(false);
      setActiveHistoryIndex(-1);
      onSearch(val, getSearchPayload());
    }
  };

  const handleHistoryClick = (query) => {
    setVal(query);
    setShowHistory(false);
    setActiveHistoryIndex(-1);
    onSearch(query, getSearchPayload());
  };

  const filteredHistory = history.filter(item =>
    !val.trim() || item.query.toLowerCase().includes(val.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowHistory(false);
      setActiveHistoryIndex(-1);
    } else if (e.ctrlKey && (e.key === ' ' || e.code === 'Space')) {
      e.preventDefault();
      setShowHistory(true);
    } else if (showHistory && filteredHistory.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveHistoryIndex(prev =>
          prev < filteredHistory.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveHistoryIndex(prev =>
          prev > 0 ? prev - 1 : filteredHistory.length - 1
        );
      } else if (e.key === 'Enter' && activeHistoryIndex >= 0) {
        e.preventDefault();
        handleHistoryClick(filteredHistory[activeHistoryIndex].query);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', marginBottom: '2rem' }}>
      {!searchInBookmarks && (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '0.35rem', fontWeight: 500 }}>Engine:</span>
          <button
            type="button"
            className={`engine-btn${engine === 'google' ? ' active' : ''}`}
            onClick={() => handleEngineChange('google')}
          >
            🌐 Google
          </button>
          <button
            type="button"
            className={`engine-btn${engine === 'duckduckgo' ? ' active' : ''}`}
            onClick={() => handleEngineChange('duckduckgo')}
          >
            🦆 DuckDuckGo
          </button>
          <button
            type="button"
            className={`engine-btn${engine === 'brave' ? ' active' : ''}`}
            onClick={() => handleEngineChange('brave')}
          >
            🦁 Brave
          </button>
          <button
            type="button"
            className={`engine-btn${engine === 'hackernews' ? ' active' : ''}`}
            onClick={() => handleEngineChange('hackernews')}
          >
            🟠 Hacker News
          </button>
          <button
            type="button"
            className={`engine-btn${engine === 'youtube' ? ' active' : ''}`}
            onClick={() => handleEngineChange('youtube')}
          >
            ▶️ YouTube (Hidden Gems)
          </button>
          <button
            type="button"
            className={`engine-btn${engine === 'github' ? ' active' : ''}`}
            onClick={() => handleEngineChange('github')}
          >
            🐙 GitHub (Hidden Gems)
          </button>
        </div>
      )}

      {/* Google Advanced Search & Clean Web Filter Bar */}
      {!searchInBookmarks && engine === 'google' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: '#f6f8fa',
          border: '1px solid #d0d7de',
          borderRadius: '12px',
          fontSize: '0.85rem'
        }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
            width: '100%'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: '#24292e', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={cleanWeb}
                onChange={(e) => setCleanWeb(e.target.checked)}
                style={{ accentColor: '#0969da' }}
              />
              <span>⚡ Clean Web Mode (udm=14)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: '#24292e', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={antiSeo}
                onChange={(e) => setAntiSeo(e.target.checked)}
                style={{ accentColor: '#0969da' }}
              />
              <span>🛡️ Anti-SEO Clickbait Filter</span>
            </label>

            <button
              type="button"
              onClick={() => setShowFilterInfo(!showFilterInfo)}
              style={{
                background: showFilterInfo ? '#ddf4ff' : '#ffffff',
                border: '1px solid #54aeff',
                color: '#0969da',
                fontSize: '0.78rem',
                fontWeight: 600,
                padding: '0.2rem 0.6rem',
                borderRadius: '99px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <span>ℹ️</span> {showFilterInfo ? 'Hide Guide' : 'How to use?'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}>
              <span style={{ fontSize: '0.82rem', color: '#24292e', fontWeight: 600 }}>Operators:</span>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    insertOperator(e.target.value);
                  }
                }}
                style={{
                  background: '#ffffff',
                  border: '1px solid #d0d7de',
                  color: '#0969da',
                  fontWeight: 600,
                  padding: '0.3rem 0.65rem',
                  borderRadius: '8px',
                  fontSize: '0.83rem',
                  cursor: 'pointer'
                }}
              >
                <option value="" disabled>⚡ Insert Operator...</option>
                <option value="exact">"Exact Match" — Exact word string</option>
                <option value="site">site: — Restrict to domain</option>
                <option value="filetype">filetype:pdf — Find PDF documents</option>
                <option value="intitle">intitle: — Title tag match</option>
                <option value="inurl">inurl: — URL path match</option>
                <option value="after">after:2025 — Year range filter</option>
                <option value="or">OR — Either term A or B</option>
                <option value="exclude">-exclude — Exclude word/domain</option>
                <option value="related">related: — Find similar sites</option>
              </select>
            </div>
          </div>

          {/* Expandable How to Use Guide Box */}
          {showFilterInfo && (
            <div className="animate-slide-up" style={{
              background: '#ffffff',
              border: '1px solid #d0d7de',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              fontSize: '0.83rem',
              color: '#24292e',
              lineHeight: 1.6
            }}>
              <div style={{ fontWeight: 700, color: '#0969da', marginBottom: '0.6rem', fontSize: '0.92rem' }}>
                💡 Google Search Filters & Advanced Operator Guide:
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <div style={{ fontWeight: 600, color: '#24292e', marginBottom: '0.2rem' }}>1. Clean & Anti-SEO Mode:</div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                  <li><strong>⚡ Clean Web Mode (`udm=14`):</strong> Requests Google's pure Web Search view. Strips out AI Overviews, sponsored product ads, and widget bloat.</li>
                  <li><strong>🛡️ Anti-SEO Clickbait Filter:</strong> Automatically scans & hides clickbait listicles (e.g. <em>"Top 10..."</em>, <em>"Cheat sheet"</em>, <em>"Complete Guide"</em>, <em>"Step-by-Step"</em>, and SEO year-stuffing).</li>
                </ul>
              </div>

              <div>
                <div style={{ fontWeight: 600, color: '#24292e', marginBottom: '0.35rem' }}>2. Advanced Search Operators Reference:</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.5rem' }}>
                  <div style={{ background: '#f6f8fa', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #eaeaea' }}>
                    <code>"Exact Match"</code> — Searches exact phrase word-for-word.<br/>
                    <span style={{ color: '#57606a', fontSize: '0.78rem' }}>Example: <code>"react state management"</code></span>
                  </div>
                  <div style={{ background: '#f6f8fa', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #eaeaea' }}>
                    <code>site:</code> — Restricts search strictly to a domain.<br/>
                    <span style={{ color: '#57606a', fontSize: '0.78rem' }}>Example: <code>react site:github.com</code></span>
                  </div>
                  <div style={{ background: '#f6f8fa', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #eaeaea' }}>
                    <code>filetype:pdf</code> — Searches for raw PDF files or manuals.<br/>
                    <span style={{ color: '#57606a', fontSize: '0.78rem' }}>Example: <code>python manual filetype:pdf</code></span>
                  </div>
                  <div style={{ background: '#f6f8fa', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #eaeaea' }}>
                    <code>intitle:</code> — Term must appear in the HTML page title.<br/>
                    <span style={{ color: '#57606a', fontSize: '0.78rem' }}>Example: <code>intitle:architecture</code></span>
                  </div>
                  <div style={{ background: '#f6f8fa', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #eaeaea' }}>
                    <code>inurl:</code> — Term must appear in the URL path.<br/>
                    <span style={{ color: '#57606a', fontSize: '0.78rem' }}>Example: <code>inurl:docs async</code></span>
                  </div>
                  <div style={{ background: '#f6f8fa', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #eaeaea' }}>
                    <code>after:2025</code> — Restricts results to recent content.<br/>
                    <span style={{ color: '#57606a', fontSize: '0.78rem' }}>Example: <code>vite 6 after:2025</code></span>
                  </div>
                  <div style={{ background: '#f6f8fa', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #eaeaea' }}>
                    <code>OR</code> — Matches either term A or term B.<br/>
                    <span style={{ color: '#57606a', fontSize: '0.78rem' }}>Example: <code>react OR vue</code></span>
                  </div>
                  <div style={{ background: '#f6f8fa', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #eaeaea' }}>
                    <code>-exclude</code> — Excludes a word or website.<br/>
                    <span style={{ color: '#57606a', fontSize: '0.78rem' }}>Example: <code>recipes -pinterest -site:quora.com</code></span>
                  </div>
                  <div style={{ background: '#f6f8fa', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #eaeaea' }}>
                    <code>related:</code> — Finds sites similar to a domain.<br/>
                    <span style={{ color: '#57606a', fontSize: '0.78rem' }}>Example: <code>related:github.com</code></span>
                  </div>
                </div>
              </div>
            </div>
          )}
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, minWidth: '220px' }}>
            <span style={{ color: '#57606a', whiteSpace: 'nowrap', fontSize: '0.85rem', fontWeight: 600 }}>🚫 Blocked Channels:</span>
            <div className="channel-chip-input">
              {blockedChannels.map((ch) => (
                <span key={ch} className="channel-chip">
                  {ch}
                  <button
                    type="button"
                    className="channel-chip-remove"
                    onClick={() => onUnblockChannel && onUnblockChannel(ch)}
                    title={`Unblock ${ch}`}
                  >✕</button>
                </span>
              ))}
              <input
                type="text"
                className="channel-chip-text"
                placeholder={blockedChannels.length === 0 ? 'Type channel name, press Enter…' : 'Add another…'}
                value={channelInput}
                onChange={(e) => setChannelInput(e.target.value)}
                onKeyDown={handleChannelInputKeyDown}
                onBlur={commitChannelInput}
              />
            </div>
            {blockedChannels.length > 0 && (
              <span style={{ fontSize: '0.72rem', color: '#57606a' }}>
                {blockedChannels.length} channel{blockedChannels.length > 1 ? 's' : ''} blocked · Press Backspace to remove last
              </span>
            )}
          </div>

        </div>
      )}

      {/* Hacker News Specific Filter Bar (Clean Vercel Theme) */}
      {!searchInBookmarks && (engine === 'hackernews' || engine === 'hn') && (
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
            <span style={{ color: '#24292e', fontWeight: 600 }}>Type:</span>
            <select
              value={hnType}
              onChange={(e) => setHnType(e.target.value)}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e5e5',
                color: '#111111',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}
            >
              <option value="story">Stories / Articles</option>
              <option value="ask_hn">Ask HN</option>
              <option value="show_hn">Show HN</option>
              <option value="poll">Polls</option>
              <option value="comment">Comments</option>
              <option value="all">All Content</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#24292e', fontWeight: 600 }}>Sort By:</span>
            <select
              value={hnSort}
              onChange={(e) => setHnSort(e.target.value)}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e5e5',
                color: '#111111',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}
            >
              <option value="relevance">Relevance</option>
              <option value="date">Latest Date</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#24292e', fontWeight: 600 }}>Min Points:</span>
            <select
              value={minPoints}
              onChange={(e) => setMinPoints(Number(e.target.value))}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e5e5',
                color: '#111111',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}
            >
              <option value={0}>Any Points</option>
              <option value={10}>10+ Points</option>
              <option value={50}>50+ Points</option>
              <option value={100}>100+ Points</option>
              <option value={500}>500+ Points</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#24292e', fontWeight: 600 }}>Min Comments:</span>
            <select
              value={minComments}
              onChange={(e) => setMinComments(Number(e.target.value))}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e5e5',
                color: '#111111',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}
            >
              <option value={0}>Any Comments</option>
              <option value={5}>5+ Comments</option>
              <option value={20}>20+ Comments</option>
              <option value={50}>50+ Comments</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#24292e', fontWeight: 600 }}>Date Range:</span>
            <select
              value={hnDateRange}
              onChange={(e) => setHnDateRange(e.target.value)}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e5e5',
                color: '#111111',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}
            >
              <option value="all">All Time</option>
              <option value="24h">Past 24 Hours</option>
              <option value="past_week">Past Week</option>
              <option value="past_month">Past Month</option>
              <option value="past_year">Past Year</option>
            </select>
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
            placeholder={searchInBookmarks ? "Search your saved bookmarks..." : `Search ${engine === 'google' ? 'Google' : engine === 'duckduckgo' ? 'DuckDuckGo' : engine === 'brave' ? 'Brave' : engine === 'hackernews' ? 'Hacker News' : engine === 'youtube' ? 'YouTube (Hidden Gems)' : 'GitHub (Hidden Gems)'}...`}
            value={val}
            onChange={(e) => { setVal(e.target.value); setActiveHistoryIndex(-1); }}
            onFocus={() => setShowHistory(true)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          
          {showHistory && filteredHistory.length > 0 && !isLoading && (
            <div className="history-dropdown animate-slide-up" ref={dropdownRef}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.4rem 1rem',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--surface-color)'
              }}>
                <span>Search History</span>
                <span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <kbd className="history-kbd">↑↓</kbd> navigate •
                  <kbd className="history-kbd">Enter</kbd> select •
                  <kbd className="history-kbd">Esc</kbd> close
                </span>
              </div>
              {filteredHistory.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`history-item${activeHistoryIndex === idx ? ' keyboard-active' : ''}`}
                  onClick={() => handleHistoryClick(item.query)}
                  onMouseEnter={() => setActiveHistoryIndex(idx)}
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
          style={(engine === 'hackernews' || engine === 'youtube' || engine === 'github') ? { background: '#24292e', borderColor: '#24292e', color: '#ffffff' } : {}}
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
