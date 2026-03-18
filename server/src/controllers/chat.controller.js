const axios = require('axios');
const Chat = require('../models/Chat.model');
const Message = require('../models/Message.model');
const { getMemory } = require('../services/memory.service');
const { shouldSearch, webSearch } = require('../services/search.service');
const { streamOpenAI } = require('../services/openai.service');
const { readUrl } = require('../services/reader.service');
const { runAgent } = require('../services/agent.service');

// GET /api/chats
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find().sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/chats
exports.createChat = async (req, res) => {
  try {
    const chat = await Chat.create({});
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/chats/:id
exports.deleteChat = async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);
    await Message.deleteMany({ chatId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/chats/:id/title
exports.renameChat = async (req, res) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title, updatedAt: new Date() },
      { new: true }
    );
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/chats/:id/messages
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/chats/:id/message  — core AI pipeline
exports.sendMessage = async (req, res) => {
  const { content, webSearchEnabled = true } = req.body;
  const { id: chatId } = req.params;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    // 1. Save user message
    await Message.create({ chatId, role: 'user', content });

    let finalContent = content;

    // Detect URL and read it if found
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex);
    let urlData = null;
    
    if (urls && urls.length > 0) {
      try {
        urlData = await readUrl(urls[0]);
        finalContent = `User is asking about this webpage: ${urlData.title}\n\nURL: ${urlData.url}\n\nCONTENT:\n${urlData.content}\n\nUSER QUESTION: ${content}`;
      } catch (err) {
        console.warn('URL reading failed:', err.message);
      }
    }

    // 2. Fetch memory (last 20 messages)
    const history = await getMemory(chatId);

    // 3. Mode B — auto-detect web search need
    let sources = [];
    let webSearchUsed = false;
    if (webSearchEnabled && !urlData && shouldSearch(finalContent)) {
      sources = await webSearch(finalContent);
      webSearchUsed = sources.length > 0;
    }

    // 4. Set SSE headers and stream
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send sources metadata before streaming starts
    if (webSearchUsed) {
      res.write(`data: ${JSON.stringify({ sources })}\n\n`);
    }

    const fullContent = await streamOpenAI(res, history, content, sources);

    // 5. Save assistant message
    await Message.create({
      chatId,
      role: 'assistant',
      content: fullContent,
      webSearchUsed,
      sources: webSearchUsed ? sources : [],
    });

    // 6. Update chat metadata
    const chat = await Chat.findById(chatId);
    if (chat) {
      chat.messageCount = (chat.messageCount || 0) + 2;
      chat.updatedAt = new Date();

      // Auto-generate title on first user message
      if (chat.messageCount <= 2) {
        chat.title = content.slice(0, 60) + (content.length > 60 ? '…' : '');
      }
      await chat.save();
    }

    res.end();
  } catch (err) {
    console.error('sendMessage error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
};

// POST /api/execute — Piston API sandbox proxy
exports.executeCode = async (req, res) => {
  const { language, code } = req.body;
  if (!code) return res.status(400).json({ error: 'Code is required' });

  // Map common aliases
  const langMap = {
    'js': 'javascript',
    'py': 'python',
    'python3': 'python',
    'node': 'javascript'
  };
  const lang = langMap[language] || language || 'javascript';

  try {
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: lang,
      version: '*',
      files: [{ content: code }]
    });
    res.json(response.data);
  } catch (err) {
    console.error('Execution error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Execution failed', details: err.response?.data || err.message });
  }
};

// POST /api/chats/stateless — stateless bridging for CleanChat UI
exports.statelessMessage = async (req, res) => {
  try {
    console.log('statelessMessage request received:', req.body.messages?.length, 'messages');
    const messages = req.body.messages;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    const userMessage = messages[messages.length - 1].content;
    const history = messages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
    const { webSearchEnabled = true, agenticMode = false } = req.body;

    // --- Agentic Handoff ---
    if (agenticMode) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();
      return await runAgent(res, history, userMessage);
    }

    let finalUserMessage = userMessage;

    // Detect URL and read it if found
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = userMessage.match(urlRegex);
    let urlData = null;
    
    if (urls && urls.length > 0) {
      try {
        urlData = await readUrl(urls[0]);
        finalUserMessage = `User is asking about this webpage: ${urlData.title}\n\nURL: ${urlData.url}\n\nCONTENT:\n${urlData.content}\n\nUSER QUESTION: ${userMessage}`;
      } catch (err) {
        console.warn('URL reading failed:', err.message);
      }
    }

    // Mode B — auto-detect web search need
    let sources = [];
    let webSearchUsed = false;
    if (webSearchEnabled && !urlData && shouldSearch(userMessage)) {
      sources = await webSearch(userMessage);
      webSearchUsed = sources.length > 0;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send sources metadata before streaming starts (if search was used)
    if (webSearchUsed) {
      res.write(`data: ${JSON.stringify({ sources })}\n\n`);
    }

    await streamOpenAI(res, history, finalUserMessage, sources);
    res.end();
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
};
