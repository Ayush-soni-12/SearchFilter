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
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=50`;
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

      // We wait up to 60 seconds for the search results (#search). 
      // If a CAPTCHA appears, this gives the user 60 seconds to manually solve it.
      await page.waitForSelector('#search', { timeout: 60000 });

      // Extract results by looking for <h3> tags, which are consistently used for search result titles
      const results = await page.$$eval('h3', (elements) => {
        return elements.map(h3 => {
          // The <a> tag is usually the parent of the <h3>
          const linkEl = h3.closest('a') || h3.parentElement;
          if (!linkEl || !linkEl.href) return null;

          const title = h3.innerText;
          const url = linkEl.href;
          
          if (!url.startsWith('http') || url.includes('google.com') || url.includes('google.co.in')) return null;

          // Find the container to get the snippet
          const container = h3.closest('.g, .MjjYud, div[data-sokoban-container]') || h3.closest('div').parentElement;
          
          let snippet = '';
          if (container) {
            const snippetEl = container.querySelector('div[style*="-webkit-line-clamp"], .VwiC3b, .yXK7lf, .MUxGbd');
            if (snippetEl) {
              snippet = snippetEl.innerText;
            }
          }

          return { title, url, snippet };
        }).filter(item => item !== null && item.title.trim() !== '');
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
