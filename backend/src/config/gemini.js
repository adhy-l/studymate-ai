const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./env');

let genAI = null;

if (config.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
  } catch (err) {
    console.error('[Gemini Config] Error initializing GoogleGenerativeAI:', err.message);
  }
} else {
  console.warn('[Gemini Config] WARNING: GEMINI_API_KEY is not defined in environment. Fallback/mock mode will be active.');
}

const getGenerativeModel = (modelName = config.GEMINI_MODEL, systemInstruction = null) => {
  if (!genAI) {
    return null;
  }
  const options = { model: modelName };
  if (systemInstruction) {
    options.systemInstruction = systemInstruction;
  }
  return genAI.getGenerativeModel(options);
};

const isGeminiAvailable = () => {
  return Boolean(genAI && config.GEMINI_API_KEY);
};

module.exports = {
  genAI,
  getGenerativeModel,
  isGeminiAvailable,
  modelName: config.GEMINI_MODEL
};
