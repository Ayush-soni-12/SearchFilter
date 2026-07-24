import { ExternalLink, CheckCircle2, MinusCircle, XCircle, Bookmark, BookmarkCheck } from 'lucide-react';

export default function ResultCard({ result, currentPref, onPreferenceChange, isBookmarked, onBookmarkToggle }) {
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
