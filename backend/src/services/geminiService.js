const { getGenerativeModel, isGeminiAvailable, modelName: defaultModelName } = require('../config/gemini');

class GeminiService {
  /**
   * Generate text content from Gemini
   * @param {Object} options
   * @param {string} options.prompt
   * @param {string} [options.systemInstruction]
   * @param {number} [options.temperature=0.7]
   * @param {string} [options.modelName]
   * @returns {Promise<string>}
   */
  static async generateText({ prompt, systemInstruction = null, temperature = 0.7, modelName = defaultModelName }) {
    if (!isGeminiAvailable()) {
      return GeminiService.getFallbackResponse(prompt, systemInstruction);
    }

    try {
      const model = getGenerativeModel(modelName, systemInstruction);
      if (!model) {
        return GeminiService.getFallbackResponse(prompt, systemInstruction);
      }

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature
        }
      });

      const response = await result.response;
      return response.text();
    } catch (err) {
      console.error('[GeminiService] Error calling Gemini API:', err.message);
      // Fallback if API key fails or quota exceeded
      return GeminiService.getFallbackResponse(prompt, systemInstruction, err.message);
    }
  }

  /**
   * Generate structured JSON from Gemini
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  static async generateJson({ prompt, systemInstruction = null, temperature = 0.3 }) {
    const jsonInstruction = (systemInstruction ? systemInstruction + '\n\n' : '') +
      'PENTING: Berikan respons HANYA dalam format JSON valid tanpa penjelasan tambahan dan tanpa markdown codeblock jika memungkinkan.';

    const rawResponse = await GeminiService.generateText({
      prompt,
      systemInstruction: jsonInstruction,
      temperature
    });

    try {
      return GeminiService.cleanAndParseJson(rawResponse);
    } catch (err) {
      console.warn('[GeminiService] Failed to parse JSON response directly. Trying extraction:', err.message);
      const extracted = GeminiService.extractJson(rawResponse);
      if (extracted) return extracted;
      throw new Error(`Gagal memproses respons AI ke dalam format JSON: ${err.message}`);
    }
  }

  /**
   * Helper to clean markdown code blocks and parse JSON
   */
  static cleanAndParseJson(rawText) {
    if (!rawText) throw new Error('Respons kosong');
    let cleaned = rawText.trim();

    // Strip markdown code fences ```json ... ```
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
    }

    return JSON.parse(cleaned);
  }

  /**
   * Extract JSON object or array from mixed text
   */
  static extractJson(text) {
    if (!text) return null;
    const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * Fallback response when Gemini API is unconfigured or rate limited
   */
  static getFallbackResponse(prompt, systemInstruction = '', errorMessage = null) {
    // If prompt is for JSON quiz generation
    if (prompt.includes('"questions"') || prompt.includes('kuis') || prompt.includes('quiz')) {
      return JSON.stringify({
        topic: 'Pembelajaran Umum',
        questions: [
          {
            questionText: 'Apa fungsi utama dari Express.js dalam arsitektur backend Node.js?',
            type: 'multiple_choice',
            options: [
              'A. Mengelola routing dan middleware HTTP',
              'B. Menggantikan database relasional',
              'C. Mengompilasi kode menjadi file biner',
              'D. Mendesain antarmuka pengguna'
            ],
            correctAnswer: 'A',
            explanation: 'Express.js adalah kerangka kerja web minimalis dan fleksibel untuk Node.js yang menyediakan serangkaian fitur tangguh untuk aplikasi web dan API.',
            hints: [
              'Pikirkan tentang peran Express dalam menangani request HTTP dan route.',
              'Express bukanlah database atau compiler mesin.'
            ]
          },
          {
            questionText: 'Sebutkan format dokumen teks yang didukung untuk ekstraksi materi pada StudyMate AI!',
            type: 'short_answer',
            options: null,
            correctAnswer: 'PDF dan TXT',
            explanation: 'StudyMate AI mendukung dokumen berbasis teks berformat PDF dan TXT.',
            hints: [
              'Terdapat dua jenis ekstensi file dokumen umum.',
              'Salah satunya berekstensi .txt dan yang lainnya adalah format dokumen portabel.'
            ]
          }
        ]
      });
    }

    // Default tutor response
    const note = errorMessage ? ` (Catatan: Menggunakan mode simulasi lokal karena kendala API: ${errorMessage})` : '';
    return `[StudyMate AI Tutor]\nTerima kasih atas pertanyaannya! Berdasarkan konteks pembelajaran:\n\n` +
      `Pertanyaan Anda: "${prompt.slice(0, 100)}..."\n\n` +
      `Penjelasan: Mari kita pelajari konsep ini langkah demi langkah. Silakan eksplorasi materi lebih lanjut atau ajukan pertanyaan spesifik terkait materi yang ingin didiskusikan.${note}`;
  }
}

module.exports = GeminiService;
