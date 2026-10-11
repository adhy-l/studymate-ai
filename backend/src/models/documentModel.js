const { randomUUID } = require('crypto');

// In-memory store for uploaded documents
const documentsStore = new Map();

class DocumentModel {
  /**
   * Create and store document
   * @param {Object} docData
   * @returns {Object}
   */
  static create({ fileName, fileType, fileSize, rawText, chunks = [], sessionId = null }) {
    const documentId = randomUUID();
    const now = new Date();

    const document = {
      documentId,
      fileName,
      fileType,
      fileSize,
      totalCharacters: rawText ? rawText.length : 0,
      totalChunks: chunks.length,
      rawText,
      chunks: chunks.map((c, idx) => ({
        id: randomUUID(),
        chunkIndex: c.chunkIndex ?? idx,
        text: c.text
      })),
      sessionId,
      status: 'ready',
      createdAt: now.toISOString()
    };

    documentsStore.set(documentId, document);
    return document;
  }

  /**
   * Find document by ID
   * @param {string} documentId
   * @returns {Object|null}
   */
  static findById(documentId) {
    if (!documentId) return null;
    return documentsStore.get(documentId) || null;
  }

  /**
   * Delete document by ID
   * @param {string} documentId
   * @returns {boolean}
   */
  static delete(documentId) {
    return documentsStore.delete(documentId);
  }

  /**
   * List documents optionally filtered by sessionId
   * @param {string} sessionId
   * @returns {Array}
   */
  static list(sessionId = null) {
    const all = Array.from(documentsStore.values());
    if (sessionId) {
      return all.filter((d) => d.sessionId === sessionId);
    }
    return all;
  }

  static getStoreSize() {
    return documentsStore.size;
  }

  static _resetForTesting() {
    documentsStore.clear();
  }
}

module.exports = {
  DocumentModel
};
