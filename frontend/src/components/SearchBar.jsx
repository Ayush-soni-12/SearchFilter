import { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ onSearch, initialQuery = '', isLoading }) {
  const [val, setVal] = useState(initialQuery);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (val.trim()) {
      onSearch(val);
    }
  };

  return (
    <form className="search-container" onSubmit={handleSubmit}>
      <input
        type="text"
        className="search-input"
        placeholder="What do you want to learn today?"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        disabled={isLoading}
      />
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
