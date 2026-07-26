import { SearchProvider } from './searchProvider.js';

const parseViewCount = (str) => {
  if (!str || typeof str !== 'string') return 0;
  const clean = str.toLowerCase().replace(/views?/g, '').replace(/no views/g, '0').trim();
  if (clean.includes('k')) {
    const num = parseFloat(clean.replace('k', ''));
    return isNaN(num) ? 0 : Math.round(num * 1000);
  }
  if (clean.includes('m')) {
    const num = parseFloat(clean.replace('m', ''));
    return isNaN(num) ? 0 : Math.round(num * 1000000);
  }
  if (clean.includes('b')) {
    const num = parseFloat(clean.replace('b', ''));
    return isNaN(num) ? 0 : Math.round(num * 1000000000);
  }
  const num = parseInt(clean.replace(/,/g, ''), 10);
  return isNaN(num) ? 0 : num;
};

export class YouTubeSearchService extends SearchProvider {
  async search(query, options = {}) {
    const { maxViews = 50000, hideShorts = false, blacklistedChannels = [] } = options;
    console.log(`Starting YouTube Search for: "${query}" (maxViews: ${maxViews}, hideShorts: ${hideShorts})`);

    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      };

      const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      const response = await fetch(url, { headers });

      if (!response.ok) {
        console.warn(`YouTube fetch returned status ${response.status}`);
        return [];
      }

      const html = await response.text();

      // Extract ytInitialData object from window script tag
      let initialData = null;
      const startMarker = 'var ytInitialData = ';
      const altMarker = 'window["ytInitialData"] = ';
      let startIndex = html.indexOf(startMarker);
      let offset = startMarker.length;

      if (startIndex === -1) {
        startIndex = html.indexOf(altMarker);
        offset = altMarker.length;
      }

      if (startIndex !== -1) {
        const jsonStart = startIndex + offset;
        const jsonEnd = html.indexOf(';</script>', jsonStart);
        if (jsonEnd !== -1) {
          const jsonStr = html.substring(jsonStart, jsonEnd);
          try {
            initialData = JSON.parse(jsonStr);
          } catch (e) {
            console.warn('Failed to parse ytInitialData JSON:', e.message);
          }
        }
      }

      if (!initialData) {
        console.warn('Could not locate ytInitialData in YouTube response');
        return [];
      }

      const contents = initialData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
      const rawVideos = [];

      for (const section of contents) {
        const items = section?.itemSectionRenderer?.contents || [];
        for (const item of items) {
          if (item.videoRenderer) {
            const v = item.videoRenderer;
            const videoId = v.videoId;
            if (!videoId) continue;

            const title = v.title?.runs?.[0]?.text || 'Untitled Video';
            const channelName = v.ownerText?.runs?.[0]?.text || v.shortBylineText?.runs?.[0]?.text || 'Unknown Channel';
            const channelId = v.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || '';
            const viewCountRaw = v.viewCountText?.simpleText || v.viewCountText?.runs?.[0]?.text || v.shortViewCountText?.simpleText || v.shortViewCountText?.runs?.[0]?.text || '0 views';
            const viewCount = parseViewCount(viewCountRaw);
            const publishedTime = v.publishedTimeText?.simpleText || 'Recently';
            const duration = v.lengthText?.simpleText || 'N/A';
            const isShort = v.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url?.includes('/shorts/') || (duration !== 'N/A' && !duration.includes(':'));
            
            const thumbnails = v.thumbnail?.thumbnails || [];
            const thumbnailUrl = thumbnails.length > 0 ? thumbnails[thumbnails.length - 1].url : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
            const snippet = v.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map(r => r.text).join('') || v.descriptionSnippet?.runs?.map(r => r.text).join('') || `Video by ${channelName} • ${viewCountRaw} • ${publishedTime}`;

            rawVideos.push({
              title,
              url: `https://www.youtube.com/watch?v=${videoId}`,
              snippet,
              domain: 'youtube.com',
              isYouTube: true,
              videoId,
              channelName,
              channelId,
              viewCountRaw,
              viewCount,
              publishedTime,
              duration,
              thumbnailUrl,
              isShort
            });
          }
        }
      }

      console.log(`YouTube raw search returned ${rawVideos.length} videos.`);

      // Apply Filter Rules
      const blacklistSet = new Set(blacklistedChannels.map(c => c.toLowerCase().trim()));

      const filteredVideos = rawVideos.filter(video => {
        // 1. Max Views Filter (if maxViews is set and > 0)
        if (maxViews > 0 && video.viewCount > maxViews) {
          return false;
        }

        // 2. Hide Shorts Filter
        if (hideShorts && video.isShort) {
          return false;
        }

        // 3. Blacklisted Channel Filter
        if (blacklistSet.has(video.channelName.toLowerCase()) || (video.channelId && blacklistSet.has(video.channelId.toLowerCase()))) {
          return false;
        }

        return true;
      });

      console.log(`YouTube search returning ${filteredVideos.length} filtered videos (after applying maxViews: ${maxViews}, blacklist, shorts rules).`);
      return filteredVideos;
    } catch (error) {
      console.error('YouTube search error:', error.message);
      return [];
    }
  }
}
