import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import { SearchProvider } from './searchProvider.js';
import { URL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USER_DATA_DIR = path.join(__dirname, '../playwright-profile');

export class GoogleSearchService extends SearchProvider {
  async search(query) {
    console.log(`Starting Google Search for: "${query}"`);
    
    // Launch persistent context (Headful, so user can solve CAPTCHAs if needed)
    const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
      headless: false,
      viewport: null, // Let it use default window size
    });

    const page = await context.newPage();
    
    try {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

      // We wait up to 60 seconds for the search results (#search). 
      // If a CAPTCHA appears, this gives the user 60 seconds to manually solve it.
      await page.waitForSelector('#search', { timeout: 60000 });

      // Extract results
      const results = await page.$$eval('#search .g', (elements) => {
        return elements.map(el => {
          const titleEl = el.querySelector('h3');
          const linkEl = el.querySelector('a');
          
          if (!titleEl || !linkEl) return null;

          const title = titleEl.innerText;
          const url = linkEl.href;
          
          let snippet = '';
          const snippetEl = el.querySelector('div[style*="-webkit-line-clamp"]');
          const fallbackSnippetEl = el.querySelector('.VwiC3b');
          
          if (snippetEl) {
            snippet = snippetEl.innerText;
          } else if (fallbackSnippetEl) {
            snippet = fallbackSnippetEl.innerText;
          }

          return { title, url, snippet };
        }).filter(item => item !== null && item.url.startsWith('http'));
      });

      // Add domain property to each result
      const enrichedResults = results.map(result => {
        try {
          const urlObj = new URL(result.url);
          // Get the base domain (e.g. www.github.com -> github.com)
          const domain = urlObj.hostname.replace(/^www\./, '');
          return { ...result, domain };
        } catch (e) {
          return { ...result, domain: '' };
        }
      });

      console.log(`Found ${enrichedResults.length} results.`);
      if (enrichedResults.length === 0) {
        console.warn('Warning: 0 results found. Google may have changed their HTML structure or a CAPTCHA blocked the search.');
      }
      return enrichedResults;

    } catch (error) {
      console.error('Error scraping Google:', error);
      throw error;
    } finally {
      // Always close the browser when done
      await context.close();
    }
  }
}
