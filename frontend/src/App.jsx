import { useState, useEffect } from 'react';
import { Settings, Search as SearchIcon, Trash2, AlertCircle } from 'lucide-react';
import { api } from './api';
import SearchBar from './components/SearchBar';
import ResultCard from './components/ResultCard';

function App() {
  const [activePage, setActivePage] = useState('home');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Load preferences on mount
    api.getPreferences().then(setPreferences).catch(console.error);
  }, []);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setIsLoading(true);
    setErrorMsg('');
    setActivePage('results');
    
    try {
      const data = await api.search(searchQuery);
      setResults(data.results);
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = async (domain, newStatus) => {
    try {
      // Optimistic update
      const updatedPrefs = { ...preferences };
      if (newStatus === 'neutral') delete updatedPrefs[domain];
      else updatedPrefs[domain] = newStatus;
      
      setPreferences(updatedPrefs);

      // Re-sort results instantly
      setResults(prev => {
        const newResults = prev.map(r => {
          if (r.domain !== domain) return r;
          let prefScore = 0;
          if (newStatus === 'prefer') prefScore = 20;
          if (newStatus === 'avoid') prefScore = -20;
          return {
            ...r,
            preferenceScore: prefScore,
            finalScore: r.positionScore + prefScore
          };
        });
        return newResults.sort((a, b) => b.finalScore - a.finalScore);
      });

      // API call
      await api.updatePreference(domain, newStatus);
    } catch (error) {
      console.error('Failed to update preference', error);
      // Revert on failure (simplified)
      api.getPreferences().then(setPreferences);
    }
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand" onClick={() => setActivePage('home')}>
          SearchFilter
        </div>
        <button 
          className="open-btn" 
          onClick={() => setActivePage(activePage === 'settings' ? 'home' : 'settings')}
        >
          <Settings size={18} />
          {activePage === 'settings' ? 'Close Settings' : 'Settings'}
        </button>
      </nav>

      <main>
        {activePage !== 'settings' && (
          <SearchBar onSearch={handleSearch} initialQuery={query} isLoading={isLoading} />
        )}

        {errorMsg && (
          <div className="error-message animate-slide-up">
            <AlertCircle size={20} />
            {errorMsg}
          </div>
        )}

        {isLoading && (
          <div className="loader animate-slide-up">
            <SearchIcon size={48} className="animate-pulse" />
            <p>Searching and ranking results...</p>
          </div>
        )}

        {!isLoading && activePage === 'results' && (
          <div className="animate-slide-up">
            {results.length === 0 ? (
              <p>No results found.</p>
            ) : (
              results.map((result, i) => (
                <ResultCard 
                  key={result.url + i} 
                  result={result} 
                  currentPref={preferences[result.domain] || 'neutral'}
                  onPreferenceChange={(status) => handlePreferenceChange(result.domain, status)}
                />
              ))
            )}
          </div>
        )}

        {activePage === 'settings' && (
          <div className="glass-panel animate-slide-up" style={{ padding: '2rem' }}>
            <div className="settings-header">
              <h2>Domain Preferences</h2>
              <p>Manage how specific websites are ranked.</p>
            </div>
            
            <div>
              {Object.keys(preferences).length === 0 ? (
                <p>No preferences set yet. Search and rank some domains!</p>
              ) : (
                <ul className="settings-list">
                  {Object.entries(preferences).map(([domain, status]) => (
                    <li key={domain} className="settings-item">
                      <div className="settings-item-info">
                        <span className="settings-domain">{domain}</span>
                        <span className={`settings-status ${status}`}>
                          {status.toUpperCase()}
                        </span>
                      </div>
                      <button 
                        className="settings-remove-btn" 
                        title="Remove preference"
                        onClick={() => handlePreferenceChange(domain, 'neutral')}
                      >
                        <Trash2 size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
