const mongoose = require('mongoose');

const sourceSchema = new mongoose.Schema({
  title: String,
  url: String,
  description: String,
});

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  webSearchUsed: { type: Boolean, default: false },
  sources: [sourceSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
