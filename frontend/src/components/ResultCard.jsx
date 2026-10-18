import { ExternalLink, CheckCircle2, MinusCircle, XCircle, Bookmark, BookmarkCheck, Play } from 'lucide-react';

export default function ResultCard({ result, currentPref, onPreferenceChange, isBookmarked, onBookmarkToggle, onBlockChannel, blockedChannels = [] }) {
  if (result.engine === 'hackernews' || result.isHackerNews) {
    const formattedDate = result.createdAt
      ? new Date(result.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : null;

    return (
      <div className="result-card vercel-card animate-slide-up">
        <div>
          <div className="result-header">
            <a href={result.url} target="_blank" rel="noopener noreferrer" className="yt-title-link">
              <h3 className="result-title">{result.title}</h3>
            </a>
            <div className="yt-actions">
              {onBookmarkToggle && (
                <button 
                  className={`action-icon-btn ${isBookmarked ? 'bookmarked' : ''}`}
                  onClick={onBookmarkToggle}
                  title={isBookmarked ? 'Remove Bookmark' : 'Bookmark result'}
                >
                  {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                </button>
              )}
              <a href={result.hnUrl || result.url} target="_blank" rel="noopener noreferrer" className="open-btn">
                <span>HN</span>
                <ExternalLink size={13} />
              </a>
              {result.url && result.url !== result.hnUrl && (
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="open-btn">
                  <span>Visit</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>

          <div className="yt-meta-row">
            <span className="meta-badge">
              ▲ {result.points} pts
            </span>
            <span className="meta-badge">
              💬 {result.commentsCount} comments
            </span>
            <span className="meta-badge">
              👤 {result.author}
            </span>
            {result.postType && (
              <span className="meta-badge" style={{ color: '#0969da' }}>
                🏷️ {result.postType}
              </span>
            )}
            {formattedDate && (
              <span className="meta-badge">
                🕒 {formattedDate}
              </span>
            )}
          </div>

          <p className="result-snippet">{result.snippet}</p>
        </div>

        <div className="result-footer">
          <span className="result-domain">{result.domain || 'news.ycombinator.com'}</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
            Score: {result.finalScore}
          </span>
        </div>
      </div>
    );
  }

  if (result.isGitHub) {
    return (
      <div className="result-card vercel-card animate-slide-up">
        <div>
          <div className="result-header">
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
              {result.ownerAvatar && (
                <a href={result.url} target="_blank" rel="noopener noreferrer" tabIndex="-1">
                  <img 
                    src={result.ownerAvatar} 
                    alt={result.repoOwner || 'GitHub Owner'}
                    style={{ width: '34px', height: '34px', borderRadius: '6px', border: '1px solid var(--border-color)', objectFit: 'cover' }}
                  />
                </a>
              )}
              <a href={result.url} target="_blank" rel="noopener noreferrer" className="yt-title-link">
                <h3 className="result-title">{result.title}</h3>
              </a>
            </div>
            <div className="yt-actions">
              {onBookmarkToggle && (
                <button 
                  className={`action-icon-btn ${isBookmarked ? 'bookmarked' : ''}`}
                  onClick={onBookmarkToggle}
                  title={isBookmarked ? 'Remove Bookmark' : 'Bookmark result'}
                >
                  {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                </button>
              )}
              <a href={result.url} target="_blank" rel="noopener noreferrer" className="open-btn">
                <span>Repo</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          <div className="yt-meta-row">
            <span className="meta-badge">
              ⭐ {result.stars}
            </span>
            <span className="meta-badge">
              🍴 {result.forks}
            </span>
            {result.language && (
              <span className="meta-badge" style={{ color: '#0969da' }}>
                🏷️ {result.language}
              </span>
            )}
            {result.pushedTimeFormatted && (
              <span className="meta-badge">
                🕒 {result.pushedTimeFormatted}
              </span>
            )}
          </div>

          <p className="result-snippet">{result.snippet}</p>
        </div>

        <div className="result-footer">
          <span className="result-domain">{result.domain || 'github.com'}</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
            Score: {result.finalScore}
          </span>
        </div>
      </div>
    );
  }

  if (result.isYouTube) {
    return (
      <div className="result-card vercel-card animate-slide-up">
        <div className="yt-card-content">
          <div>
            {/* Thumbnail preview with image outline overlay */}
            <div className="yt-thumbnail-wrapper">
              <a href={result.url} target="_blank" rel="noopener noreferrer" tabIndex="-1">
                <img 
                  src={result.thumbnailUrl} 
                  alt={result.title}
                  className="yt-thumbnail-img"
                />
                <div className="yt-thumbnail-overlay">
                  <div className="yt-play-icon">
                    <Play size={16} fill="#ffffff" style={{ marginLeft: '2px' }} />
                  </div>
                </div>
              </a>
              {result.duration && (
                <span className="yt-duration-badge">
                  {result.duration}
                </span>
              )}
            </div>

            <div className="yt-header">
              <a href={result.url} target="_blank" rel="noopener noreferrer" className="yt-title-link">
                <h3 className="result-title">{result.title}</h3>
              </a>
            </div>

            <div className="yt-meta-row">
              <span className="meta-badge" style={{ color: '#ef4444', fontWeight: 600 }}>
                📺 {result.channelName}
              </span>
              <span className="meta-badge">
                👀 {result.viewCountRaw}
              </span>
              <span className="meta-badge">
                🕒 {result.publishedTime}
              </span>
            </div>

            <p className="result-snippet">{result.snippet}</p>
          </div>

          <div className="result-footer">
            <div className="yt-actions">
              {onBookmarkToggle && (
                <button
                  className={`action-icon-btn ${isBookmarked ? 'bookmarked' : ''}`}
                  onClick={onBookmarkToggle}
                  title={isBookmarked ? 'Remove Bookmark' : 'Bookmark result'}
                >
                  {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                </button>
              )}
              {onBlockChannel && result.channelName && (() => {
                const isBlocked = blockedChannels.includes(result.channelName);
                return (
                  <button
                    type="button"
                    className={`block-channel-btn${isBlocked ? ' blocked' : ''}`}
                    onClick={() => isBlocked
                      ? undefined
                      : onBlockChannel(result.channelName)
                    }
                    title={isBlocked ? `${result.channelName} is blocked` : `Block ${result.channelName}`}
                  >
                    {isBlocked ? '🚫 Blocked' : '🚫 Block'}
                  </button>
                );
              })()}
            </div>
            
            <a href={result.url} target="_blank" rel="noopener noreferrer" className="watch-btn">
              <span>Watch</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="result-card vercel-card animate-slide-up">
      <div>
        <div className="result-header">
          <div>
            <a href={result.url} target="_blank" rel="noopener noreferrer" className="yt-title-link">
              <h3 className="result-title">{result.title}</h3>
            </a>
            <div className="result-domain">
              {result.domain}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            {onBookmarkToggle && (
              <button 
                className={`action-icon-btn ${isBookmarked ? 'bookmarked' : ''}`}
                onClick={onBookmarkToggle}
                title={isBookmarked ? 'Remove Bookmark' : 'Bookmark result'}
              >
                {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              </button>
            )}
            <a href={result.url} target="_blank" rel="noopener noreferrer" className="open-btn">
              <span>Open</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
        
        <p className="result-snippet">{result.snippet}</p>
      </div>
      
      <div className="result-footer">
        <div className="preference-buttons">
          <button 
            className={`pref-btn prefer ${currentPref === 'prefer' ? 'active' : ''}`}
            onClick={() => onPreferenceChange(currentPref === 'prefer' ? 'neutral' : 'prefer')}
            title="Prefer this domain"
          >
            <CheckCircle2 size={13} /> Prefer
          </button>
          
          <button 
            className={`pref-btn neutral ${currentPref === 'neutral' ? 'active' : ''}`}
            onClick={() => onPreferenceChange('neutral')}
            title="Neutral rating"
          >
            <MinusCircle size={13} /> Neutral
          </button>
          
          <button 
            className={`pref-btn avoid ${currentPref === 'avoid' ? 'active' : ''}`}
            onClick={() => onPreferenceChange(currentPref === 'avoid' ? 'neutral' : 'avoid')}
            title="Avoid this domain"
          >
            <XCircle size={13} /> Avoid
          </button>
        </div>
        
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
          Score: {result.finalScore}
        </div>
      </div>
    </div>
  );
}
