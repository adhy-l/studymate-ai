const DocumentService = require('../services/documentService');
const RetrievalService = require('../services/retrievalService');
const SessionService = require('../services/sessionService');
const { successResponse, errorResponse } = require('../utils/responseUtils');

class DocumentController {
  /**
   * POST /api/documents - Upload and extract text from PDF or TXT
   */
  static async uploadDocument(req, res, next) {
    try {
      if (!req.file) {
        return errorResponse(res, 400, 'File tidak ditemukan. Harap sertakan file PDF atau TXT pada form-data dengan nama field "file".');
      }

      const { sessionId } = req.body;

      if (sessionId) {
        const session = SessionService.getSession(sessionId);
        if (!session) {
          return errorResponse(res, 404, 'Sesi tidak ditemukan atau telah kedaluwarsa.');
        }
      }

      const document = await DocumentService.processDocument({
        file: req.file,
        sessionId: sessionId || null
      });

      return successResponse(res, 201, 'Dokumen berhasil diunggah dan diproses', {
        documentId: document.documentId,
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        totalCharacters: document.totalCharacters,
        totalChunks: document.totalChunks,
        status: document.status,
        sessionId: document.sessionId,
        createdAt: document.createdAt
      });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/documents/:documentId - View document processing status
   */
  static getDocumentStatus(req, res, next) {
    try {
      const { documentId } = req.params;
      const document = DocumentService.getDocument(documentId);

      if (!document) {
        return errorResponse(res, 404, 'Dokumen tidak ditemukan.');
      }

      return successResponse(res, 200, 'Status dokumen berhasil diambil', {
        documentId: document.documentId,
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        totalCharacters: document.totalCharacters,
        totalChunks: document.totalChunks,
        status: document.status,
        preview: document.rawText.slice(0, 300) + (document.rawText.length > 300 ? '...' : ''),
        createdAt: document.createdAt
      });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/documents/:documentId/ask - Ask question grounded in document
   */
  static async askDocument(req, res, next) {
    try {
      const { documentId } = req.params;
      const { question, sessionId } = req.body;

      if (!question || typeof question !== 'string' || question.trim() === '') {
        return errorResponse(res, 400, 'Pertanyaan wajib diisi.');
      }

      let session = null;
      if (sessionId) {
        session = SessionService.getSession(sessionId);
      }

      const result = await RetrievalService.askDocument({
        documentId,
        question: question.trim(),
        session
      });

      // Record in session history if session provided
      if (sessionId && session) {
        SessionService.addMessage(sessionId, 'user', `[Pertanyaan Dokumen]: ${question.trim()}`);
        SessionService.addMessage(sessionId, 'model', result.answer, {
          isGrounded: result.isGrounded,
          documentId
        });
      }

      return successResponse(res, 200, 'Pertanyaan berhasil dijawab berdasarkan dokumen', result);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/documents/:documentId/summarize - Generate summary of document
   */
  static async summarizeDocument(req, res, next) {
    try {
      const { documentId } = req.params;
      const { length = 'standar' } = req.body;

      const validLengths = ['ringkas', 'standar', 'detail'];
      if (!validLengths.includes(length)) {
        return errorResponse(res, 400, `Pilihan panjang ringkasan tidak valid. Pilihan: ${validLengths.join(', ')}`);
      }

      const summary = await RetrievalService.summarizeDocument({
        documentId,
        length
      });

      return successResponse(res, 200, 'Ringkasan dokumen berhasil dibuat', summary);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = DocumentController;
