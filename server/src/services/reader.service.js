const axios = require('axios');
const cheerio = require('cheerio');
const { convert } = require('html-to-text');

/**
 * Fetches and extracts clean text from a URL.
 */
exports.readUrl = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    // Remove scripts, styles, etc.
    $('script, style, nav, footer, header').remove();

    const title = $('title').text().trim();
    const html = $('body').html();

    const text = convert(html, {
      wordwrap: 130,
      selectors: [
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'img', format: 'skip' }
      ]
    });

    return {
      title,
      content: text.slice(0, 15000), // Limit to avoid context overflow
      url
    };
  } catch (err) {
    console.error(`Read URL error (${url}):`, err.message);
    throw new Error(`Failed to read the webpage: ${err.message}`);
  }
};
