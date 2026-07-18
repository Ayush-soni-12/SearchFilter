import { storageService } from './storageService.js';

export const preferenceEngine = {
  async rankResults(rawResults) {
    const preferences = await storageService.getPreferences();
    const totalResults = rawResults.length;

    const rankedResults = rawResults.map((result, index) => {
      const positionScore = totalResults - index;
      let preferenceScore = 0;
      
      const domainPref = preferences[result.domain];
      if (domainPref === 'prefer') {
        preferenceScore = 20;
      } else if (domainPref === 'avoid') {
        preferenceScore = -20;
      }
      
      return {
        ...result,
        positionScore,
        preferenceScore,
        finalScore: positionScore + preferenceScore
      };
    });

    // Sort by finalScore descending
    rankedResults.sort((a, b) => b.finalScore - a.finalScore);
    return rankedResults;
  }
};
