import * as cheerio from 'cheerio';
import { SearchProvider } from './searchProvider.js';

export class DuckDuckGoSearchService extends SearchProvider {
  async search(query, options = {}) {
    const page = options.continuationToken ? parseInt(options.continuationToken, 10) : 1;
    const offset = (page - 1) * 30;

    console.log(`Starting DuckDuckGo Search for: "${query}" (page ${page}, offset=${offset})`);
    try {
      let allRawResults = [];
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      };

      const fetchDDGPage = async (searchQuery) => {
        try {
          const url = offset > 0 
            ? `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}&s=${offset}`
            : `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;
          const response = await fetch(url, { headers });
          if (!response.ok || response.status !== 200) return [];

          const html = await response.text();
          const $ = cheerio.load(html);
          const results = [];

          $('.result').each((i, el) => {
            const titleEl = $(el).find('.result__title a, .result__a');
            const title = titleEl.text().trim();
            let rawHref = titleEl.attr('href') || '';

            let targetUrl = rawHref;
            if (rawHref.includes('uddg=')) {
              try {
                const urlParams = new URLSearchParams(rawHref.split('?')[1]);
                targetUrl = urlParams.get('uddg') || rawHref;
              } catch {
                targetUrl = rawHref;
              }
            } else if (rawHref.startsWith('//')) {
              targetUrl = 'https:' + rawHref;
            }

            const snippet = $(el).find('.result__snippet').text().trim();

            if (title && targetUrl && targetUrl.startsWith('http')) {
              let domain = '';
              try {
                domain = new URL(targetUrl).hostname.replace(/^www\./, '');
              } catch {
                domain = 'unknown';
              }

              results.push({ title, url: targetUrl, snippet, domain });
            }
          });
          return results;
        } catch {
          return [];
        }
      };

      const variations = [
        query,
        `${query} tutorial`,
        `${query} documentation`
      ];

      const resArrays = await Promise.all(variations.map(v => fetchDDGPage(v)));
      allRawResults = resArrays.flat();

      // Deduplicate results
      const uniqueUrls = new Set();
      const dedupedResults = allRawResults.filter(item => {
        if (uniqueUrls.has(item.url)) return false;
        uniqueUrls.add(item.url);
        return true;
      });

      if (dedupedResults.length > 0) {
        console.log(`DuckDuckGo Search page ${page} found ${dedupedResults.length} results.`);
        return {
          results: dedupedResults,
          nextContinuationToken: String(page + 1)
        };
      }
    } catch (error) {
      console.warn('DuckDuckGo direct fetch failed/rate limited, using fallback:', error.message);
      return { results: [], nextContinuationToken: null };
    }
  }
}
