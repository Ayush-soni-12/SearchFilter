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

const getSpParamForUploadTime = (uploadTime) => {
  switch ((uploadTime || '').toLowerCase()) {
    case 'hour':
      return 'EgQIARAB';
    case 'today':
      return 'EgQIABAB';
    case 'week':
      return 'EgQIAIAB';
    case 'month':
      return 'EgQIBIAB';
    case 'year':
      return 'EgQIBRAB';
    default:
      return '';
  }
};

const matchesUploadTimeFilter = (publishedText, uploadTime) => {
  if (!uploadTime || uploadTime === 'all') return true;
  const text = (publishedText || '').toLowerCase();
  
  if (uploadTime === 'hour') {
    return text.includes('second') || text.includes('minute') || text.includes('hour');
  }
  if (uploadTime === 'today') {
    return text.includes('second') || text.includes('minute') || text.includes('hour') || text.includes('1 day ago') || text.includes('day ago');
  }
  if (uploadTime === 'week') {
    return text.includes('second') || text.includes('minute') || text.includes('hour') || text.includes('day') || text.includes('1 week') || text.includes('days ago');
  }
  if (uploadTime === 'month') {
    return !text.includes('year') && !text.includes('years') && (text.includes('second') || text.includes('minute') || text.includes('hour') || text.includes('day') || text.includes('week') || text.includes('month ago') || text.includes('1 month ago'));
  }
  if (uploadTime === 'year') {
    return !text.includes('years ago') || text.includes('1 year ago');
  }
  return true;
};

const parseVideoRenderer = (v) => {
  if (!v || !v.videoId) return null;
  const videoId = v.videoId;
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

  return {
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
  };
};

const filterVideos = (rawVideos, options) => {
  const { maxViews = 50000, hideShorts = false, blacklistedChannels = [], uploadTime = 'all' } = options;
  const blacklistSet = new Set(blacklistedChannels.map(c => c.toLowerCase().trim()));

  return rawVideos.filter(video => {
    if (maxViews > 0 && video.viewCount > maxViews) return false;
    if (hideShorts && video.isShort) return false;
    if (blacklistSet.has(video.channelName.toLowerCase()) || (video.channelId && blacklistSet.has(video.channelId.toLowerCase()))) return false;
    if (!matchesUploadTimeFilter(video.publishedTime, uploadTime)) return false;
    return true;
  });
};

