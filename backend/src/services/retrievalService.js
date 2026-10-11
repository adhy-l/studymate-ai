const DocumentService = require('./documentService');
const GeminiService = require('./geminiService');
const { calculateRelevanceScore } = require('../utils/textUtils');

class RetrievalService {
  /**
   * Find top-K most relevant chunks for a question
   * @param {Object} document
   * @param {string} query
   * @param {number} topK
   * @returns {Array<{ chunkIndex: number, text: string, score: number }>}
   */
  static findRelevantChunks(document, query, topK = 3) {
    if (!document || !document.chunks || document.chunks.length === 0) {
      return [];
    }

    const scoredChunks = document.chunks.map((chunk) => {
      const score = calculateRelevanceScore(query, chunk.text);
      return {
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
        score
      };
    });

    // Sort descending by score
    scoredChunks.sort((a, b) => b.score - a.score);

    return scoredChunks.slice(0, topK);
  }

  /**
   * Answer a question grounded in a specific document
   * @param {Object} params
   * @param {string} params.documentId
   * @param {string} params.question
   * @param {Object} [params.session]
   * @returns {Promise<Object>}
   */
  static async askDocument({ documentId, question, session = null }) {
    const document = DocumentService.getDocument(documentId);
    if (!document) {
      throw new Error('Dokumen tidak ditemukan.');
    }

    let relevantChunks = RetrievalService.findRelevantChunks(document, question, 3);
    const topScore = relevantChunks.length > 0 ? relevantChunks[0].score : 0;

    // For short documents, let the model judge broad questions using the full
    // document instead of rejecting them solely because no query words match.
    // The model still receives strict grounding instructions below.
    if (topScore === 0) {
      const maxFullDocumentChars = 12000;
      if (document.rawText.length <= maxFullDocumentChars) {
        relevantChunks = [{
          chunkIndex: 0,
          text: document.rawText,
          score: 0
        }];
      } else {
        return {
          answer: 'Maaf, informasi yang Anda tanyakan tidak ditemukan atau tidak tersedia dalam dokumen materi yang diunggah. Silakan ajukan pertanyaan lain yang relevan dengan topik dokumen.',
          isGrounded: false,
          sources: []
        };
      }
    }

    const contextText = relevantChunks.map((c, i) => `[Kutipan ${i + 1}]:\n${c.text}`).join('\n\n');

    const systemInstruction =
      'Anda adalah StudyMate AI, asisten tutor yang menjawab pertanyaan siswa secara akurat.\n' +
      'ATURAN KETAT:\n' +
      '1. Jawablah HANYA berdasarkan konteks kutipan dokumen yang diberikan di bawah.\n' +
      '2. Jangan mengarang informasi di luar dokumen.\n' +
      '3. Jika informasi yang ditanyakan tidak tercantum dalam kutipan materi, nyatakan dengan jujur dan jelas bahwa informasi tersebut tidak tersedia dalam dokumen.\n' +
      '4. Gunakan bahasa Indonesia yang jelas, ramah, dan mendidik.';

    const prompt =
      `Materi Dokumen (${document.fileName}):\n${contextText}\n\n` +
      `Pertanyaan Siswa: ${question}\n\n` +
      `Jawaban Berdasarkan Dokumen:`;

    const answer = await GeminiService.generateText({
      prompt,
      systemInstruction,
      temperature: 0.3
    });

    return {
      answer,
      isGrounded: true,
      sources: relevantChunks.map((c) => ({
        chunkIndex: c.chunkIndex,
        preview: c.text.slice(0, 120) + '...',
        relevanceScore: Math.round(c.score * 10) / 10
      }))
    };
  }

  /**
   * Summarize a document
   * @param {Object} params
   * @param {string} params.documentId
   * @param {string} [params.length='standar'] 'ringkas' | 'standar' | 'detail'
   * @returns {Promise<Object>}
   */
  static async summarizeDocument({ documentId, length = 'standar' }) {
    const document = DocumentService.getDocument(documentId);
    if (!document) {
      throw new Error('Dokumen tidak ditemukan.');
    }

    // Limit text sample if document is enormous (e.g. up to 12,000 characters for prompt)
    const textToSummarize = document.rawText.slice(0, 12000);

    let lengthInstruction = '';
    switch (length) {
      case 'ringkas':
        lengthInstruction = 'Buat ringkasan yang sangat padat (3-5 poin utama).';
        break;
      case 'detail':
        lengthInstruction = 'Buat ringkasan komprehensif mencakup latar belakang, detail konsep utama, implementasi, dan kesimpulan.';
        break;
      case 'standar':
      default:
        lengthInstruction = 'Buat ringkasan terstruktur dengan pengenalan singkat, poin-poin materi penting, dan kesimpulan.';
        break;
    }

    const systemInstruction =
      'Anda adalah StudyMate AI, pakar perangkum materi pembelajaran.\n' +
      'Buat ringkasan dokumen yang terstruktur, rapi, dan mudah dipahami siswa.\n' +
      'Format output:\n' +
      '# Ringkasan Materi: [Nama Dokumen]\n' +
      '## 1. Intisari Utama\n' +
      '## 2. Poin-Poin Penting\n' +
      '## 3. Kesimpulan & Insight Pembelajaran';

    const prompt =
      `Dokumen: ${document.fileName}\n` +
      `Instruksi panjang: ${lengthInstruction}\n\n` +
      `Isi Dokumen:\n${textToSummarize}\n\n` +
      `Hasil Ringkasan:`;

    const summary = await GeminiService.generateText({
      prompt,
      systemInstruction,
      temperature: 0.4
    });

    return {
      documentId,
      fileName: document.fileName,
      length,
      summary,
      totalCharactersProcessed: textToSummarize.length
    };
  }
}

module.exports = RetrievalService;
