const GeminiService = require('./geminiService');
const { DEFAULT_SETTINGS } = require('../models/sessionModel');

class TutorService {
  /**
   * Build dynamic system instruction based on session settings
   * @param {Object} settings
   * @returns {string}
   */
  static buildSystemInstruction(settings = DEFAULT_SETTINGS) {
    const { skillLevel, explanationDepth, learningMode } = settings;

    let instruction = `Anda adalah StudyMate AI, seorang asisten tutor pembelajaran interaktif yang ramah, adaptif, dan berdedikasi untuk membantu siswa memahami materi dengan mendalam.\n\n`;

    // Persona by Skill Level
    switch (skillLevel) {
      case 'pemula':
        instruction += `Tingkat Siswa: PEMULA. Gunakan bahasa yang mudah dipahami, gunakan analogi kehidupan sehari-hari, dan jelaskan istilah teknis secara bertahap tanpa asumsi siswa sudah menguasainya.\n`;
        break;
      case 'mahir':
        instruction += `Tingkat Siswa: MAHIR. Gunakan terminologi teknis yang tepat, diskusikan konsep mendalam, arsitektur, efisiensi, serta trade-off profesional.\n`;
        break;
      case 'menengah':
      default:
        instruction += `Tingkat Siswa: MENENGAH. Berikan penjelasan terstruktur dengan kombinasi teori dan contoh praktis yang relevan.\n`;
        break;
    }

    // Explanation Depth
    switch (explanationDepth) {
      case 'ringkas':
        instruction += `Kedalaman: RINGKAS. Langsung ke inti poin penting, hindari bertele-tele, gunakan poin-poin singkat.\n`;
        break;
      case 'mendalam':
        instruction += `Kedalaman: MENDALAM. Berikan analisis menyeluruh, telaah latar belakang, implikasi teknis, dan nuansa konsep secara detail.\n`;
        break;
      case 'standar':
      default:
        instruction += `Kedalaman: STANDAR. Jelaskan secara jelas, mencakup konsep utama dan contoh ilustratif.\n`;
        break;
    }

    // Learning Mode
    switch (learningMode) {
      case 'sokratik':
        instruction += `Mode Belajar: SOKRATIK. Jangan langsung memberikan seluruh jawaban akhir secara cuma-cuma. Bimbing siswa dengan pertanyaan pemantik (reflective/guiding questions) agar siswa menemukan pemahamannya sendiri.\n`;
        break;
      case 'konseptual':
        instruction += `Mode Belajar: KONSEPTUAL. Tekankan pada prinsip dasar "mengapa" suatu hal bekerja seperti itu dan hubungan antarkonsep.\n`;
        break;
      case 'praktis':
        instruction += `Mode Belajar: PRAKTIS. Berikan contoh penggunaan nyata, studi kasus, dan langkah-langkah implementasi praktis.\n`;
        break;
      case 'tutor':
      default:
        instruction += `Mode Belajar: TUTOR INTERAKTIF. Bersikaplah suportif, apresiatif terhadap kemajuan siswa, dan ajak berdiskusi.\n`;
        break;
    }

    instruction += `\nSelalu gunakan bahasa Indonesia yang baik, sopan, dan memotivasi siswa untuk terus belajar.`;
    return instruction;
  }

  /**
   * Format conversation history into prompt context
   * @param {Array} history
   * @returns {string}
   */
  static formatHistoryContext(history = []) {
    if (!history || history.length === 0) return '';

    const formatted = history.map((msg) => {
      const speaker = msg.role === 'user' ? 'Pengguna' : 'Tutor AI';
      return `${speaker}: ${msg.content}`;
    }).join('\n');

    return `Riwayat percakapan sebelumnya:\n${formatted}\n\n`;
  }

  /**
   * Generate tutor response for chat
   * @param {Object} params
   * @param {string} params.message
   * @param {Object} [params.session]
   * @param {Object} [params.customSettings]
   * @returns {Promise<string>}
   */
  static async getChatResponse({ message, session = null, customSettings = {} }) {
    const settings = {
      ...DEFAULT_SETTINGS,
      ...(session ? session.settings : {}),
      ...customSettings
    };

    const systemInstruction = TutorService.buildSystemInstruction(settings);

    let prompt = '';
    if (session && session.chatHistory && session.chatHistory.length > 0) {
      prompt += TutorService.formatHistoryContext(session.chatHistory);
    }
    prompt += `Pengguna: ${message}\nTutor AI:`;

    const response = await GeminiService.generateText({
      prompt,
      systemInstruction,
      temperature: 0.7
    });

    return response;
  }
}

module.exports = TutorService;
