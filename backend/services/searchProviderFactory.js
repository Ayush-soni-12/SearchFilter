import { GoogleSearchService } from './googleSearchService.js';
import { DuckDuckGoSearchService } from './duckDuckGoSearchService.js';
import { BraveSearchService } from './braveSearchService.js';
import { YouTubeSearchService } from './youtubeSearchService.js';
import { GitHubSearchService } from './githubSearchService.js';
import { HnSearchService } from './hnSearchService.js';
import { PrimarySourcesSearchService } from './primarySourcesSearchService.js';

const googleService = new GoogleSearchService();
const duckDuckGoService = new DuckDuckGoSearchService();
const braveService = new BraveSearchService();
const youtubeService = new YouTubeSearchService();
const githubService = new GitHubSearchService();
const hnService = new HnSearchService();
const primarySourcesService = new PrimarySourcesSearchService();

export const searchProviderFactory = {
  getProvider: (engine = 'google') => {
    switch ((engine || '').toLowerCase()) {
      case 'primary':
      case 'primarysources':
        return primarySourcesService;
      case 'hackernews':
      case 'hn':
        return hnService;
      case 'github':
      case 'gh':
        return githubService;
      case 'youtube':
      case 'yt':
        return youtubeService;
      case 'brave':
        return braveService;
      case 'duckduckgo':
      case 'ddg':
        return duckDuckGoService;
      case 'google':
      default:
        return googleService;
    }
  }
};
