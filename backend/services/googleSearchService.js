import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import { SearchProvider } from './searchProvider.js';
import { BraveSearchService } from './braveSearchService.js';
import { URL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USER_DATA_DIR = path.join(__dirname, '../playwright-profile');

export class GoogleSearchService extends SearchProvider {
  async search(query, options = {}) {
    const pageBatch = options.continuationToken ? parseInt(options.continuationToken, 10) : 1;
    const PAGES_PER_BATCH = 2; // Scrapes 2 Google pages (20 results) per batch
    const startPage = (pageBatch - 1) * PAGES_PER_BATCH;
    const endPage = startPage + PAGES_PER_BATCH;

    const cleanWebParam = options.cleanWeb ? '&udm=14' : '';
    let searchQuery = query;
    if (Array.isArray(options.excludeDomains) && options.excludeDomains.length > 0) {
      const exclusions = options.excludeDomains
        .map(d => `-site:${d.trim()}`)
        .filter(d => !searchQuery.includes(d))
        .join(' ');
      if (exclusions) {
        searchQuery = `${searchQuery} ${exclusions}`;
      }
    }

    console.log(`Starting Google Search for: "${searchQuery}" (batch ${pageBatch}, pages ${startPage + 1}-${endPage}, cleanWeb: ${!!options.cleanWeb})`);
    
    // Launch persistent context with stealth options (real user-agent & chrome flags)
    const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
      headless: false,
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ],
      viewport: null,
    });

    const page = await context.newPage();
    // Mask navigator.webdriver
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });
    
    try {
      let allRawResults = [];

      for (let pageNum = startPage; pageNum < endPage; pageNum++) {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&start=${pageNum * 10}${cleanWebParam}`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

        // Wait up to 60 seconds for page to load or search container to appear
        try {
          await page.waitForSelector('#search, div#rso, h3', { timeout: 15000 });
        } catch (e) {
          console.warn('Selector timeout, attempting extraction anyway...');
        }

        // Extract results from this page
        const pageResults = await page.$$eval('h3', (elements) => {
          return elements.map(h3 => {
            const linkEl = h3.closest('a') || h3.parentElement?.closest('a');
            if (!linkEl || !linkEl.href) return null;

            const title = h3.innerText || h3.textContent;
            const url = linkEl.href;
            
            if (!url.startsWith('http') || url.includes('google.com') || url.includes('google.co.in')) return null;

            const container = h3.closest('.g, .MjjYud, div[data-sokoban-container], div.Vkpfxw') || h3.closest('div').parentElement;
            
            let snippet = '';
            if (container) {
              const snippetEl = container.querySelector('div[style*="-webkit-line-clamp"], .VwiC3b, .yXK7lf, .MUxGbd, .StKSlc');
              if (snippetEl) snippet = snippetEl.innerText;
            }

            return { title, url, snippet };
          }).filter(item => item !== null && item.title && item.title.trim() !== '');
        });

        allRawResults = allRawResults.concat(pageResults);
        
        // Wait 500ms before fetching the next page to prevent aggressive rate limiting
        if (pageNum < endPage - 1) await page.waitForTimeout(500);
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

      console.log(`Google Search batch ${pageBatch} found ${enrichedResults.length} results.`);
      if (enrichedResults.length === 0) {
        console.warn('Warning: 0 Google results found (IP blocked or CAPTCHA). Closing Google context and falling back to Brave Search automatically...');
        await context.close();
        const braveService = new BraveSearchService();
        const fallbackRes = await braveService.search(query, options);
        return fallbackRes || { results: [], nextContinuationToken: null };
      }

      // Max 5 batches (up to 10 Google pages / 100 results)
      const nextContinuationToken = (enrichedResults.length > 0 && pageBatch < 5) ? String(pageBatch + 1) : null;

      return {
        results: enrichedResults,
        nextContinuationToken
      };

    } catch (error) {
      console.error('Error scraping Google:', error);
      throw error;
    } finally {
      // Always close the browser when done
      await context.close();
    }
  }
}
