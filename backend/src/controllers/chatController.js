const TutorService = require('../services/tutorService');
const SessionService = require('../services/sessionService');
const { successResponse, errorResponse } = require('../utils/responseUtils');

class ChatController {
  /**
   * POST /api/chat - Interact with AI Tutor
   */
  static async chat(req, res, next) {
    try {
      const { sessionId, message, settings } = req.body;

      if (!message || typeof message !== 'string' || message.trim() === '') {
        return errorResponse(res, 400, 'Pesan chat wajib diisi dan tidak boleh kosong.');
      }

      let session = null;
      if (sessionId) {
        session = SessionService.getSession(sessionId);
        if (!session) {
          return errorResponse(res, 404, 'Sesi tidak ditemukan atau telah kedaluwarsa. Silakan buat sesi baru.');
        }

        // Add user message to session history
        SessionService.addMessage(sessionId, 'user', message.trim());
      }

      // Generate AI tutor response
      const tutorResponse = await TutorService.getChatResponse({
        message: message.trim(),
        session,
        customSettings: settings
      });

      // Save tutor message to history if session is active
      if (sessionId) {
        SessionService.addMessage(sessionId, 'model', tutorResponse);
      }

      return successResponse(res, 200, 'Respons tutor berhasil dibuat', {
        reply: tutorResponse,
        sessionId: sessionId || null,
        activeSettings: session ? session.settings : settings || null
      });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = ChatController;
