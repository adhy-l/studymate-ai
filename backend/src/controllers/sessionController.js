const SessionService = require('../services/sessionService');
const { successResponse, errorResponse } = require('../utils/responseUtils');

class SessionController {
  /**
   * POST /api/sessions - Create a new session
   */
  static createSession(req, res, next) {
    try {
      const { settings } = req.body || {};
      const session = SessionService.createSession(settings);

      return successResponse(res, 201, 'Sesi belajar berhasil dibuat', {
        sessionId: session.sessionId,
        settings: session.settings,
        createdAt: session.createdAt
      });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/sessions/:sessionId - Get active session context
   */
  static getSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const session = SessionService.getSession(sessionId);

      if (!session) {
        return errorResponse(res, 404, 'Sesi tidak ditemukan atau telah kedaluwarsa');
      }

      return successResponse(res, 200, 'Data sesi berhasil diambil', {
        sessionId: session.sessionId,
        settings: session.settings,
        totalMessages: session.chatHistory.length,
        chatHistory: session.chatHistory,
        documentIds: session.documentIds,
        quizIds: session.quizIds,
        createdAt: session.createdAt,
        lastActivityAt: session.lastActivityAt
      });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * DELETE /api/sessions/:sessionId - Terminate session and clean up
   */
  static deleteSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const session = SessionService.getSession(sessionId);

      if (!session) {
        return errorResponse(res, 404, 'Sesi tidak ditemukan atau sudah tidak aktif');
      }

      SessionService.deleteSession(sessionId);
      return successResponse(res, 200, 'Sesi berhasil diakhiri dan data dibersihkan');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PATCH /api/sessions/:sessionId/settings - Update tutor settings
   */
  static updateSettings(req, res, next) {
    try {
      const { sessionId } = req.params;
      const newSettings = req.body.settings || req.body;

      if (!newSettings || Object.keys(newSettings).length === 0) {
        return errorResponse(res, 400, 'Data pengaturan tutor tidak boleh kosong');
      }

      const session = SessionService.getSession(sessionId);
      if (!session) {
        return errorResponse(res, 404, 'Sesi tidak ditemukan atau telah kedaluwarsa');
      }

      const updatedSession = SessionService.updateSettings(sessionId, newSettings);

      return successResponse(res, 200, 'Pengaturan tutor berhasil diperbarui', {
        sessionId: updatedSession.sessionId,
        settings: updatedSession.settings
      });
    } catch (err) {
      // Validation error caught
      return errorResponse(res, 400, err.message);
    }
  }
}

module.exports = SessionController;