export class YouTubeSearchService extends SearchProvider {
  async fetchContinuation(apiKey, continuationToken, headers) {
    try {
      const continuationUrl = `https://www.youtube.com/youtubei/v1/search?key=${apiKey}`;
      const res = await fetch(continuationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': headers['User-Agent'],
          'Accept-Language': 'en-US,en;q=0.9'
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: 'WEB',
              clientVersion: '2.20240725.01.00'
            }
          },
          continuation: continuationToken
        })
      });

      if (!res.ok) return { rawVideos: [], nextToken: null };

      const data = await res.json();
      const actions = data?.onResponseReceivedCommands || [];
      const items = actions[0]?.appendContinuationItemsAction?.continuationItems || [];

      const rawVideos = [];
      let nextToken = null;

      for (const item of items) {
        if (item.videoRenderer) {
          const parsed = parseVideoRenderer(item.videoRenderer);
          if (parsed) rawVideos.push(parsed);
        } else if (item.continuationItemRenderer) {
          nextToken = item.continuationItemRenderer.continuationEndpoint?.continuationCommand?.token || null;
        } else if (item.itemSectionRenderer) {
          for (const subItem of (item.itemSectionRenderer.contents || [])) {
            if (subItem.videoRenderer) {
              const parsed = parseVideoRenderer(subItem.videoRenderer);
              if (parsed) rawVideos.push(parsed);
            } else if (subItem.continuationItemRenderer) {
              nextToken = subItem.continuationItemRenderer.continuationEndpoint?.continuationCommand?.token || null;
            }
          }
        }
      }

      return { rawVideos, nextToken };
    } catch (err) {
      console.warn('YouTube continuation fetch error:', err.message);
      return { rawVideos: [], nextToken: null };
    }
  }

  async search(query, options = {}) {
    const { maxViews = 50000, hideShorts = false, blacklistedChannels = [], uploadTime = 'all', continuationToken = null, apiKey = null } = options;
    console.log(`Starting YouTube Search for: "${query}" (maxViews: ${maxViews}, hideShorts: ${hideShorts}, continuationToken: ${continuationToken ? 'YES' : 'NO'})`);

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    };

    // If explicit continuationToken and apiKey are provided from client request:
    if (continuationToken && apiKey) {
      const { rawVideos, nextToken } = await this.fetchContinuation(apiKey, continuationToken, headers);
      const filtered = filterVideos(rawVideos, options);
      console.log(`Continuation page fetched ${rawVideos.length} raw videos, returning ${filtered.length} filtered videos.`);
      return {
        results: filtered,
        nextContinuationToken: nextToken,
        apiKey
      };
    }

    try {
      const spParam = getSpParamForUploadTime(uploadTime);
      let url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      if (spParam) {
        url += `&sp=${encodeURIComponent(spParam)}`;
      }

      const response = await fetch(url, { headers });
      if (!response.ok) {
        console.warn(`YouTube fetch returned status ${response.status}`);
        return { results: [], nextContinuationToken: null, apiKey: null };
      }

      const html = await response.text();

      // Extract INNERTUBE_API_KEY
      const keyMatch = html.match(/"INNERTUBE_API_KEY":\s*"([^"]+)"/);
      const extractedApiKey = keyMatch ? keyMatch[1] : null;

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
        return { results: [], nextContinuationToken: null, apiKey: null };
      }

      const contents = initialData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
      const rawVideos = [];
      let nextToken = null;

      for (const section of contents) {
        if (section.continuationItemRenderer) {
          nextToken = section.continuationItemRenderer.continuationEndpoint?.continuationCommand?.token || null;
        }
        const items = section?.itemSectionRenderer?.contents || [];
        for (const item of items) {
          if (item.videoRenderer) {
            const parsed = parseVideoRenderer(item.videoRenderer);
            if (parsed) rawVideos.push(parsed);
          } else if (item.continuationItemRenderer) {
            nextToken = item.continuationItemRenderer.continuationEndpoint?.continuationCommand?.token || null;
          }
        }
      }

      console.log(`YouTube raw search returned ${rawVideos.length} videos.`);
      let filteredVideos = filterVideos(rawVideos, options);
      console.log(`Initial page returned ${filteredVideos.length} filtered videos.`);

      // Auto-paging loop on initial search: if filtered results are low (< 12) and continuationToken exists
      let pageCount = 0;
      const MAX_AUTO_PAGES = 3;
      const TARGET_MIN_RESULTS = 12;

      while (filteredVideos.length < TARGET_MIN_RESULTS && nextToken && extractedApiKey && pageCount < MAX_AUTO_PAGES) {
        pageCount++;
        console.log(`Auto-fetching continuation page ${pageCount} to reach minimum target results...`);
        const { rawVideos: contRaw, nextToken: newNextToken } = await this.fetchContinuation(extractedApiKey, nextToken, headers);
        nextToken = newNextToken;

        if (contRaw.length === 0) break;
        const contFiltered = filterVideos(contRaw, options);
        console.log(`Auto-page ${pageCount} added ${contFiltered.length} filtered videos.`);
        filteredVideos.push(...contFiltered);
      }

      console.log(`YouTube initial search returning total ${filteredVideos.length} filtered videos.`);

      return {
        results: filteredVideos,
        nextContinuationToken: nextToken,
        apiKey: extractedApiKey
      };
    } catch (error) {
      console.error('YouTube search error:', error.message);
      return { results: [], nextContinuationToken: null, apiKey: null };
    }
  }
}
