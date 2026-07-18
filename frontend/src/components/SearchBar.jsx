import { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function SearchBar({ onSearch, initialQuery = '', isLoading, history = [] }) {
  const [val, setVal] = useState(initialQuery);
  const [showHistory, setShowHistory] = useState(false);
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
      onSearch(val);
    }
  };

  const handleHistoryClick = (query) => {
    setVal(query);
    setShowHistory(false);
    onSearch(query);
  };

  return (
    <form className="search-container" onSubmit={handleSubmit}>
      <div className="search-wrapper" ref={wrapperRef}>
        <input
          type="text"
          className="search-input"
          style={{ width: '100%' }}
          placeholder="What do you want to learn today?"
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
  );
}
