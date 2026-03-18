const axios = require('axios');

const SEARCH_KEYWORDS = [
  'today', 'latest', 'current', 'news', 'price', 'weather',
  'who is', '2024', '2025', '2026',
];

const shouldSearch = (text) => {
  const lower = text.toLowerCase();
  return SEARCH_KEYWORDS.some((kw) => lower.includes(kw));
};

const serpstackSearch = async (query) => {
  try {
    const response = await axios.get('http://api.serpstack.com/search', {
      params: { 
        access_key: process.env.SERPSTACK_API_KEY,
        query: query,
        num: 5
      }
    });
    
    const results = response.data?.organic_results || [];
    return results.slice(0, 5).map((r) => ({
      title: r.title || '',
      url: r.url || r.link || '',
      description: r.snippet || '',
    }));
  } catch (err) {
    console.error('SerpStack Search error:', err.message);
    return [];
  }
};

module.exports = { shouldSearch, serpstackSearch };
