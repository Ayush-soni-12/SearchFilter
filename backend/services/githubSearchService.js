export class GitHubSearchService {
  async search(query, options = {}) {
    try {
      const maxStars = options.maxStars !== undefined ? parseInt(options.maxStars, 10) : 0;
      const minStars = options.minStars !== undefined ? parseInt(options.minStars, 10) : (maxStars > 0 ? 5 : 0);
      let language = options.githubLanguage && options.githubLanguage !== 'all' ? options.githubLanguage.trim() : null;
      if (language === 'cpp') language = 'c++';
      const excludeStudyNotes = options.excludeStudyNotes === true || options.excludeStudyNotes === 'true';
      const uploadTime = options.uploadTime || 'all';

      let blacklistedOrgs = [];
      if (Array.isArray(options.blacklistedOrgs)) {
        blacklistedOrgs = options.blacklistedOrgs.map(s => s.toLowerCase());
      } else if (typeof options.blacklistedOrgs === 'string' && options.blacklistedOrgs.trim()) {
        blacklistedOrgs = options.blacklistedOrgs.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      }

      // Build GitHub query string
      let queryParts = [query.trim()];

      // Star range qualifier
      if (maxStars > 0) {
        queryParts.push(`stars:${minStars}..${maxStars}`);
      } else if (minStars > 0) {
        queryParts.push(`stars:>=${minStars}`);
      }

      // Language qualifier
      if (language) {
        queryParts.push(`language:${language}`);
      }

      // Non-archived qualifier
      queryParts.push('archived:false');

      // Date / Recency qualifier
      if (uploadTime !== 'all') {
        const now = new Date();
        let daysAgo = 30;
        if (uploadTime === 'month') daysAgo = 30;
        else if (uploadTime === '6months') daysAgo = 180;
        else if (uploadTime === 'year') daysAgo = 365;

        const dateCutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        const isoDate = dateCutoff.toISOString().split('T')[0];
        queryParts.push(`pushed:>=${isoDate}`);
      }

      const fullQuery = queryParts.join(' ');
      
      // Determine GitHub API sort strategy:
      // If maxStars > 0 (Hidden Gem mode), sort by recently updated to find active small repos.
      // If maxStars === 0 (No filter / All repos), sort by stars descending.
      const apiUrl = maxStars > 0
        ? `https://api.github.com/search/repositories?q=${encodeURIComponent(fullQuery)}&sort=updated&order=desc&per_page=40`
        : `https://api.github.com/search/repositories?q=${encodeURIComponent(fullQuery)}&sort=stars&order=desc&per_page=40`;

      const headers = {
        'User-Agent': 'SearchFilter-App (https://github.com)',
        'Accept': 'application/vnd.github.v3+json'
      };

      if (process.env.GITHUB_TOKEN || options.apiKey) {
        headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN || options.apiKey}`;
      }

      const response = await fetch(apiUrl, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GitHub API error ${response.status}:`, errorText);
        if (response.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please wait a minute or set a GITHUB_TOKEN.');
        }
        throw new Error(`GitHub search failed with status ${response.status}`);
      }

      const data = await response.json();
      const items = data.items || [];

      const noisePatterns = ['awesome-', 'awesome list', 'leetcode', 'interview-prep', 'cheatsheet', 'solutions', 'solutions-to', 'course-notes', 'homework'];

      // Filter and score results
      const processedResults = items
        .filter(item => {
          if (!item || !item.owner) return false;
          const ownerName = item.owner.login.toLowerCase();
          if (blacklistedOrgs.includes(ownerName)) return false;

          // Extra safety star bounds
          if (maxStars > 0 && item.stargazers_count > maxStars) return false;
          if (minStars > 0 && item.stargazers_count < minStars) return false;

          // Exclude study notes / list clutter post-processing
          if (excludeStudyNotes) {
            const titleLower = item.name.toLowerCase();
            const descLower = (item.description || '').toLowerCase();
            const fullText = `${titleLower} ${descLower}`;

            const isNoise = noisePatterns.some(pattern => fullText.includes(pattern));
            if (isNoise) return false;
          }

          return true;
        })
        .map(item => {
          const stars = item.stargazers_count || 0;
          const forks = item.forks_count || 0;
          const pushedDate = new Date(item.pushed_at || item.updated_at);
          const daysSincePush = Math.max(0, (Date.now() - pushedDate.getTime()) / (1000 * 60 * 60 * 24));

          let finalScore = stars;
          if (maxStars > 0) {
            // Quality scoring algorithm for Hidden Gems
            let recencyScore = Math.max(0, 50 - daysSincePush * 0.5); // Max 50 points for recent commits
            let forkRatioScore = Math.min(30, (forks / (stars + 1)) * 40); // Max 30 points for high utility ratio
            let completenessScore = (item.description ? 10 : 0) + (item.license ? 10 : 0);
            finalScore = Math.round(recencyScore + forkRatioScore + completenessScore);
          }

          return {
            title: `${item.owner.login}/${item.name}`,
            url: item.html_url,
            snippet: item.description || 'No description provided for this repository.',
            domain: 'github.com',
            isGitHub: true,
            repoOwner: item.owner.login,
            repoName: item.name,
            ownerAvatar: item.owner.avatar_url,
            stars,
            forks,
            language: item.language || 'Code',
            updatedAt: item.pushed_at || item.updated_at,
            pushedTimeFormatted: formatRelativeTime(item.pushed_at || item.updated_at),
            license: item.license?.spdx_id || null,
            finalScore
          };
        });

      // Sort results:
      // If maxStars > 0, sort by Hidden Gem Quality Score descending
      // If maxStars === 0, sort by Stars descending
      if (maxStars > 0) {
        processedResults.sort((a, b) => b.finalScore - a.finalScore);
      } else {
        processedResults.sort((a, b) => b.stars - a.stars);
      }

      return {
        results: processedResults
      };

    } catch (error) {
      console.error('GitHub Search Service Error:', error);
      throw error;
    }
  }
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 3600) return 'Just now';
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
}
