const { randomUUID } = require('crypto');
const config = require('../config/env');

// In-memory store for active sessions
const sessionsStore = new Map();

const DEFAULT_SETTINGS = {
  skillLevel: 'pemula',           // 'pemula' | 'menengah' | 'mahir'
  explanationDepth: 'standar',    // 'ringkas' | 'standar' | 'mendalam'
  learningMode: 'tutor',          // 'tutor' | 'sokratik' | 'konseptual' | 'praktis'
  quizDifficulty: 'sedang',       // 'mudah' | 'sedang' | 'sulit'
  maxHints: 2                     // 1 - 5 hints
};

const VALID_OPTIONS = {
  skillLevel: ['pemula', 'menengah', 'mahir'],
  explanationDepth: ['ringkas', 'standar', 'mendalam'],
  learningMode: ['tutor', 'sokratik', 'konseptual', 'praktis'],
  quizDifficulty: ['mudah', 'sedang', 'sulit']
};

const MAX_HISTORY_LENGTH = 30;

class SessionModel {
  /**
   * Create a new session
   * @param {Object} customSettings
   * @returns {Object} created session
   */
  static create(customSettings = {}) {
    const sessionId = randomUUID();
    const now = new Date();

    const validatedSettings = SessionModel.validateAndMergeSettings(DEFAULT_SETTINGS, customSettings);

    const session = {
      sessionId,
      settings: validatedSettings,
      chatHistory: [],
      documentIds: [],
      quizIds: [],
      createdAt: now.toISOString(),
      lastActivityAt: now.toISOString()
    };

    sessionsStore.set(sessionId, session);
    return session;
  }

  /**
   * Get session by ID, returning null if expired or not found
   * @param {string} sessionId
   * @returns {Object|null}
   */
  static findById(sessionId) {
    if (!sessionId) return null;
    const session = sessionsStore.get(sessionId);
    if (!session) return null;

    // Check expiry
    const ttlMs = config.SESSION_TTL_HOURS * 60 * 60 * 1000;
    const lastActive = new Date(session.lastActivityAt).getTime();
    if (Date.now() - lastActive > ttlMs) {
      sessionsStore.delete(sessionId);
      return null;
    }

    session.lastActivityAt = new Date().toISOString();
    return session;
  }

  /**
   * Update session settings
   * @param {string} sessionId
   * @param {Object} newSettings
   * @returns {Object|null}
   */
  static updateSettings(sessionId, newSettings) {
    const session = SessionModel.findById(sessionId);
    if (!session) return null;

    session.settings = SessionModel.validateAndMergeSettings(session.settings, newSettings);
    session.lastActivityAt = new Date().toISOString();
    return session;
  }

  /**
   * Add message to chat history
   * @param {string} sessionId
   * @param {string} role 'user' | 'model'
   * @param {string} content
   * @param {Object} meta optional metadata
   */
  static addMessage(sessionId, role, content, meta = {}) {
    const session = SessionModel.findById(sessionId);
    if (!session) return null;

    const message = {
      id: randomUUID(),
      role,
      content,
      meta,
      timestamp: new Date().toISOString()
    };

    session.chatHistory.push(message);

    // Keep history length within bounds
    if (session.chatHistory.length > MAX_HISTORY_LENGTH) {
      session.chatHistory = session.chatHistory.slice(-MAX_HISTORY_LENGTH);
    }

    session.lastActivityAt = new Date().toISOString();
    return message;
  }

  /**
   * Attach a document ID to the session
   */
  static attachDocument(sessionId, documentId) {
    const session = SessionModel.findById(sessionId);
    if (session && !session.documentIds.includes(documentId)) {
      session.documentIds.push(documentId);
    }
  }

  /**
   * Delete session
   * @param {string} sessionId
   * @returns {boolean}
   */
  static delete(sessionId) {
    return sessionsStore.delete(sessionId);
  }

  /**
   * Clear expired sessions
   */
  static clearExpired() {
    const ttlMs = config.SESSION_TTL_HOURS * 60 * 60 * 1000;
    const now = Date.now();
    for (const [id, session] of sessionsStore.entries()) {
      const lastActive = new Date(session.lastActivityAt).getTime();
      if (now - lastActive > ttlMs) {
        sessionsStore.delete(id);
      }
    }
  }

  /**
   * Validate settings options
   */
  static validateAndMergeSettings(currentSettings, incomingSettings = {}) {
    const merged = { ...currentSettings };

    if (incomingSettings.skillLevel !== undefined) {
      if (!VALID_OPTIONS.skillLevel.includes(incomingSettings.skillLevel)) {
        throw new Error(`Pilihan skillLevel tidak valid. Nilai yang diperbolehkan: ${VALID_OPTIONS.skillLevel.join(', ')}`);
      }
      merged.skillLevel = incomingSettings.skillLevel;
    }

    if (incomingSettings.explanationDepth !== undefined) {
      if (!VALID_OPTIONS.explanationDepth.includes(incomingSettings.explanationDepth)) {
        throw new Error(`Pilihan explanationDepth tidak valid. Nilai yang diperbolehkan: ${VALID_OPTIONS.explanationDepth.join(', ')}`);
      }
      merged.explanationDepth = incomingSettings.explanationDepth;
    }

    if (incomingSettings.learningMode !== undefined) {
      if (!VALID_OPTIONS.learningMode.includes(incomingSettings.learningMode)) {
        throw new Error(`Pilihan learningMode tidak valid. Nilai yang diperbolehkan: ${VALID_OPTIONS.learningMode.join(', ')}`);
      }
      merged.learningMode = incomingSettings.learningMode;
    }

    if (incomingSettings.quizDifficulty !== undefined) {
      if (!VALID_OPTIONS.quizDifficulty.includes(incomingSettings.quizDifficulty)) {
        throw new Error(`Pilihan quizDifficulty tidak valid. Nilai yang diperbolehkan: ${VALID_OPTIONS.quizDifficulty.join(', ')}`);
      }
      merged.quizDifficulty = incomingSettings.quizDifficulty;
    }

    if (incomingSettings.maxHints !== undefined) {
      const parsed = parseInt(incomingSettings.maxHints, 10);
      if (isNaN(parsed) || parsed < 1 || parsed > 5) {
        throw new Error('maxHints harus berupa angka antara 1 dan 5');
      }
      merged.maxHints = parsed;
    }

    return merged;
  }

  static getStoreSize() {
    return sessionsStore.size;
  }

  static _resetForTesting() {
    sessionsStore.clear();
  }
}

module.exports = {
  SessionModel,
  DEFAULT_SETTINGS,
  VALID_OPTIONS
};
