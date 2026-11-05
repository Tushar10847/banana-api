/**
 * ==============================================================================
 * CIS046-3 Software For Enterprise - Main Backend Server
 * 
 * Themes Addressed:
 * 1. Version Control: Modular architecture separating DB, Services, Routes, Controllers
 * 2. Event-Driven Programming: Asynchronous Event Loop, Express Middleware Pipeline
 * 3. Interoperability: Marc Conrad Banana REST API Web Service integration
 * 4. Virtual Identity: JWT Tokens, bcrypt password hashing, dynamic profiles
 * ==============================================================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase, db } = require('./database/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const gameRoutes = require('./routes/gameRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security and CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/game', gameRoutes);

// Health & Diagnostic Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Banana Game Enterprise API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: db.isUsingFallback() ? 'Resilient Fallback Storage' : 'MySQL Database',
    interoperability: {
      target: 'Marc Conrad Banana API',
      endpoint: 'https://marcconrad.com/uob/banana/api.php?out=json'
    }
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR EVENT]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.'
  });
});

// Start Server and initialize database connection pool
async function bootstrap() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🍌 The Banana Game Server is running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🏆 Dynamic Leaderboard: http://localhost:${PORT}/api/leaderboard`);
    console.log(`=======================================================`);
  });
}

bootstrap();
