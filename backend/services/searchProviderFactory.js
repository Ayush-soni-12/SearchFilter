import { GoogleSearchService } from './googleSearchService.js';
import { DuckDuckGoSearchService } from './duckDuckGoSearchService.js';
import { YouTubeSearchService } from './youtubeSearchService.js';
import { GitHubSearchService } from './githubSearchService.js';
import { HnSearchService } from './hnSearchService.js';

const googleService = new GoogleSearchService();
const duckDuckGoService = new DuckDuckGoSearchService();
const youtubeService = new YouTubeSearchService();
const githubService = new GitHubSearchService();
const hnService = new HnSearchService();

export const searchProviderFactory = {
  getProvider: (engine = 'google') => {
    switch ((engine || '').toLowerCase()) {
      case 'hackernews':
      case 'hn':
        return hnService;
      case 'github':
      case 'gh':
        return githubService;
      case 'youtube':
      case 'yt':
        return youtubeService;
      case 'duckduckgo':
      case 'ddg':
        return duckDuckGoService;
      case 'google':
      default:
        return googleService;
    }
  }
};
