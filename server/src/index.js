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

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} [${req.method}] ${req.url}`);
  next();
});

// Middleware
app.use(cors({
  origin: true, // Reflect request origin
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-app-secret', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Health check (no guard)
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/', (req, res) => res.send('AI ChatBot Backend is Running!'));

// All API routes behind the secret guard
app.use('/api', apiGuard, chatRoutes);
app.use('/api/memories', apiGuard, require('./routes/memory.routes'));
app.use('/api/search', apiGuard, require('./routes/search.routes'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
