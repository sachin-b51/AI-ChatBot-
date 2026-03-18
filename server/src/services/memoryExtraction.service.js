const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const extractFacts = async (messageContent) => {
  try {
    const prompt = `
      Extract key facts about the user from the following message. 
      Only extract facts that are persistent (e.g., name, location, job, preferences, hobbies).
      Return each fact as a short, concise sentence.
      If no facts are found, return "NONE".
      
      Message: "${messageContent}"
      
      Facts:
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const content = response.choices[0].message.content.trim();
    if (content === "NONE") return [];
    
    return content.split('\n').map(f => f.replace(/^- /, '').trim()).filter(f => f.length > 0);
  } catch (err) {
    console.error('Fact Extraction Error:', err.message);
    return [];
  }
};

module.exports = { extractFacts };
