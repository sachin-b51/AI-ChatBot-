const { OpenAI } = require('openai');
const { webSearch } = require('./search.service');
const { readUrl } = require('./reader.service');
const axios = require('axios');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Tools available to the agent
 */
const tools = [
  {
    type: "function",
    function: {
      name: "webSearch",
      description: "Search the web for real-time information.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The search query." }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "readUrl",
      description: "Read and extract content from a specific URL.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "The URL to read." }
        },
        required: ["url"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "executeCode",
      description: "Execute Python or JavaScript code and get the output.",
      parameters: {
        type: "object",
        properties: {
          language: { type: "string", enum: ["python", "javascript"], description: "Programming language." },
          code: { type: "string", description: "The code to execute." }
        },
        required: ["language", "code"]
      }
    }
  }
];

/**
 * The core agentic loop
 */
exports.runAgent = async (res, history, userMessage) => {
  let messages = [
    { role: 'system', content: `You are an advanced AI Agent for the CleanChat platform. 
You can search the web, read urls, and execute code to solve complex tasks.

Break down big tasks into logical steps. Use tools to gather data or run computations.

DATA VISUALIZATION:
If the user asks for a chart or if data can be visualized, output a code block with the language 'chartjs' containing a valid JSON configuration.
Example:
\`\`\`chartjs
{
  "type": "bar",
  "data": {
    "labels": ["A", "B"],
    "datasets": [{"label": "Series", "data": [10, 20]}]
  },
  "options": { "plugins": { "title": { "display": true, "text": "Example" } } }
}
\`\`\`
Supported types: bar, line, pie.

Always explain your steps and findings clearly. When you have the final answer, provide it to the user.` },
    ...history,
    { role: 'user', content: userMessage }
  ];

  let iterations = 0;
  const maxIterations = 10;

  while (iterations < maxIterations) {
    iterations++;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      tools: tools,
      tool_choice: "auto",
    });

    const choice = response.choices[0];
    const { message } = choice;
    messages.push(message);

    if (message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        const { name } = toolCall.function;
        const args = JSON.parse(toolCall.function.arguments);
        
        res.write(`data: ${JSON.stringify({ status: `Calling ${name}...` })}\n\n`);

        let result;
        try {
          if (name === 'webSearch') result = await webSearch(args.query);
          else if (name === 'readUrl') result = await readUrl(args.url);
          else if (name === 'executeCode') {
            const langMap = { 'js': 'javascript', 'py': 'python', 'python3': 'python', 'node': 'javascript' };
            const lang = langMap[args.language] || args.language || 'javascript';
            const pistonRes = await axios.post('https://emkc.org/api/v2/piston/execute', {
              language: lang,
              version: '*',
              files: [{ content: args.code }]
            });
            result = pistonRes.data;
          }
        } catch (err) {
          result = { error: err.message };
        }

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: name,
          content: JSON.stringify(result)
        });
      }
    } else {
      // Final Answer
      if (message.content) {
        res.write(`data: ${JSON.stringify({ token: message.content })}\n\n`);
      }
      res.write(`data: [DONE]\n\n`);
      return;
    }
  }

  res.write(`data: ${JSON.stringify({ token: "\n\nMaximum iterations reached. Please try simplifying the task." })}\n\n`);
  res.write(`data: [DONE]\n\n`);
};
