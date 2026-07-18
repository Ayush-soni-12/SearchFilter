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
      let allRawResults = [];

      // Fetch 4 pages (up to 40 results)
      for (let pageNum = 0; pageNum < 4; pageNum++) {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&start=${pageNum * 10}`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

        // Wait up to 60 seconds (allows time for CAPTCHA solving if it appears on any page)
        await page.waitForSelector('#search', { timeout: 60000 });

        // Extract results from this page
        const pageResults = await page.$$eval('h3', (elements) => {
          return elements.map(h3 => {
            const linkEl = h3.closest('a') || h3.parentElement;
            if (!linkEl || !linkEl.href) return null;

            const title = h3.innerText;
            const url = linkEl.href;
            
            if (!url.startsWith('http') || url.includes('google.com') || url.includes('google.co.in')) return null;

            const container = h3.closest('.g, .MjjYud, div[data-sokoban-container]') || h3.closest('div').parentElement;
            
            let snippet = '';
            if (container) {
              const snippetEl = container.querySelector('div[style*="-webkit-line-clamp"], .VwiC3b, .yXK7lf, .MUxGbd');
              if (snippetEl) snippet = snippetEl.innerText;
            }

            return { title, url, snippet };
          }).filter(item => item !== null && item.title.trim() !== '');
        });

        allRawResults = allRawResults.concat(pageResults);
        
        // Wait 500ms before fetching the next page to prevent aggressive rate limiting
        if (pageNum < 3) await page.waitForTimeout(500);
      }

      // Deduplicate results just in case Google returned overlapping results
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
