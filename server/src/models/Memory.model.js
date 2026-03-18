const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  content: { type: String, required: true },
  importance: { type: Number, default: 1 }, // 1-5 scale
  category: { type: String, default: 'general' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Memory', memorySchema);
