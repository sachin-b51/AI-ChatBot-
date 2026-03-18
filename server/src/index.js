// Vercel Deployment Trigger: 2026-03-18
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const chatRoutes = require('./routes/chat.routes');
const apiGuard = require('./middleware/apiGuard');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-app-secret'],
}));
app.use(express.json());

// Health check (no guard)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// All API routes behind the secret guard
app.use('/api', apiGuard, chatRoutes);
app.use('/api/memories', apiGuard, require('./routes/memory.routes'));
app.use('/api/search', apiGuard, require('./routes/search.routes'));

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
