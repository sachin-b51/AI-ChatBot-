const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory.model');

// GET /api/memories
router.get('/', async (req, res) => {
  try {
    const memories = await Memory.find().sort({ createdAt: -1 });
    res.json(memories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/memories/:id
router.patch('/:id', async (req, res) => {
  try {
    const memory = await Memory.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content, updatedAt: new Date() },
      { new: true }
    );
    res.json(memory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/memories/:id
router.delete('/:id', async (req, res) => {
  try {
    await Memory.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
