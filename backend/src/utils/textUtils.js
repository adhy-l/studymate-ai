/**
 * Utility functions for text normalization, chunking, and similarity ranking.
 */

/**
 * Clean and normalize text
 * @param {string} text
 * @returns {string}
 */
const cleanText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\t\f]/g, ' ')
    .replace(/[^\S\n]+/g, ' ') // replace multiple spaces except newlines
    .replace(/\n{3,}/g, '\n\n') // replace 3+ newlines with double newline
    .trim();
};

/**
 * Split text into semantic chunks with overlap
 * @param {string} text 
 * @param {number} chunkSize Maximum characters per chunk (default 800)
 * @param {number} overlap Overlap characters between chunks (default 150)
 * @returns {Array<{ chunkIndex: number, text: string }>}
 */
const chunkText = (text, chunkSize = 800, overlap = 150) => {
  const cleaned = cleanText(text);
  if (!cleaned) return [];

  if (cleaned.length <= chunkSize) {
    return [{ chunkIndex: 0, text: cleaned }];
  }

  const chunks = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < cleaned.length) {
    let endIndex = startIndex + chunkSize;

    if (endIndex >= cleaned.length) {
      const remainingChunk = cleaned.slice(startIndex).trim();
      if (remainingChunk) {
        chunks.push({ chunkIndex, text: remainingChunk });
      }
      break;
    }

    // Try to break at paragraph, sentence or word boundary
    const nextNewline = cleaned.lastIndexOf('\n', endIndex);
    const nextPeriod = cleaned.lastIndexOf('. ', endIndex);
    const nextSpace = cleaned.lastIndexOf(' ', endIndex);

    if (nextNewline > startIndex + chunkSize / 2) {
      endIndex = nextNewline;
    } else if (nextPeriod > startIndex + chunkSize / 2) {
      endIndex = nextPeriod + 1;
    } else if (nextSpace > startIndex + chunkSize / 2) {
      endIndex = nextSpace;
    }

    const chunkContent = cleaned.slice(startIndex, endIndex).trim();
    if (chunkContent) {
      chunks.push({ chunkIndex, text: chunkContent });
      chunkIndex++;
    }

    // Advance start index with overlap
    startIndex = Math.max(endIndex - overlap, startIndex + 1);
  }

  return chunks;
};

/**
 * Tokenize text for keyword retrieval
 * @param {string} text
 * @returns {string[]}
 */
const tokenize = (text) => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2); // ignore tiny stop-tokens
};

/**
 * Calculate keyword relevance score between a query and a text chunk
 * @param {string} query
 * @param {string} chunkText
 * @returns {number} score between 0 and 1+
 */
const calculateRelevanceScore = (query, chunkText) => {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return 0;

  const chunkTokens = tokenize(chunkText);
  if (chunkTokens.length === 0) return 0;

  const chunkTokenFreq = {};
  for (const token of chunkTokens) {
    chunkTokenFreq[token] = (chunkTokenFreq[token] || 0) + 1;
  }

  let matchedScore = 0;
  const uniqueQueryTokens = new Set(queryTokens);

  for (const token of uniqueQueryTokens) {
    if (chunkTokenFreq[token]) {
      // Reward match frequency with diminishing returns (log scale / sqrt)
      matchedScore += 1 + Math.log(chunkTokenFreq[token]);
    }
  }

  // Also check if exact phrase match exists
  const lowerChunk = chunkText.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  if (lowerChunk.includes(lowerQuery)) {
    matchedScore += 5;
  }

  return matchedScore;
};

/**
 * Normalize an answer string for flexible comparison
 * @param {string} answer
 * @returns {string}
 */
const normalizeAnswer = (answer) => {
  if (!answer || typeof answer !== 'string') return '';
  return answer
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

module.exports = {
  cleanText,
  chunkText,
  tokenize,
  calculateRelevanceScore,
  normalizeAnswer
};
