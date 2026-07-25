import * as cheerio from 'cheerio';
import { SearchProvider } from './searchProvider.js';

export class BingSearchService extends SearchProvider {
  async search(query) {
    console.log(`Starting Bing Search for: "${query}"`);
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      };

      const fetchBingQuery = async (searchQuery) => {
        try {
          const url = `https://www.bing.com/search?q=${encodeURIComponent(searchQuery)}`;
          const response = await fetch(url, { headers });
          if (!response.ok) return [];

          const html = await response.text();
          const $ = cheerio.load(html);
          const pageResults = [];

          $('li.b_algo').each((i, el) => {
            const titleEl = $(el).find('h2 a');
            const title = titleEl.text().trim();
            const rawHref = titleEl.attr('href') || '';
            const snippet = $(el).find('.b_caption p, .b_algoSlug').text().trim();

            let realUrl = rawHref;
            if (rawHref.includes('/ck/a?!') && rawHref.includes('&u=')) {
              try {
                const uParam = new URLSearchParams(rawHref.split('?')[1]).get('u');
                if (uParam && uParam.startsWith('a1')) {
                  realUrl = Buffer.from(uParam.substring(2), 'base64').toString('utf-8');
                }
              } catch {
                realUrl = rawHref;
              }
            }

            if (title && realUrl && realUrl.startsWith('http')) {
              let domain = '';
              try {
                domain = new URL(realUrl).hostname.replace(/^www\./, '');
              } catch {
                domain = 'unknown';
              }
              pageResults.push({ title, url: realUrl, snippet, domain });
            }
          });

          return pageResults;
        } catch (e) {
          return [];
        }
      };

      // Search variations to fetch 30+ comprehensive results in parallel
      const variations = [
        query,
        `${query} documentation`,
        `${query} github cheatsheet`,
        `learn ${query} online`,
        `best ${query} courses`,
        `${query} examples articles`,
        `${query} guide overview`
      ];

      const resultsArray = await Promise.all(variations.map(v => fetchBingQuery(v)));
      let allRawResults = resultsArray.flat();

      // Deduplicate results
      const uniqueUrls = new Set();
      const dedupedResults = allRawResults.filter(item => {
        if (uniqueUrls.has(item.url)) return false;
        uniqueUrls.add(item.url);
        return true;
      });

      console.log(`Bing Search found ${dedupedResults.length} results.`);
      return dedupedResults;
    } catch (error) {
      console.error('Bing search error:', error);
      return [];
    }
  }
}
