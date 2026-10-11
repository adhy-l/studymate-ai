const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/env');

const healthRoutes = require('./routes/healthRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const chatRoutes = require('./routes/chatRoutes');
const documentRoutes = require('./routes/documentRoutes');
const quizRoutes = require('./routes/quizRoutes');

const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Enable CORS
app.use(cors({
  origin: config.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging (suppressed during tests)
if (config.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Welcome route
app.get('/', (req, res) => {
  res.json({
    name: 'StudyMate AI API',
    description: 'Backend Chatbot Pembelajaran Interaktif Berbasis AI Gemini',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// API Routes Mounting
app.use('/api/health', healthRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/quizzes', quizRoutes);

// 404 Not Found Handler
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
