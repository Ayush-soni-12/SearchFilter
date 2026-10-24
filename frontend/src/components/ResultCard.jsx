import { useState } from 'react';
import { ExternalLink, CheckCircle2, MinusCircle, XCircle, Bookmark, BookmarkCheck, Play, ThumbsUp, ThumbsDown, Lock, Award, FileText, Cpu, AlertTriangle, Layers, ChevronDown, Check } from 'lucide-react';

export default function ResultCard({
  result,
  currentPref,
  onPreferenceChange,
  isBookmarked,
  onBookmarkToggle,
  isVisited = false,
  onVisitedToggle,
  rating,
  onRatingChange,
  isPaywalledByUser = false,
  onTogglePaywall,
  onBlockChannel,
  blockedChannels = []
}) {
  const [isClusterExpanded, setIsClusterExpanded] = useState(false);
  const cardClass = rating === 'good' ? ' is-good' : rating === 'bad' ? ' is-bad' : isVisited ? ' is-visited' : '';

  if (result.engine === 'hackernews' || result.isHackerNews) {
    const formattedDate = result.createdAt
      ? new Date(result.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : null;

    return (
      <div className={`result-card vercel-card animate-slide-up${cardClass}`}>
        <div>
          <div className="result-header">
            <div className="result-header-main">
              <a href={result.url} target="_blank" rel="noopener noreferrer" className="yt-title-link">
                <h3 className="result-title">{result.title}</h3>
              </a>
            </div>
            <div className="result-header-actions">
              {onBookmarkToggle && (
                <button 
                  type="button"
                  className={`action-btn bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                  onClick={onBookmarkToggle}
                  title={isBookmarked ? 'Remove Bookmark' : 'Bookmark result'}
                >
                  {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                  <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                </button>
              )}
              {onVisitedToggle && (
                <button
                  type="button"
                  className={`action-btn visited-btn ${isVisited ? 'visited' : ''}`}
                  onClick={onVisitedToggle}
                  title={isVisited ? 'Visited (click to unmark)' : 'Mark as visited'}
                >
                  <Check size={13} strokeWidth={isVisited ? 2.5 : 1.8} />
                  <span>Visited</span>
                </button>
              )}
              {onRatingChange && (
                <div className="rating-btn-group">
                  <button
                    type="button"
                    className={`action-btn rating-btn like-btn ${rating === 'good' ? 'active' : ''}`}
                    onClick={() => onRatingChange(rating === 'good' ? null : 'good')}
                    title={rating === 'good' ? 'Good resource (click to remove)' : 'Rate as good resource'}
                  >
                    <ThumbsUp size={13} strokeWidth={rating === 'good' ? 2.5 : 1.8} fill={rating === 'good' ? 'currentColor' : 'none'} />
                    <span>Good</span>
                  </button>
                  <button
                    type="button"
                    className={`action-btn rating-btn dislike-btn ${rating === 'bad' ? 'active' : ''}`}
                    onClick={() => onRatingChange(rating === 'bad' ? null : 'bad')}
                    title={rating === 'bad' ? 'Bad resource (click to remove)' : 'Rate as bad resource'}
                  >
                    <ThumbsDown size={13} strokeWidth={rating === 'bad' ? 2.5 : 1.8} fill={rating === 'bad' ? 'currentColor' : 'none'} />
                    <span>Bad</span>
                  </button>
                </div>
              )}
              {result.hnUrl && (
                <a href={result.hnUrl} target="_blank" rel="noopener noreferrer" className="open-btn">
                  <span>HN</span>
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
      <div className={`result-card vercel-card animate-slide-up${cardClass}`}>
        <div>
          <div className="result-header">
            <div className="result-header-main" style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
              {result.ownerAvatar && (
                <a href={result.url} target="_blank" rel="noopener noreferrer" tabIndex="-1" style={{ flexShrink: 0 }}>
                  <img 
                    src={result.ownerAvatar} 
                    alt={result.repoOwner || 'GitHub Owner'}
                    style={{ width: '34px', height: '34px', borderRadius: '6px', border: '1px solid var(--border-color)', objectFit: 'cover' }}
                  />
                </a>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="yt-title-link">
                  <h3 className="result-title">{result.title}</h3>
                </a>
              </div>
            </div>
            <div className="result-header-actions">
              {onBookmarkToggle && (
                <button 
                  type="button"
                  className={`action-btn bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                  onClick={onBookmarkToggle}
                  title={isBookmarked ? 'Remove Bookmark' : 'Bookmark result'}
                >
                  {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                  <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                </button>
              )}
              {onVisitedToggle && (
                <button
                  type="button"
                  className={`action-btn visited-btn ${isVisited ? 'visited' : ''}`}
                  onClick={onVisitedToggle}
                  title={isVisited ? 'Visited (click to unmark)' : 'Mark as visited'}
                >
                  <Check size={13} strokeWidth={isVisited ? 2.5 : 1.8} />
                  <span>Visited</span>
                </button>
              )}
              {onRatingChange && (
                <div className="rating-btn-group">
                  <button
                    type="button"
                    className={`action-btn rating-btn like-btn ${rating === 'good' ? 'active' : ''}`}
                    onClick={() => onRatingChange(rating === 'good' ? null : 'good')}
                    title={rating === 'good' ? 'Good resource (click to remove)' : 'Rate as good resource'}
                  >
                    <ThumbsUp size={13} strokeWidth={rating === 'good' ? 2.5 : 1.8} fill={rating === 'good' ? 'currentColor' : 'none'} />
                    <span>Good</span>
                  </button>
                  <button
                    type="button"
                    className={`action-btn rating-btn dislike-btn ${rating === 'bad' ? 'active' : ''}`}
                    onClick={() => onRatingChange(rating === 'bad' ? null : 'bad')}
                    title={rating === 'bad' ? 'Bad resource (click to remove)' : 'Rate as bad resource'}
                  >
                    <ThumbsDown size={13} strokeWidth={rating === 'bad' ? 2.5 : 1.8} fill={rating === 'bad' ? 'currentColor' : 'none'} />
                    <span>Bad</span>
                  </button>
                </div>
              )}
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
      <div className={`result-card vercel-card animate-slide-up${cardClass}`}>
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
                  type="button"
                  className={`action-btn bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                  onClick={onBookmarkToggle}
                  title={isBookmarked ? 'Remove Bookmark' : 'Bookmark result'}
                >
                  {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                  <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                </button>
              )}
              {onVisitedToggle && (
                <button
                  type="button"
                  className={`action-btn visited-btn ${isVisited ? 'visited' : ''}`}
                  onClick={onVisitedToggle}
                  title={isVisited ? 'Visited (click to unmark)' : 'Mark as visited'}
                >
                  <Check size={13} strokeWidth={isVisited ? 2.5 : 1.8} />
                  <span>Visited</span>
                </button>
              )}
              {onRatingChange && (
                <div className="rating-btn-group" style={{ width: 'auto' }}>
                  <button
                    type="button"
                    className={`action-btn rating-btn like-btn ${rating === 'good' ? 'active' : ''}`}
                    onClick={() => onRatingChange(rating === 'good' ? null : 'good')}
                    title={rating === 'good' ? 'Good resource (click to remove)' : 'Rate as good resource'}
                  >
                    <ThumbsUp size={13} strokeWidth={rating === 'good' ? 2.5 : 1.8} fill={rating === 'good' ? 'currentColor' : 'none'} />
                    <span>Good</span>
                  </button>
                  <button
                    type="button"
                    className={`action-btn rating-btn dislike-btn ${rating === 'bad' ? 'active' : ''}`}
                    onClick={() => onRatingChange(rating === 'bad' ? null : 'bad')}
                    title={rating === 'bad' ? 'Bad resource (click to remove)' : 'Rate as bad resource'}
                  >
                    <ThumbsDown size={13} strokeWidth={rating === 'bad' ? 2.5 : 1.8} fill={rating === 'bad' ? 'currentColor' : 'none'} />
                    <span>Bad</span>
                  </button>
                </div>
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
    <div className={`result-card vercel-card animate-slide-up${cardClass}`}>
      <div>
        <div className="result-header">
          <div className="result-header-main">
            <a href={result.url} target="_blank" rel="noopener noreferrer" className="yt-title-link">
              <h3 className="result-title">{result.title}</h3>
            </a>
            <div className="result-domain" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.45rem' }}>
              <span>{result.domain}</span>
              {result.isPrimarySource && (
                <span 
                  className={`primary-source-badge ${(result.primaryCategory || '').toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  title={`Authoritative primary technical source: ${result.primaryCategory || 'Primary Source'}`}
                >
                  <Award size={11} />
                  <span>{result.primaryCategory || 'Primary Source'}</span>
                </span>
              )}
              {result.depthLevel === 'deep' && (
                <span 
                  className="depth-badge deep" 
                  title="High Information Depth: Concrete architectural mechanisms, registers, or code structures detected"
                >
                  <Cpu size={11} />
                  <span>Deep Mechanics</span>
                </span>
              )}
              {result.isEchoChamber && (
                <span 
                  className="depth-badge shallow" 
                  title="Echo Chamber Detected: Repetitive cliché phrases with zero low-level mechanisms"
                >
                  <AlertTriangle size={11} />
                  <span>Cliché Heavy</span>
                </span>
              )}
              {result.pdfUrl && (
                <a 
                  href={result.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary-pdf-badge"
                  title="Direct open-access paper PDF"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText size={11} />
                  <span>PDF</span>
                </a>
              )}
              {isPaywalledByUser && (
                <span 
                  className="paywall-badge manual" 
                  title="You flagged this resource as paywalled"
                >
                  <Lock size={11} />
                  <span>Paywalled</span>
                </span>
              )}
            </div>
          </div>
          <div className="result-header-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {onBookmarkToggle && (
                <button 
                  type="button"
                  className={`action-btn bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                  onClick={onBookmarkToggle}
                  title={isBookmarked ? 'Remove Bookmark' : 'Bookmark result'}
                >
                  {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                  <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                </button>
              )}
              {onTogglePaywall && (
                <button
                  type="button"
                  className={`action-icon-mini-btn paywall-toggle-btn ${isPaywalledByUser ? 'active' : ''}`}
                  onClick={onTogglePaywall}
                  title={isPaywalledByUser ? 'Flagged as paywalled (click to unflag)' : 'Flag this link as paywalled'}
                >
                  <Lock size={12} strokeWidth={isPaywalledByUser ? 2.5 : 1.8} fill={isPaywalledByUser ? 'currentColor' : 'none'} />
                </button>
              )}
            </div>
            {onVisitedToggle && (
              <button
                type="button"
                className={`action-btn visited-btn ${isVisited ? 'visited' : ''}`}
                onClick={onVisitedToggle}
                title={isVisited ? 'Visited (click to unmark)' : 'Mark as visited'}
              >
                <Check size={13} strokeWidth={isVisited ? 2.5 : 1.8} />
                <span>Visited</span>
              </button>
            )}
            {onRatingChange && (
              <div className="rating-btn-group">
                <button
                  type="button"
                  className={`action-btn rating-btn like-btn ${rating === 'good' ? 'active' : ''}`}
                  onClick={() => onRatingChange(rating === 'good' ? null : 'good')}
                  title={rating === 'good' ? 'Good resource (click to remove)' : 'Rate as good resource'}
                >
                  <ThumbsUp size={13} strokeWidth={rating === 'good' ? 2.5 : 1.8} fill={rating === 'good' ? 'currentColor' : 'none'} />
                  <span>Good</span>
                </button>
                <button
                  type="button"
                  className={`action-btn rating-btn dislike-btn ${rating === 'bad' ? 'active' : ''}`}
                  onClick={() => onRatingChange(rating === 'bad' ? null : 'bad')}
                  title={rating === 'bad' ? 'Bad resource (click to remove)' : 'Rate as bad resource'}
                >
                  <ThumbsDown size={13} strokeWidth={rating === 'bad' ? 2.5 : 1.8} fill={rating === 'bad' ? 'currentColor' : 'none'} />
                  <span>Bad</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {result.authors && (
          <div className="paper-authors-meta">
            <span>By {result.authors}</span>
            {result.publishedYear && <span> • ({result.publishedYear})</span>}
          </div>
        )}
        <p className="result-snippet">{result.snippet}</p>

        {result.collapsedVariants && result.collapsedVariants.length > 0 && (
          <div className="cluster-container">
            <button 
              type="button" 
              className={`cluster-toggle-btn ${isClusterExpanded ? 'expanded' : ''}`}
              onClick={() => setIsClusterExpanded(!isClusterExpanded)}
            >
              <Layers size={13} />
              <span>
                {isClusterExpanded 
                  ? `Hide ${result.collapsedVariants.length} similar introductory summaries`
                  : `🔁 ${result.collapsedVariants.length} similar introductory summaries collapsed`}
              </span>
              <ChevronDown size={13} style={{ transform: isClusterExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
            </button>
            
            {isClusterExpanded && (
              <div className="cluster-variants-list animate-slide-up">
                {result.collapsedVariants.map((variant, idx) => (
                  <div key={idx} className="cluster-variant-item">
                    <div className="cluster-variant-header">
                      <a href={variant.url} target="_blank" rel="noopener noreferrer" className="cluster-variant-link">
                        {variant.title}
                      </a>
                      <span className="cluster-variant-domain">{variant.domain}</span>
                    </div>
                    {variant.snippet && <p className="cluster-variant-snippet">{variant.snippet}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
