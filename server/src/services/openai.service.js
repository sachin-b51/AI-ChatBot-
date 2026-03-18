const OpenAI = require('openai');
const { CLAUDE_STYLE_FULL } = require('../lib/claude-style');
const { CHAT_FORMAT_PROMPT } = require('../lib/chat-format-prompt');
const { SYSTEM_PROMPTS, detectPromptType } = require('../lib/prompts');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const buildSystemPrompt = (userMessage, sources = [], memories = []) => {
  const promptType = detectPromptType(userMessage);
  const domainPrompt = SYSTEM_PROMPTS[promptType];
  
  let prompt = [CHAT_FORMAT_PROMPT, CLAUDE_STYLE_FULL, domainPrompt].join('\n\n---\n\n');

  if (memories.length > 0) {
    const memText = memories.map(m => `- ${m.content}`).join('\n');
    prompt += `\n\n### PERSISTENT USER MEMORIES (What you know about the user):\n${memText}\n\nUse this context to personalize your response if relevant.`;
  }

  if (sources.length > 0) {
    const srcText = sources
      .map(
        (s, i) =>
          `[${i + 1}] ${s.title}\nURL: ${s.url}\n${s.description}`
      )
      .join('\n\n');
    prompt += `\n\nThe following web search results may help answer the user's question:\n\n${srcText}\n\nUse these results to give an up-to-date answer, and cite sources where appropriate.`;
  }

  return prompt;
};

/**
 * Streams OpenAI response tokens to an Express response object.
 * Resolves with the full assistant text when done.
 */
const streamOpenAI = async (res, history, userMessage, sources = [], memories = []) => {
  const systemPrompt = buildSystemPrompt(userMessage, sources, memories);

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessage },
  ];

  // SSE headers already set by controller
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    stream: true,
    temperature: 0.7,
    messages,
  });

  let fullContent = '';

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content || '';
    if (token) {
      fullContent += token;
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  return fullContent;
};

/**
 * Generates an embedding for the given text.
 */
const createEmbedding = async (text) => {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });
    return response.data[0].embedding;
  } catch (err) {
    console.error('OpenAI Embedding Error:', err.message);
    return [];
  }
};

module.exports = { streamOpenAI, createEmbedding };
