import { ExternalLink, CheckCircle2, MinusCircle, XCircle, Bookmark, BookmarkCheck } from 'lucide-react';

export default function ResultCard({ result, currentPref, onPreferenceChange, isBookmarked, onBookmarkToggle }) {
  if (result.isYouTube) {
    return (
      <div className="result-card glass-panel" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
        {/* Thumbnail preview with duration badge */}
        <div style={{ position: 'relative', flexShrink: 0, width: '220px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          <a href={result.url} target="_blank" rel="noopener noreferrer">
            <img 
              src={result.thumbnailUrl} 
              alt={result.title}
              style={{ width: '100%', height: '124px', objectFit: 'cover', display: 'block' }}
            />
          </a>
          {result.duration && (
            <span style={{
              position: 'absolute',
              bottom: '6px',
              right: '6px',
              background: 'rgba(0,0,0,0.85)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: '4px',
              letterSpacing: '0.5px'
            }}>
              {result.duration}
            </span>
          )}
        </div>

        {/* Details section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <a href={result.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <h3 className="result-title" style={{ fontSize: '1.1rem', lineHeight: '1.4' }}>{result.title}</h3>
              </a>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                {onBookmarkToggle && (
                  <button 
                    className={`open-btn ${isBookmarked ? 'bookmarked' : ''}`}
                    onClick={onBookmarkToggle}
                    title={isBookmarked ? 'Remove Bookmark' : 'Bookmark result'}
                    style={{
                      background: isBookmarked ? 'rgba(59, 130, 246, 0.25)' : undefined,
                      borderColor: isBookmarked ? 'rgba(59, 130, 246, 0.6)' : undefined,
                      color: isBookmarked ? '#60a5fa' : undefined
                    }}
                  >
                    {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  </button>
                )}
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="open-btn" style={{ background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.5)', color: '#f87171' }}>
                  <span>Watch</span>
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>

            {/* Video metadata tags */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', margin: '0.4rem 0 0.6rem 0', fontSize: '0.82rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, color: '#f87171' }}>📺 {result.channelName}</span>
              <span style={{ color: 'var(--text-secondary)' }}>•</span>
              <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)', fontWeight: 500 }}>
                👀 {result.viewCountRaw}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>•</span>
              <span style={{ color: 'var(--text-secondary)' }}>🕒 {result.publishedTime}</span>
            </div>

            <p className="result-snippet" style={{ fontSize: '0.88rem', margin: 0, color: 'rgba(255,255,255,0.7)' }}>{result.snippet}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="result-card glass-panel">
      <div className="result-header">
        <div>
          <a href={result.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <h3 className="result-title">{result.title}</h3>
          </a>
          <div className="result-domain" style={{ marginTop: '0.25rem' }}>
            {result.domain}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {onBookmarkToggle && (
            <button 
              className={`open-btn ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={onBookmarkToggle}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark result'}
              style={{
                background: isBookmarked ? 'rgba(59, 130, 246, 0.25)' : undefined,
                borderColor: isBookmarked ? 'rgba(59, 130, 246, 0.6)' : undefined,
                color: isBookmarked ? '#60a5fa' : undefined
              }}
            >
              {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>
          )}
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="open-btn">
            <span>Open</span>
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
      
      <p className="result-snippet">{result.snippet}</p>
      
      <div className="result-footer">
        <div className="preference-buttons">
          <button 
            className={`pref-btn prefer ${currentPref === 'prefer' ? 'active' : ''}`}
            onClick={() => onPreferenceChange(currentPref === 'prefer' ? 'neutral' : 'prefer')}
          >
            <CheckCircle2 size={16} /> Prefer
          </button>
          
          <button 
            className={`pref-btn neutral ${currentPref === 'neutral' ? 'active' : ''}`}
            onClick={() => onPreferenceChange('neutral')}
          >
            <MinusCircle size={16} /> Neutral
          </button>
          
          <button 
            className={`pref-btn avoid ${currentPref === 'avoid' ? 'active' : ''}`}
            onClick={() => onPreferenceChange(currentPref === 'avoid' ? 'neutral' : 'avoid')}
          >
            <XCircle size={16} /> Avoid
          </button>
        </div>
        
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Score: {result.finalScore}
        </div>
      </div>
    </div>
  );
}
