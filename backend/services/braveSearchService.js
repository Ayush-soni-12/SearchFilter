import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import { SearchProvider } from './searchProvider.js';
import { URL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USER_DATA_DIR = path.join(__dirname, '../playwright-profile');

export class BraveSearchService extends SearchProvider {
  async search(query, options = {}) {
    const pageBatch = options.continuationToken ? parseInt(options.continuationToken, 10) : 1;
    const PAGES_PER_BATCH = 2; // Scrapes 2 Brave pages (~20-30 results) per batch
    const startPage = (pageBatch - 1) * PAGES_PER_BATCH;
    const endPage = startPage + PAGES_PER_BATCH;

    console.log(`Starting Brave Search for: "${query}" (batch ${pageBatch}, pages ${startPage + 1}-${endPage})`);

    // Launch persistent context (Reuses existing Playwright context/profile)
    const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
      headless: false,
      viewport: null,
    });

    const page = await context.newPage();

    try {
      let allRawResults = [];

      for (let pageNum = startPage; pageNum < endPage; pageNum++) {
        const searchUrl = pageNum === 0 
          ? `https://search.brave.com/search?q=${encodeURIComponent(query)}`
          : `https://search.brave.com/search?q=${encodeURIComponent(query)}&offset=${pageNum}`;

        await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

        // Wait up to 60 seconds for results container or Cloudflare check
        await page.waitForSelector('#results, main, .snippet', { timeout: 60000 }).catch(() => {});

        // Extract Brave web search results
        const pageResults = await page.evaluate(() => {
          const results = [];
          const seen = new Set();

          // Strategy 1: Targeted snippet containers
          const containers = document.querySelectorAll('div.snippet, div[data-type="web"], .fresnel-container div[data-test-id], article, div.serp-result, div[id^="snippet-"]');
          
          containers.forEach(container => {
            const linkEl = container.querySelector('a.heading-serpresult, a[data-test-id="result-title"], a.title, h3 a, a[href^="http"]');
            if (!linkEl || !linkEl.href) return;

            const url = linkEl.href;
            if (!url.startsWith('http') || url.includes('search.brave.com') || url.includes('brave.com') || seen.has(url)) return;

            const titleEl = container.querySelector('h3, .title, .heading-serpresult, .title-text') || linkEl;
            const title = titleEl ? titleEl.innerText.trim() : '';

            const snippetEl = container.querySelector('.snippet-description, .desktop-snippet-description, .snippet-content, .body-snippet, .generic-snippet, p');
            const snippet = snippetEl ? snippetEl.innerText.trim() : '';

            if (title && url) {
              seen.add(url);
              results.push({ title, url, snippet });
            }
          });

          // Strategy 2: Fallback to all result links inside main search results wrapper if targeted containers missed
          if (results.length === 0) {
            const resultLinks = document.querySelectorAll('#results a[href^="http"], main a[href^="http"]');
            resultLinks.forEach(link => {
              const url = link.href;
              if (!url.startsWith('http') || url.includes('search.brave.com') || url.includes('brave.com') || seen.has(url)) return;

              const titleEl = link.querySelector('h3, .title') || link;
              const title = titleEl.innerText.trim();

              const parent = link.closest('div') || link.parentElement;
              const snippetEl = parent ? parent.querySelector('.snippet-description, p, span') : null;
              const snippet = snippetEl ? snippetEl.innerText.trim() : '';

              if (title && title.length > 3) {
                seen.add(url);
                results.push({ title, url, snippet });
              }
            });
          }

          return results;
        });

        allRawResults = allRawResults.concat(pageResults);

        if (pageNum < endPage - 1) await page.waitForTimeout(500);
      }

      // Deduplicate results
      const uniqueUrls = new Set();
      const results = allRawResults.filter(item => {
        if (uniqueUrls.has(item.url)) return false;
        uniqueUrls.add(item.url);
        return true;
      });

      // Add domain property to each result
      const enrichedResults = results.map(result => {
        try {
          const urlObj = new URL(result.url);
          const domain = urlObj.hostname.replace(/^www\./, '');
          return { ...result, domain };
        } catch {
          return { ...result, domain: '' };
        }
      });

      console.log(`Brave Search batch ${pageBatch} found ${enrichedResults.length} results.`);
      if (enrichedResults.length === 0) {
        console.warn('Warning: 0 results found for Brave Search.');
      }

      // Max 5 batches (up to 10 Brave pages / ~100 results)
      const nextContinuationToken = (enrichedResults.length > 0 && pageBatch < 5) ? String(pageBatch + 1) : null;

      return {
        results: enrichedResults,
        nextContinuationToken
      };

    } catch (error) {
      console.error('Error scraping Brave Search:', error);
      throw error;
    } finally {
      await context.close();
    }
  }
}
