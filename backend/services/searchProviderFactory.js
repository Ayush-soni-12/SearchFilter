import { GoogleSearchService } from './googleSearchService.js';
import { DuckDuckGoSearchService } from './duckDuckGoSearchService.js';
import { BingSearchService } from './bingSearchService.js';

const googleService = new GoogleSearchService();
const duckDuckGoService = new DuckDuckGoSearchService();
const bingService = new BingSearchService();

export const searchProviderFactory = {
  getProvider: (engine = 'google') => {
    switch ((engine || '').toLowerCase()) {
      case 'duckduckgo':
      case 'ddg':
        return duckDuckGoService;
      case 'bing':
        return bingService;
      case 'google':
      default:
        return googleService;
    }
  }
};
