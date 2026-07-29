import { GoogleSearchService } from './googleSearchService.js';
import { DuckDuckGoSearchService } from './duckDuckGoSearchService.js';
import { BingSearchService } from './bingSearchService.js';
import { YouTubeSearchService } from './youtubeSearchService.js';
import { GitHubSearchService } from './githubSearchService.js';

const googleService = new GoogleSearchService();
const duckDuckGoService = new DuckDuckGoSearchService();
const bingService = new BingSearchService();
const youtubeService = new YouTubeSearchService();
const githubService = new GitHubSearchService();

export const searchProviderFactory = {
  getProvider: (engine = 'google') => {
    switch ((engine || '').toLowerCase()) {
      case 'github':
      case 'gh':
        return githubService;
      case 'youtube':
      case 'yt':
        return youtubeService;
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
