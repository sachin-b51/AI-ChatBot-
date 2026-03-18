const Message = require('../models/Message.model');

const getMemory = async (chatId, limit = 20) => {
  const messages = await Message.find({ chatId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return messages.reverse().map((m) => ({ role: m.role, content: m.content }));
};

module.exports = { getMemory };
