import * as cheerio from 'cheerio';
import { SearchProvider } from './searchProvider.js';
import { DuckDuckGoSearchService } from './duckDuckGoSearchService.js';
import { primarySourcesService } from './primarySourcesService.js';
import { URL } from 'url';

const ddgService = new DuckDuckGoSearchService();

export class PrimarySourcesSearchService extends SearchProvider {
  /**
   * Search across primary technical documentation, research papers, and kernel sources.
   * Interleaves targeted arXiv systems research papers with scoped web documentation.
   */
  async search(query, options = {}) {
    const page = options.continuationToken ? parseInt(options.continuationToken, 10) : 1;
    const arxivOffset = (page - 1) * 8;

    console.log(`[PrimarySources] Searching authoritative sources for: "${query}" (page ${page})`);

    const results = [];
    const seenUrls = new Set();

    // 1. Fetch academic preprints from arXiv API
    const arxivPromise = (async () => {
      try {
        const arxivUrl = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=${arxivOffset}&max_results=8&sortBy=relevance`;
        const resp = await fetch(arxivUrl, {
          headers: {
            'User-Agent': 'SearchFilter/1.0 (authoritative-primary-sources-aggregator)'
          }
        });
        if (!resp.ok) return [];

        const xml = await resp.text();
        const $ = cheerio.load(xml, { xmlMode: true });
        const papers = [];

        $('entry').each((i, el) => {
          const title = $(el).find('title').text().replace(/\s+/g, ' ').trim();
          let summary = $(el).find('summary').text().replace(/\s+/g, ' ').trim();
          if (summary.length > 280) {
            summary = summary.substring(0, 277) + '...';
          }
          const rawId = $(el).find('id').text().trim();
          const published = $(el).find('published').text().trim();
          const publishedYear = published ? new Date(published).getFullYear() : null;

          // Authors
          const authors = [];
          $(el).find('author name').each((_, a) => {
            authors.push($(a).text().trim());
          });
          const authorSummary = authors.slice(0, 3).join(', ') + (authors.length > 3 ? ' et al.' : '');

          // PDF link
          let pdfUrl = '';
          const pdfLink = $(el).find('link[title="pdf"]').attr('href');
          if (pdfLink) {
            pdfUrl = pdfLink;
          } else if (rawId.includes('/abs/')) {
            pdfUrl = rawId.replace('/abs/', '/pdf/') + '.pdf';
          }

          if (title && rawId) {
            papers.push({
              title,
              url: rawId,
              snippet: summary ? `${authorSummary ? `[${authorSummary}] ` : ''}${summary}` : 'Research Paper (arXiv)',
              domain: 'arxiv.org',
              isPrimarySource: true,
              primaryCategory: 'Systems Research',
              isPaper: true,
              authors: authorSummary,
              publishedYear,
              pdfUrl: pdfUrl || null
            });
          }
        });
        return papers;
      } catch (err) {
        console.warn('[PrimarySources] arXiv API query error:', err.message);
        return [];
      }
    })();

    // 2. Fetch scoped technical documentation via DuckDuckGo
    const scopedWebPromise = (async () => {
      try {
        // Construct focused boolean site query
        const scopedQuery = `${query} (site:docs.kernel.org OR site:kernel.org OR site:lwn.net OR site:man7.org OR site:usenix.org OR site:bootlin.com OR site:lore.kernel.org OR site:ietf.org OR site:intel.com OR site:amd.com OR site:arm.com OR site:edu)`;
        const ddgResults = await ddgService.search(scopedQuery, {
          continuationToken: options.continuationToken
        });

        const rawList = Array.isArray(ddgResults) ? ddgResults : (ddgResults?.results || []);
        return primarySourcesService.annotateResults(rawList);
      } catch (err) {
        console.warn('[PrimarySources] Scoped web query error:', err.message);
        return [];
      }
    })();

    // Await both in parallel
    const [arxivPapers, webDocs] = await Promise.all([arxivPromise, scopedWebPromise]);

    // Interleave results (authoritative papers + core documentation)
    const maxLen = Math.max(arxivPapers.length, webDocs.length);
    for (let i = 0; i < maxLen; i++) {
      if (arxivPapers[i] && !seenUrls.has(arxivPapers[i].url)) {
        seenUrls.add(arxivPapers[i].url);
        results.push(arxivPapers[i]);
      }
      if (webDocs[i] && !seenUrls.has(webDocs[i].url)) {
        seenUrls.add(webDocs[i].url);
        results.push(webDocs[i]);
      }
    }

    console.log(`[PrimarySources] Found ${results.length} primary source results (${arxivPapers.length} papers, ${webDocs.length} docs)`);

    return {
      results,
      nextContinuationToken: (page + 1).toString()
    };
  }
}
