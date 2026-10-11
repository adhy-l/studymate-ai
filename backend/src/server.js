const app = require('./app');
const config = require('./config/env');
const { isGeminiAvailable } = require('./config/gemini');
const { SessionModel } = require('./models/sessionModel');

const PORT = config.PORT;

const server = app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 StudyMate AI Backend Server is running!`);
  console.log(`🌐 Port: http://localhost:${PORT}`);
  console.log(`📦 Environment: ${config.NODE_ENV}`);
  console.log(`🤖 Gemini Model: ${config.GEMINI_MODEL}`);
  console.log(`🔑 Gemini Key Configured: ${isGeminiAvailable() ? 'YES' : 'NO (fallback mode)'}`);
  console.log(`📁 Max Upload Size: ${config.MAX_FILE_SIZE_MB}MB`);
  console.log(`⏱️  Session TTL: ${config.SESSION_TTL_HOURS} hours`);
  console.log('====================================================');
});

// Periodic session cleanup every 30 minutes
const cleanupInterval = setInterval(() => {
  try {
    SessionModel.clearExpired();
  } catch (err) {
    console.error('Error during session cleanup:', err.message);
  }
}, 30 * 60 * 1000);

// Graceful shutdown
const handleShutdown = (signal) => {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  clearInterval(cleanupInterval);
  server.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

module.exports = server;
