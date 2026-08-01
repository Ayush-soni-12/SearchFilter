import { ExternalLink, CheckCircle2, MinusCircle, XCircle, Bookmark, BookmarkCheck, Play } from 'lucide-react';

export default function ResultCard({ result, currentPref, onPreferenceChange, isBookmarked, onBookmarkToggle, onBlockChannel, blockedChannels = [] }) {
  if (result.engine === 'hackernews' || result.isHackerNews) {
    const formattedDate = result.createdAt
      ? new Date(result.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : null;

    return (
      <div className="result-card vercel-card animate-slide-up">
        <div className="yt-card-content" style={{ gap: '1rem', alignItems: 'flex-start' }}>
          <div className="yt-details" style={{ flex: 1 }}>
            <div className="yt-header">
              <a href={result.url} target="_blank" rel="noopener noreferrer" className="yt-title-link">
                <h3 className="yt-title">{result.title}</h3>
              </a>
              <div className="yt-actions">
                {onBookmarkToggle && (
                  <button 
                    className={`action-icon-btn ${isBookmarked ? 'bookmarked' : ''}`}
                    onClick={onBookmarkToggle}
                    title={isBookmarked ? 'Remove Bookmark' : 'Bookmark result'}
                  >
                    {isBookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                  </button>
                )}
                <a href={result.hnUrl || result.url} target="_blank" rel="noopener noreferrer" className="open-btn">
                  <span>HN Discussion</span>
                  <ExternalLink size={14} />
                </a>
                {result.url && result.url !== result.hnUrl && (
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="open-btn">
                    <span>Visit Site</span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>

            <div className="yt-meta-row" style={{ marginTop: '0.35rem', marginBottom: '0.45rem' }}>
              <span className="yt-channel-badge" style={{ background: '#f6f8fa', color: '#24292e', borderColor: '#d0d7de' }}>
                ▲ {result.points} points
              </span>
              <span className="meta-dot">•</span>
              <span className="yt-views-badge" style={{ background: '#f6f8fa', color: '#57606a', borderColor: '#d0d7de' }}>
                💬 {result.commentsCount} comments
              </span>
              <span className="meta-dot">•</span>
              <span className="yt-time-badge" style={{ background: '#f6f8fa', color: '#57606a', borderColor: '#d0d7de' }}>
                👤 {result.author}
              </span>
              {result.postType && (
                <>
                  <span className="meta-dot">•</span>
                  <span className="yt-time-badge" style={{ background: '#ddf4ff', color: '#0969da', borderColor: '#54aeff' }}>
                    🏷️ {result.postType}
                  </span>
                </>
              )}
              {formattedDate && (
                <>
                  <span className="meta-dot">•</span>
                  <span className="yt-time-badge">
                    🕒 {formattedDate}
                  </span>
                </>
              )}
            </div>

            <p className="yt-snippet">{result.snippet}</p>

            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#737373', fontFamily: 'monospace' }}>
              <span>Domain: {result.domain}</span>
              <span>Score: {result.finalScore}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (result.isGitHub) {
    return (
      <div className="result-card vercel-card animate-slide-up">
        <div className="yt-card-content" style={{ gap: '1rem', alignItems: 'flex-start' }}>
          {result.ownerAvatar && (
            <div style={{ flexShrink: 0, marginTop: '2px' }}>
              <a href={result.url} target="_blank" rel="noopener noreferrer" tabIndex="-1">
                <img 
                  src={result.ownerAvatar} 
                  alt={result.repoOwner || 'GitHub Owner'}
                  style={{ width: '44px', height: '44px', borderRadius: '10px', border: '1px solid #eaeaea', objectFit: 'cover' }}
                />
              </a>
            </div>
          )}

          <div className="yt-details" style={{ flex: 1 }}>
            <div className="yt-header">
              <a href={result.url} target="_blank" rel="noopener noreferrer" className="yt-title-link">
                <h3 className="yt-title">{result.title}</h3>
              </a>
              <div className="yt-actions">
                {onBookmarkToggle && (
                  <button 
                    className={`action-icon-btn ${isBookmarked ? 'bookmarked' : ''}`}
                    onClick={onBookmarkToggle}
                    title={isBookmarked ? 'Remove Bookmark' : 'Bookmark result'}
                  >
                    {isBookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                  </button>
                )}
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="open-btn">
                  <span>View Repo</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            <div className="yt-meta-row" style={{ marginTop: '0.35rem', marginBottom: '0.45rem' }}>
              <span className="yt-channel-badge" style={{ background: '#f6f8fa', color: '#24292e', borderColor: '#d0d7de' }}>
                ⭐ {result.stars} stars
              </span>
              <span className="meta-dot">•</span>
              <span className="yt-views-badge" style={{ background: '#f6f8fa', color: '#57606a', borderColor: '#d0d7de' }}>
                🍴 {result.forks} forks
              </span>
              <span className="meta-dot">•</span>
              <span className="yt-time-badge" style={{ background: '#ddf4ff', color: '#0969da', borderColor: '#54aeff' }}>
                🏷️ {result.language}
              </span>
              {result.pushedTimeFormatted && (
                <>
                  <span className="meta-dot">•</span>
                  <span className="yt-time-badge">
                    🕒 {result.pushedTimeFormatted}
                  </span>
                </>
              )}
            </div>

            <p className="yt-snippet">{result.snippet}</p>

            <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#737373', fontFamily: 'monospace' }}>
              Quality Score: {result.finalScore}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (result.isYouTube) {
    return (
      <div className="result-card vercel-card animate-slide-up">
        <div className="yt-card-content">
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
                  <Play size={18} fill="#ffffff" style={{ marginLeft: '2px' }} />
                </div>
              </div>
            </a>
            {result.duration && (
              <span className="yt-duration-badge">
                {result.duration}
              </span>
            )}
          </div>

          {/* Video details section */}
          <div className="yt-details">
            <div className="yt-header">
              <a href={result.url} target="_blank" rel="noopener noreferrer" className="yt-title-link">
                <h3 className="yt-title">{result.title}</h3>
              </a>
              <div className="yt-actions">
                {onBookmarkToggle && (
                  <button
                    className={`action-icon-btn ${isBookmarked ? 'bookmarked' : ''}`}
                    onClick={onBookmarkToggle}
                    title={isBookmarked ? 'Remove Bookmark' : 'Bookmark result'}
                  >
                    {isBookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
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
                      {isBlocked ? '🚫 Blocked' : '🚫 Block Channel'}
                    </button>
                  );
                })()}
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="watch-btn">
                  <span>Watch</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Video metadata pill tags */}
            <div className="yt-meta-row">
              <span className="yt-channel-badge">
                📺 {result.channelName}
              </span>
              <span className="meta-dot">•</span>
              <span className="yt-views-badge">
                👀 {result.viewCountRaw}
              </span>
              <span className="meta-dot">•</span>
              <span className="yt-time-badge">
                🕒 {result.publishedTime}
              </span>
            </div>

            <p className="yt-snippet">{result.snippet}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="result-card vercel-card animate-slide-up">
      <div className="result-header">
        <div>
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="yt-title-link">
            <h3 className="result-title">{result.title}</h3>
          </a>
          <div className="result-domain">
            {result.domain}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {onBookmarkToggle && (
            <button 
              className={`action-icon-btn ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={onBookmarkToggle}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark result'}
            >
              {isBookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
            </button>
          )}
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="open-btn">
            <span>Open</span>
            <ExternalLink size={14} />
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
            <CheckCircle2 size={15} /> Prefer
          </button>
          
          <button 
            className={`pref-btn neutral ${currentPref === 'neutral' ? 'active' : ''}`}
            onClick={() => onPreferenceChange('neutral')}
          >
            <MinusCircle size={15} /> Neutral
          </button>
          
          <button 
            className={`pref-btn avoid ${currentPref === 'avoid' ? 'active' : ''}`}
            onClick={() => onPreferenceChange(currentPref === 'avoid' ? 'neutral' : 'avoid')}
          >
            <XCircle size={15} /> Avoid
          </button>
        </div>
        
        <div style={{ fontSize: '0.8rem', color: '#737373', fontFamily: 'monospace' }}>
          Score: {result.finalScore}
        </div>
      </div>
    </div>
  );
}
