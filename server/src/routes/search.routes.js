const express = require('express');
const router = express.Router();
const Message = require('../models/Message.model');
const { createEmbedding } = require('../services/openai.service');

// Cosine similarity helper
const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    mA += vecA[i] * vecA[i];
    mB += vecB[i] * vecB[i];
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  return dotProduct / (mA * mB);
};

// GET /api/search?q=...
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    // 1. Embed the query
    const queryEmbedding = await createEmbedding(q);
    if (!queryEmbedding || queryEmbedding.length === 0) {
      // Fallback to keyword search if embedding fails
      const results = await Message.find({ content: { $regex: q, $options: 'i' } }).limit(10).lean();
      return res.json(results);
    }

    // 2. Fetch all messages with embeddings (in a real app, use MongoDB Vector Search)
    const messages = await Message.find({ embedding: { $exists: true, $ne: [] } }).lean();

    // 3. Rank by similarity
    const results = messages
      .map(msg => ({
        ...msg,
        similarity: cosineSimilarity(queryEmbedding, msg.embedding)
      }))
      .filter(msg => msg.similarity > 0.3) // Threshold
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);

    // Remove embeddings from response to keep it light
    results.forEach(r => delete r.embedding);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
