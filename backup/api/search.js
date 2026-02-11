// api/search.js - Vercel Serverless Function
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        error: 'Missing search query parameter',
        message: "Please provide a search query using the 'q' parameter."
      });
    }
    
    // If no API key is configured, return demo data
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
      return res.status(200).json({
        items: getDemoSearchData(q),
        demo: true,
        query: q,
        message: "YouTube API key not configured. Using demo data."
      });
    }

    // YouTube API parameters for music search
    const params = new URLSearchParams({
      part: 'snippet',
      q: `${q} music`,
      type: 'video',
      videoCategoryId: '10', // Music category
      maxResults: '12',
      key: YOUTUBE_API_KEY
    });

    const apiUrl = `https://www.googleapis.com/youtube/v3/search?${params}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Music-Hub-App/1.0'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API Error:', errorData);
      
      // Fallback to demo data on API error
      return res.status(200).json({
        items: getDemoSearchData(q),
        demo: true,
        query: q,
        error: errorData.error?.message || 'YouTube API error',
        message: "Using demo data due to API error."
      });
    }

    const data = await response.json();
    
    // Cache response for 2 minutes (Vercel edge caching)
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate');
    
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Search API Error:', error);
    
    // Fallback to demo data
    return res.status(200).json({
      items: getDemoSearchData(req.query.q || ''),
      demo: true,
      query: req.query.q || '',
      error: error.message,
      message: "Using demo data due to server error."
    });
  }
}

// Demo data for search results
function getDemoSearchData(query) {
  const queryLower = query.toLowerCase();
  
  // Define different demo results based on query
  const allDemoVideos = [
    {
      id: { videoId: 'JGwWNGJdvx8' },
      snippet: {
        title: 'Shape of You - Ed Sheeran',
        channelTitle: 'Ed Sheeran',
        thumbnails: {
          medium: {
            url: 'https://i.ytimg.com/vi/JGwWNGJdvx8/mqdefault.jpg',
            width: 320,
            height: 180
          }
        },
        publishedAt: '2017-01-30T00:00:00Z'
      }
    },
    {
      id: { videoId: '5sMKX22BHeE' },
      snippet: {
        title: 'Bad Guy - Billie Eilish',
        channelTitle: 'Billie Eilish',
        thumbnails: {
          medium: {
            url: 'https://i.ytimg.com/vi/5sMKX22BHeE/mqdefault.jpg',
            width: 320,
            height: 180
          }
        },
        publishedAt: '2019-03-29T00:00:00Z'
      }
    },
    {
      id: { videoId: 'Z9X4k9JdHic' },
      snippet: {
        title: 'Blinding Lights - The Weeknd',
        channelTitle: 'The Weeknd',
        thumbnails: {
          medium: {
            url: 'https://i.ytimg.com/vi/Z9X4k9JdHic/mqdefault.jpg',
            width: 320,
            height: 180
          }
        },
        publishedAt: '2020-01-21T00:00:00Z'
      }
    },
    {
      id: { videoId: 'tFEW5e1uT3Y' },
      snippet: {
        title: 'Flowers - Miley Cyrus',
        channelTitle: 'Miley Cyrus',
        thumbnails: {
          medium: {
            url: 'https://i.ytimg.com/vi/tFEW5e1uT3Y/mqdefault.jpg',
            width: 320,
            height: 180
          }
        },
        publishedAt: '2023-01-12T00:00:00Z'
      }
    },
    {
      id: { videoId: 'k2qgadSvNyU' },
      snippet: {
        title: 'As It Was - Harry Styles',
        channelTitle: 'Harry Styles',
        thumbnails: {
          medium: {
            url: 'https://i.ytimg.com/vi/k2qgadSvNyU/mqdefault.jpg',
            width: 320,
            height: 180
          }
        },
        publishedAt: '2022-03-31T00:00:00Z'
      }
    },
    {
      id: { videoId: '2Vv-BfVoq4g' },
      snippet: {
        title: 'Perfect - Ed Sheeran',
        channelTitle: 'Ed Sheeran',
        thumbnails: {
          medium: {
            url: 'https://i.ytimg.com/vi/2Vv-BfVoq4g/mqdefault.jpg',
            width: 320,
            height: 180
          }
        },
        publishedAt: '2017-11-09T00:00:00Z'
      }
    }
  ];
  
  // Filter demo results based on query (simulate search)
  const filteredVideos = allDemoVideos.filter(video => {
    const title = video.snippet.title.toLowerCase();
    const channel = video.snippet.channelTitle.toLowerCase();
    
    return queryLower === '' || 
           title.includes(queryLower) || 
           channel.includes(queryLower) ||
           queryLower.includes('music') ||
           queryLower.includes('song');
  });
  
  // Return at least 3 results, or all filtered results
  return filteredVideos.length > 0 ? filteredVideos.slice(0, 6) : allDemoVideos.slice(0, 3);
}