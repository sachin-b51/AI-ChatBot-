const axios = require('axios');

const SEARCH_KEYWORDS = [
  'today', 'latest', 'current', 'news', 'price', 'weather',
  'who is', '2024', '2025', '2026',
];

const shouldSearch = (text) => {
  const lower = text.toLowerCase();
  return SEARCH_KEYWORDS.some((kw) => lower.includes(kw));
};

const webSearch = async (query) => {
  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: { 
        api_key: process.env.SERPAPI_KEY,
        q: query,
        engine: 'google',
        num: 5
      }
    });
    
    const results = response.data?.organic_results || [];
    return results.slice(0, 5).map((r) => ({
      title: r.title || '',
      url: r.link || '', // SerpApi uses 'link' instead of 'url'
      description: r.snippet || '',
    }));
  } catch (err) {
    console.error('SerpApi Search error:', err.message);
    return [];
  }
};

module.exports = { shouldSearch, webSearch };
