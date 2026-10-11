const dotenv = require('dotenv');

dotenv.config();

const config = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5,
  MAX_FILE_SIZE: (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5) * 1024 * 1024,
  SESSION_TTL_HOURS: parseInt(process.env.SESSION_TTL_HOURS, 10) || 2,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};

module.exports = config;
