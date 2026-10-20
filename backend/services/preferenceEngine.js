import { storageService } from './storageService.js';
import { primarySourcesService } from './primarySourcesService.js';
import { echoChamberService } from './echoChamberService.js';

export const preferenceEngine = {
  async rankResults(rawResults, options = {}) {
    const preferences = await storageService.getPreferences();
    const totalResults = rawResults.length;

    // Expanded clickbait & SEO spam patterns
    const CLICKBAIT_PATTERN = /\b(top \d+|best \d+|\d+ (best|top|reasons|ways|things|secrets|tricks|tips|hacks|tools|examples|steps|rules|apps|sites)|ultimate guide|complete guide|step[- ]by[- ]step|everything you need to know|must read|you won't believe|simple trick|secret trick|life hack|foolproof|proven (method|way)|game changer|best practices for beginners|easy tutorial|cheat[- ]?sheet|why you (should|need)|reasons (to|why)|don't miss|unlocked|tested and reviewed|in 20\d\d)\b/i;

    let filteredResults = rawResults;

    // Filter out blacklisted domains
    if (Array.isArray(options.blacklistedDomains) && options.blacklistedDomains.length > 0) {
      const blSet = new Set(options.blacklistedDomains.map(d => d.toLowerCase().trim()));
      filteredResults = filteredResults.filter(r => {
        const domain = (r.domain || '').toLowerCase();
        return !blSet.has(domain);
      });
    }

    // Filter out SEO clickbait titles if antiSeo option is enabled
    if (options.antiSeo) {
      filteredResults = filteredResults.filter(r => {
        const title = r.title || '';
        return !CLICKBAIT_PATTERN.test(title);
      });
    }

    const rankedResults = filteredResults.map((rawResult, index) => {
      // Annotate with primary source classification if not already annotated
      const result = rawResult.isPrimarySource !== undefined
        ? rawResult 
        : primarySourcesService.annotateResult(rawResult);

      // Analyze information depth and echo-chamber signals
      const depthAnalysis = echoChamberService.analyze(result);

      const positionScore = totalResults - index;
      let preferenceScore = 0;
      
      const domainPref = preferences[result.domain];
      if (domainPref === 'prefer') {
        preferenceScore += 20;
      } else if (domainPref === 'avoid') {
        preferenceScore -= 20;
      }

      // Authoritative Primary Source quality boost
      let primaryScore = 0;
      if (result.isPrimarySource) {
        primaryScore = 15;
      }

      // Information depth & echo-chamber score adjustments
      let depthAdjustment = 0;
      if (depthAnalysis.depthLevel === 'deep') {
        depthAdjustment += 10;
      } else if (depthAnalysis.depthLevel === 'shallow') {
        depthAdjustment -= 10;
      }

      if (depthAnalysis.isEchoChamber) {
        depthAdjustment -= 15;
      }
      
      return {
        ...result,
        depthLevel: depthAnalysis.depthLevel,
        isEchoChamber: depthAnalysis.isEchoChamber,
        depthScore: depthAnalysis.depthScore,
        positionScore,
        preferenceScore,
        primaryScore,
        depthAdjustment,
        finalScore: positionScore + preferenceScore + primaryScore + depthAdjustment
      };
    });

    // Sort by finalScore descending
    rankedResults.sort((a, b) => b.finalScore - a.finalScore);

    // Apply semantic clustering and collapse redundant 101 overviews
    const clusteredResults = echoChamberService.clusterResults(rankedResults);

    return clusteredResults;
  }
};
