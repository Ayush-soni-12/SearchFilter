import { useState, useRef, useEffect } from 'react';
import { Clock, Bookmark, Search as SearchIcon } from 'lucide-react';

export default function SearchBar({ onSearch, initialQuery = '', isLoading, history = [], blockedChannels = [], onBlockChannel, onUnblockChannel, onEngineChange, extraSlot }) {
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
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global "press / to search" shortcut like Google search
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const activeEl = document.activeElement;
        const tagName = activeEl?.tagName?.toLowerCase();
        const isEditable =
          tagName === 'input' ||
          tagName === 'textarea' ||
          tagName === 'select' ||
          activeEl?.isContentEditable;

        if (isEditable) return;

        if (inputRef.current && !inputRef.current.disabled) {
          e.preventDefault();
          inputRef.current.focus();
          const len = inputRef.current.value.length;
          inputRef.current.setSelectionRange(len, len);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
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
  const [deDuplicate, setDeDuplicate] = useState(true);
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
    deDuplicate,
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
      inputRef.current?.blur();
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
    <div className="search-bar-section">
      {!searchInBookmarks && (
        <div className="engine-bar">
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginRight: '0.25rem', fontWeight: 500 }}>Engine:</span>
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
            className={`engine-btn primary-engine-btn${engine === 'primary' ? ' active' : ''}`}
            onClick={() => handleEngineChange('primary')}
            title="Authoritative systems documentation, Linux kernel, USENIX/arXiv research papers, and hardware specs"
          >
            📜 Primary Sources
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
            ▶️ YouTube (Gems)
          </button>
          <button
            type="button"
            className={`engine-btn${engine === 'github' ? ' active' : ''}`}
            onClick={() => handleEngineChange('github')}
          >
            🐙 GitHub (Gems)
          </button>
        </div>
      )}

      {/* Primary Sources Advanced Info Bar */}
      {!searchInBookmarks && engine === 'primary' && (
        <div className="filter-drawer primary-filter-drawer animate-slide-up" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{
            display: 'flex',
            gap: '0.85rem',
            alignItems: 'center',
            flexWrap: 'wrap',
            width: '100%',
            fontSize: '0.83rem',
            color: 'var(--text-secondary)'
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#6366f1', fontWeight: 600 }}>
              <span>📜 Authoritative Systems Index</span>
            </span>
            <span>• Scopes Linux Kernel (`docs.kernel.org`, `lwn.net`, `man7.org`), USENIX, arXiv preprints, and Hardware Specs (`intel.com`, `arm.com`).</span>
          </div>
        </div>
      )}

      {/* Google Advanced Search & Clean Web Filter Bar */}
      {!searchInBookmarks && engine === 'google' && (
        <div className="filter-drawer animate-slide-up" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
            width: '100%'
          }}>
            <label className="filter-label">
              <input
                type="checkbox"
                checked={cleanWeb}
                onChange={(e) => setCleanWeb(e.target.checked)}
                style={{ accentColor: 'var(--accent-color)' }}
              />
              <span>⚡ Clean Web (udm=14)</span>
            </label>

            <label className="filter-label">
              <input
                type="checkbox"
                checked={antiSeo}
                onChange={(e) => setAntiSeo(e.target.checked)}
                style={{ accentColor: 'var(--accent-color)' }}
              />
              <span>🛡️ Anti-SEO Filter</span>
            </label>

            <label className="filter-label" title="Cluster and collapse redundant copy-paste introductory overviews">
              <input
                type="checkbox"
                checked={deDuplicate}
                onChange={(e) => setDeDuplicate(e.target.checked)}
                style={{ accentColor: 'var(--accent-color)' }}
              />
              <span>🧩 De-duplicate Echoes</span>
            </label>

            <button
              type="button"
              onClick={() => setShowFilterInfo(!showFilterInfo)}
              className="open-btn"
              style={{
                fontSize: '0.78rem',
                padding: '0.2rem 0.55rem',
                borderRadius: '6px'
              }}
            >
              <span>ℹ️</span> {showFilterInfo ? 'Hide Guide' : 'Operators Guide'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Operators:</span>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    insertOperator(e.target.value);
                  }
                }}
                className="filter-select"
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
            <div className="filter-guide-box animate-slide-up" style={{ marginTop: '0.4rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                💡 Google Search Filters & Advanced Operators:
              </div>

              <div style={{ marginBottom: '0.65rem' }}>
                <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                  <li><strong>⚡ Clean Web Mode (`udm=14`):</strong> Google's direct web search view. Strips out AI Overviews, sponsored products, and widget clutter.</li>
                  <li><strong>🛡️ Anti-SEO Clickbait Filter:</strong> Scans & hides clickbait listicles and SEO filler (<em>"Top 10..."</em>, <em>"Cheat sheet"</em>, <em>"Complete Guide"</em>).</li>
                </ul>
              </div>

              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.45rem' }}>
                  <div className="guide-item">
                    <code>"Exact Match"</code> — Exact phrase match.<br/>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}><code>"react state"</code></span>
                  </div>
                  <div className="guide-item">
                    <code>site:</code> — Restricts to a domain.<br/>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}><code>site:github.com</code></span>
                  </div>
                  <div className="guide-item">
                    <code>filetype:pdf</code> — Searches PDF files.<br/>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}><code>manual filetype:pdf</code></span>
                  </div>
                  <div className="guide-item">
                    <code>intitle:</code> — Title tag match.<br/>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}><code>intitle:architecture</code></span>
                  </div>
                  <div className="guide-item">
                    <code>inurl:</code> — URL path match.<br/>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}><code>inurl:docs</code></span>
                  </div>
                  <div className="guide-item">
                    <code>-exclude</code> — Exclude word/domain.<br/>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}><code>-site:quora.com</code></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* YouTube Specific Filter Bar */}
      {!searchInBookmarks && engine === 'youtube' && (
        <div className="filter-drawer animate-slide-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.8rem' }}>Max Views:</span>
            <select
              value={maxViews}
              onChange={(e) => setMaxViews(Number(e.target.value))}
              className="filter-select"
            >
              <option value={10000}>Under 10k views (Ultra Small)</option>
              <option value={50000}>Under 50k views (Hidden Gems)</option>
              <option value={100000}>Under 100k views (Under-the-radar)</option>
              <option value={500000}>Under 500k views</option>
              <option value={0}>No view limit (All videos)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.8rem' }}>Upload:</span>
            <select
              value={uploadTime}
              onChange={(e) => setUploadTime(e.target.value)}
              className="filter-select"
            >
              <option value="all">Anytime</option>
              <option value="hour">Past Hour</option>
              <option value="today">Past 24 Hours</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="year">Past Year</option>
            </select>
          </div>

          <label className="filter-label">
            <input
              type="checkbox"
              checked={hideShorts}
              onChange={(e) => setHideShorts(e.target.checked)}
              style={{ accentColor: 'var(--accent-color)' }}
            />
            <span>Hide Shorts</span>
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: '200px' }}>
            <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontSize: '0.8rem', fontWeight: 500 }}>🚫 Blocked:</span>
            <div className="channel-chip-input" style={{ flex: 1 }}>
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
                placeholder={blockedChannels.length === 0 ? 'Block channel + Enter…' : 'Add…'}
                value={channelInput}
                onChange={(e) => setChannelInput(e.target.value)}
                onKeyDown={handleChannelInputKeyDown}
                onBlur={commitChannelInput}
              />
            </div>
          </div>
        </div>
      )}

      {/* Hacker News Specific Filter Bar */}
      {!searchInBookmarks && (engine === 'hackernews' || engine === 'hn') && (
        <div className="filter-drawer animate-slide-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.8rem' }}>Type:</span>
            <select
              value={hnType}
              onChange={(e) => setHnType(e.target.value)}
              className="filter-select"
            >
              <option value="story">Stories</option>
              <option value="ask_hn">Ask HN</option>
              <option value="show_hn">Show HN</option>
              <option value="poll">Polls</option>
              <option value="comment">Comments</option>
              <option value="all">All Content</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.8rem' }}>Sort:</span>
            <select
              value={hnSort}
              onChange={(e) => setHnSort(e.target.value)}
              className="filter-select"
            >
              <option value="relevance">Relevance</option>
              <option value="date">Latest Date</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.8rem' }}>Min Points:</span>
            <select
              value={minPoints}
              onChange={(e) => setMinPoints(Number(e.target.value))}
              className="filter-select"
            >
              <option value={0}>Any</option>
              <option value={10}>10+</option>
              <option value={50}>50+</option>
              <option value={100}>100+</option>
              <option value={500}>500+</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.8rem' }}>Min Comments:</span>
            <select
              value={minComments}
              onChange={(e) => setMinComments(Number(e.target.value))}
              className="filter-select"
            >
              <option value={0}>Any</option>
              <option value={5}>5+</option>
              <option value={20}>20+</option>
              <option value={50}>50+</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.8rem' }}>Range:</span>
            <select
              value={hnDateRange}
              onChange={(e) => setHnDateRange(e.target.value)}
              className="filter-select"
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

      {/* GitHub Specific Filter Bar */}
      {!searchInBookmarks && engine === 'github' && (
        <div className="filter-drawer animate-slide-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.8rem' }}>Max Stars:</span>
            <select
              value={maxStars}
              onChange={(e) => setMaxStars(Number(e.target.value))}
              className="filter-select"
            >
              <option value={0}>No limit (All)</option>
              <option value={100}>&lt; 100 stars (Ultra Small)</option>
              <option value={500}>&lt; 500 stars (Hidden Gems)</option>
              <option value={1000}>&lt; 1,000 stars (Under-the-radar)</option>
              <option value={5000}>&lt; 5,000 stars</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.8rem' }}>Lang:</span>
            <select
              value={githubLanguage}
              onChange={(e) => setGithubLanguage(e.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="rust">Rust</option>
              <option value="go">Go</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.8rem' }}>Pushed:</span>
            <select
              value={uploadTime}
              onChange={(e) => setUploadTime(e.target.value)}
              className="filter-select"
            >
              <option value="all">Anytime</option>
              <option value="month">Past Month</option>
              <option value="6months">Past 6 Months</option>
              <option value="year">Past Year</option>
            </select>
          </div>

          <label className="filter-label">
            <input
              type="checkbox"
              checked={excludeStudyNotes}
              onChange={(e) => setExcludeStudyNotes(e.target.checked)}
              style={{ accentColor: 'var(--accent-color)' }}
            />
            <span>Exclude Notes</span>
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: '170px' }}>
            <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontSize: '0.8rem', fontWeight: 500 }}>Blacklist:</span>
            <input
              type="text"
              placeholder="e.g. spam-org"
              value={blacklistedOrgs}
              onChange={(e) => setBlacklistedOrgs(e.target.value)}
              className="filter-input"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      )}

      {/* Sleek Minimalist Search Form */}
      <form className="search-container" onSubmit={handleSubmit}>
        <div className="search-wrapper" ref={wrapperRef}>
          <span className="search-icon-inside">
            <SearchIcon size={16} />
          </span>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder={searchInBookmarks ? "Search your saved bookmarks... (press / to search)" : `Search ${engine === 'google' ? 'Google' : engine === 'duckduckgo' ? 'DuckDuckGo' : engine === 'brave' ? 'Brave' : engine === 'hackernews' ? 'Hacker News' : engine === 'youtube' ? 'YouTube' : 'GitHub'}... (press / to search)`}
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
                padding: '0.4rem 0.85rem',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--surface-color)'
              }}>
                <span>Search History</span>
                <span style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
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
                  <Clock size={14} />
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="open-btn"
          onClick={() => setSearchInBookmarks(!searchInBookmarks)}
          style={searchInBookmarks ? {
            background: 'var(--accent-color)',
            borderColor: 'var(--accent-color)',
            color: 'var(--bg-color)',
            fontWeight: 600
          } : {}}
        >
          <Bookmark size={14} />
          <span>{searchInBookmarks ? 'Searching Bookmarks Only (Active)' : 'Search in Bookmarks Only'}</span>
        </button>

        {extraSlot}
      </div>
    </div>
  );
}
