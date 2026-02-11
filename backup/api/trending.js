// api/trending.js - Vercel Serverless Function
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
    
    // If no API key is configured, return demo data
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
      return res.status(200).json({
        items: getDemoTrendingData(),
        demo: true,
        message: "YouTube API key not configured. Using demo data."
      });
    }

    // YouTube API parameters for trending Western music
    const params = new URLSearchParams({
      part: 'snippet',
      chart: 'mostPopular',
      regionCode: 'US',
      maxResults: '12',
      videoCategoryId: '10', // Music category
      key: YOUTUBE_API_KEY
    });

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?${params}`;
    
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
        items: getDemoTrendingData(),
        demo: true,
        error: errorData.error?.message || 'YouTube API error',
        message: "Using demo data due to API error."
      });
    }

    const data = await response.json();
    
    // Cache response for 5 minutes (Vercel edge caching)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Trending API Error:', error);
    
    // Fallback to demo data
    return res.status(200).json({
      items: getDemoTrendingData(),
      demo: true,
      error: error.message,
      message: "Using demo data due to server error."
    });
  }
}

// Demo data for when API key is not configured
function getDemoTrendingData() {
  return [
    {
      id: 'tFEW5e1uT3Y',
      snippet: {
        title: 'Flowers - Miley Cyrus',
        channelTitle: 'Miley Cyrus',
        thumbnails: {
          medium: {
            url: 'https://i.ytimg.com/vi/tFEW5e1uT3Y/mqdefault.jpg',
            width: 320,
            height: 180
          },
          high: {
            url: 'https://i.ytimg.com/vi/tFEW5e1uT3Y/hqdefault.jpg',
            width: 480,
            height: 360
          }
        },
        publishedAt: '2023-01-12T00:00:00Z'
      }
    },
    {
      id: 'k2qgadSvNyU',
      snippet: {
        title: 'As It Was - Harry Styles',
        channelTitle: 'Harry Styles',
        thumbnails: {
          medium: {
            url: 'https://i.ytimg.com/vi/k2qgadSvNyU/mqdefault.jpg',
            width: 320,
            height: 180
          },
          high: {
            url: 'https://i.ytimg.com/vi/k2qgadSvNyU/hqdefault.jpg',
            width: 480,
            height: 360
          }
        },
        publishedAt: '2022-03-31T00:00:00Z'
      }
    },
    {
      id: 'b1kbLwvqugk',
      snippet: {
        title: 'Anti-Hero - Taylor Swift',
        channelTitle: 'Taylor Swift',
        thumbnails: {
          medium: {
            url: 'https://i.ytimg.com/vi/b1kbLwvqugk/mqdefault.jpg',
            width: 320,
            height: 180
          },
          high: {
            url: 'https://i.ytimg.com/vi/b1kbLwvqugk/hqdefault.jpg',
            width: 480,
            height: 360
          }
        },
        publishedAt: '2022-10-21T00:00:00Z'
      }
    },
    {
      id: 'JGwWNGJdvx8',
      snippet: {
        title: 'Shape of You - Ed Sheeran',
        channelTitle: 'Ed Sheeran',
        thumbnails: {
          medium: {
            url: 'https://i.ytimg.com/vi/JGwWNGJdvx8/mqdefault.jpg',
            width: 320,
            height: 180
          },
          high: {
            url: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
            width: 480,
            height: 360
          }
        },
        publishedAt: '2017-01-30T00:00:00Z'
      }
    },
    {
      id: '5sMKX22BHeE',
      snippet: {
        title: 'Bad Guy - Billie Eilish',
        channelTitle: 'Billie Eilish',
        thumbnails: {
          medium: {
            url: 'https://i.ytimg.com/vi/5sMKX22BHeE/mqdefault.jpg',
            width: 320,
            height: 180
          },
          high: {
            url: 'https://i.ytimg.com/vi/5sMKX22BHeE/hqdefault.jpg',
            width: 480,
            height: 360
          }
        },
        publishedAt: '2019-03-29T00:00:00Z'
      }
    },
    {
      id: 'Z9X4k9JdHic',
      snippet: {
        title: 'Blinding Lights - The Weeknd',
        channelTitle: 'The Weeknd',
        thumbnails: {
          medium: {
            url: 'https://i.ytimg.com/vi/Z9X4k9JdHic/mqdefault.jpg',
            width: 320,
            height: 180
          },
          high: {
            url: 'https://i.ytimg.com/vi/Z9X4k9JdHic/hqdefault.jpg',
            width: 480,
            height: 360
          }
        },
        publishedAt: '2020-01-21T00:00:00Z'
      }
    },
    {
      id: '2Vv-BfVoq4g',
      snippet: {
        title: 'Perfect - Ed Sheeran',
        channelTitle: 'Ed Sheeran',
        thumbnails: {
          medium: {
            url: 'https://i.ytimg.com/vi/2Vv-BfVoq4g/mqdefault.jpg',
            width: 320,
            height: 180
          },
          high: {
            url: 'https://i.ytimg.com/vi/2Vv-BfVoq4g/hqdefault.jpg',
            width: 480,
            height: 360
          }
        },
        publishedAt: '2017-11-09T00:00:00Z'
      }
    },
    {
      id: '2aaawrO8UMM',
      snippet: {
        title: 'Levitating - Dua Lipa',
        channelTitle: 'Dua Lipa',
        thumbnails: {
          medium: {
            url: 'https://i.ytimg.com/vi/2aaawrO8UMM/mqdefault.jpg',
            width: 320,
            height: 180
          },
          high: {
            url: 'https://i.ytimg.com/vi/2aaawrO8UMM/hqdefault.jpg',
            width: 480,
            height: 360
          }
        },
        publishedAt: '2020-10-01T00:00:00Z'
      }
    }
  ];
}