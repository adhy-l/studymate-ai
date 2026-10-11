const path = require('path');
const pdfParseModule = require('pdf-parse');
const { DocumentModel } = require('../models/documentModel');
const { cleanText, chunkText } = require('../utils/textUtils');
const SessionService = require('./sessionService');

class DocumentService {
  /**
   * Extract text from buffer based on file extension / mimetype
   * @param {Buffer} buffer
   * @param {string} originalName
   * @param {string} mimeType
   * @returns {Promise<string>}
   */
  static async extractText(buffer, originalName, mimeType) {
    const ext = path.extname(originalName).toLowerCase();

    if (ext === '.txt' || mimeType === 'text/plain') {
      return buffer.toString('utf-8');
    }

    if (ext === '.pdf' || mimeType === 'application/pdf') {
      return DocumentService.extractFromPdf(buffer);
    }

    throw new Error('Tipe file tidak didukung. Harap unggah file berformat PDF atau TXT.');
  }

  /**
   * Extract text from PDF buffer
   * @param {Buffer} buffer
   * @returns {Promise<string>}
   */
  static async extractFromPdf(buffer) {
    try {
      // Check pdf-parse v2 class structure
      if (pdfParseModule.PDFParse) {
        const parser = new pdfParseModule.PDFParse({ data: buffer });
        const result = await parser.getText();
        if (typeof parser.destroy === 'function') {
          await parser.destroy();
        }
        return result && result.text ? result.text : '';
      }

      // Check legacy / function structure
      if (typeof pdfParseModule === 'function') {
        const data = await pdfParseModule(buffer);
        return data && data.text ? data.text : '';
      }

      throw new Error('Modul pdf-parse tidak dapat diinisialisasi.');
    } catch (err) {
      throw new Error(`Gagal membaca file PDF: ${err.message}. Pastikan file bukan hasil scan gambar murni tanpa teks.`);
    }
  }

  /**
   * Process and save uploaded document
   * @param {Object} params
   * @param {Object} params.file Multer file object
   * @param {string} [params.sessionId]
   * @returns {Promise<Object>}
   */
  static async processDocument({ file, sessionId = null }) {
    if (!file || !file.buffer) {
      throw new Error('File tidak ditemukan dalam request.');
    }

    const rawText = await DocumentService.extractText(file.buffer, file.originalname, file.mimetype);
    const cleanedText = cleanText(rawText);

    if (!cleanedText || cleanedText.length === 0) {
      throw new Error('Dokumen tidak memiliki teks yang dapat diekstrak atau kosong. Pastikan PDF memiliki teks digital (bukan hasil scan gambar saja).');
    }

    // Split text into retrieval chunks (chunk size 800 chars, 150 overlap)
    const chunks = chunkText(cleanedText, 800, 150);

    const doc = DocumentModel.create({
      fileName: file.originalname,
      fileType: path.extname(file.originalname).replace('.', '').toLowerCase() || 'txt',
      fileSize: file.size,
      rawText: cleanedText,
      chunks,
      sessionId
    });

    if (sessionId) {
      SessionService.attachDocument(sessionId, doc.documentId);
    }

    return doc;
  }

  /**
   * Get document by ID
   * @param {string} documentId
   * @returns {Object|null}
   */
  static getDocument(documentId) {
    return DocumentModel.findById(documentId);
  }
}

module.exports = DocumentService;
