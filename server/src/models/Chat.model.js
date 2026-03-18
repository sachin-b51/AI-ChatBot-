const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  title: { type: String, default: 'New Chat' },
  messageCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Chat', chatSchema);
