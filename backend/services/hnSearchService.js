export class HnSearchService {
  /**
   * Search Hacker News via official free Algolia API.
   * @param {string} query
   * @param {object} options
   * @returns {Promise<{results: Array, nextContinuationToken: string|null}>}
   */
  async search(query, options = {}) {
    try {
      const hnType = options.hnType || 'story'; // story, ask_hn, show_hn, poll, comment, all
      const hnSort = options.hnSort || 'relevance'; // relevance, date
      const minPoints = options.minPoints !== undefined ? parseInt(options.minPoints, 10) : 0;
      const minComments = options.minComments !== undefined ? parseInt(options.minComments, 10) : 0;
      const hnDateRange = options.hnDateRange || 'all'; // all, 24h, past_week, past_month, past_year

      // Select Algolia endpoint based on sort preference
      const endpoint = hnSort === 'date'
        ? 'https://hn.algolia.com/api/v1/search_by_date'
        : 'https://hn.algolia.com/api/v1/search';

      const params = new URLSearchParams();
      params.append('query', (query || '').trim());

      // Filter by item type tag
      if (hnType && hnType !== 'all') {
        params.append('tags', hnType);
      }

      // Build Algolia numeric filter expressions
      const numericFilters = [];
      if (minPoints > 0) {
        numericFilters.push(`points>=${minPoints}`);
      }
      if (minComments > 0) {
        numericFilters.push(`num_comments>=${minComments}`);
      }

      if (hnDateRange !== 'all') {
        const nowInSeconds = Math.floor(Date.now() / 1000);
        let secondsAgo = 24 * 3600;
        if (hnDateRange === '24h') secondsAgo = 24 * 3600;
        else if (hnDateRange === 'past_week') secondsAgo = 7 * 24 * 3600;
        else if (hnDateRange === 'past_month') secondsAgo = 30 * 24 * 3600;
        else if (hnDateRange === 'past_year') secondsAgo = 365 * 24 * 3600;

        const timestampCutoff = nowInSeconds - secondsAgo;
        numericFilters.push(`created_at_i>=${timestampCutoff}`);
      }

      if (numericFilters.length > 0) {
        params.append('numericFilters', numericFilters.join(','));
      }

      // Map page token for pagination
      const page = options.continuationToken ? parseInt(options.continuationToken, 10) : 0;
      params.append('page', page.toString());
      params.append('hitsPerPage', '20');

      const requestUrl = `${endpoint}?${params.toString()}`;
      const response = await fetch(requestUrl, {
        headers: {
          'User-Agent': 'SearchFilter-App (https://hn.algolia.com)'
        }
      });

      if (!response.ok) {
        throw new Error(`Algolia HN search API error: ${response.status}`);
      }

      const data = await response.json();
      const hits = data.hits || [];

      const results = hits.map(hit => {
        const title = hit.title || hit.story_title || 'Untitled HN Post';
        const rawUrl = hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`;
        const hnUrl = `https://news.ycombinator.com/item?id=${hit.objectID}`;

        let domain = 'news.ycombinator.com';
        try {
          if (hit.url) {
            domain = new URL(hit.url).hostname.replace(/^www\./, '');
          }
        } catch (e) {
          domain = 'news.ycombinator.com';
        }

        // Clean html tags from snippet highlights if present
        let snippet = '';
        if (hit._highlightResult?.story_text?.value) {
          snippet = hit._highlightResult.story_text.value.replace(/<[^>]+>/g, '');
        } else if (hit._highlightResult?.comment_text?.value) {
          snippet = hit._highlightResult.comment_text.value.replace(/<[^>]+>/g, '');
        } else if (hit.story_text) {
          snippet = hit.story_text;
        } else if (hit.comment_text) {
          snippet = hit.comment_text;
        } else {
          snippet = `Submitted by ${hit.author || 'unknown'} • ${hit.points || 0} points • ${hit.num_comments || 0} comments`;
        }

        let postType = 'Story';
        if (hit._tags?.includes('ask_hn')) postType = 'Ask HN';
        else if (hit._tags?.includes('show_hn')) postType = 'Show HN';
        else if (hit._tags?.includes('poll')) postType = 'Poll';
        else if (hit._tags?.includes('comment')) postType = 'Comment';

        return {
          title,
          url: rawUrl,
          hnUrl,
          snippet,
          domain,
          points: hit.points || 0,
          commentsCount: hit.num_comments || 0,
          author: hit.author || 'anonymous',
          createdAt: hit.created_at,
          postType,
          engine: 'hackernews'
        };
      });

      const currentPage = data.page !== undefined ? data.page : page;
      const totalPages = data.nbPages || 0;
      const nextContinuationToken = (currentPage + 1 < totalPages) ? (currentPage + 1).toString() : null;

      return {
        results,
        nextContinuationToken
      };
    } catch (error) {
      console.error('HN Search error:', error);
      throw error;
    }
  }
}
