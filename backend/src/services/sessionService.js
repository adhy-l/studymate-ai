const { SessionModel } = require('../models/sessionModel');

class SessionService {
  /**
   * Create a new session
   * @param {Object} settings
   * @returns {Object}
   */
  static createSession(settings = {}) {
    return SessionModel.create(settings);
  }

  /**
   * Get session by ID
   * @param {string} sessionId
   * @returns {Object|null}
   */
  static getSession(sessionId) {
    return SessionModel.findById(sessionId);
  }

  /**
   * Update settings for an active session
   * @param {string} sessionId
   * @param {Object} newSettings
   * @returns {Object|null}
   */
  static updateSettings(sessionId, newSettings) {
    return SessionModel.updateSettings(sessionId, newSettings);
  }

  /**
   * Delete session
   * @param {string} sessionId
   * @returns {boolean}
   */
  static deleteSession(sessionId) {
    return SessionModel.delete(sessionId);
  }

  /**
   * Add message to session
   * @param {string} sessionId
   * @param {string} role
   * @param {string} content
   * @param {Object} meta
   */
  static addMessage(sessionId, role, content, meta = {}) {
    return SessionModel.addMessage(sessionId, role, content, meta);
  }

  /**
   * Attach document to session
   * @param {string} sessionId
   * @param {string} documentId
   */
  static attachDocument(sessionId, documentId) {
    return SessionModel.attachDocument(sessionId, documentId);
  }
}

module.exports = SessionService;
