const { QuizModel } = require('../models/quizModel');
const DocumentService = require('./documentService');
const GeminiService = require('./geminiService');
const SessionService = require('./sessionService');

class QuizService {
  /**
   * Generate a new quiz based on a topic or an uploaded document
   * @param {Object} params
   * @param {string} [params.sessionId]
   * @param {string} [params.documentId]
   * @param {string} [params.topic]
   * @param {string} [params.type='multiple_choice'] 'multiple_choice' | 'short_answer'
   * @param {number} [params.count=3]
   * @param {string} [params.difficulty='sedang'] 'mudah' | 'sedang' | 'sulit'
   * @returns {Promise<Object>}
   */
  static async createQuiz({
    sessionId = null,
    documentId = null,
    topic = 'Umum',
    type = 'multiple_choice',
    count = 3,
    difficulty = 'sedang'
  }) {
    let sourceContent = '';
    let quizTopic = topic;

    if (documentId) {
      const doc = DocumentService.getDocument(documentId);
      if (!doc) {
        throw new Error('Dokumen yang ditentukan untuk pembuatan kuis tidak ditemukan.');
      }
      sourceContent = doc.rawText.slice(0, 8000);
      quizTopic = `Materi Dokumen: ${doc.fileName}`;
    }

    const questionCount = Math.min(Math.max(parseInt(count, 10) || 3, 1), 10);

    const prompt = QuizService.buildQuizGenerationPrompt({
      sourceContent,
      topic: quizTopic,
      type,
      count: questionCount,
      difficulty
    });

    const systemInstruction =
      'Anda adalah AI Quiz Master profesional untuk aplikasi StudyMate AI.\n' +
      'Tugas Anda adalah membuat soal kuis yang berkualitas tinggi dengan kunci jawaban, penjelasan lengkap, dan 2 PETUNJUK BERTAHAP (progressive hints).\n' +
      'Petunjuk 1 harus memberikan arahan konseptual umum.\n' +
      'Petunjuk 2 harus lebih spesifik menuju jawaban tanpa langsung membocorkannya.';

    let generatedData;
    try {
      generatedData = await GeminiService.generateJson({
        prompt,
        systemInstruction,
        temperature: 0.5
      });
    } catch (err) {
      console.warn('[QuizService] AI generation error, using fallback questions:', err.message);
      generatedData = QuizService.getFallbackQuestions(quizTopic, type, difficulty);
    }

    const rawQuestions = Array.isArray(generatedData.questions)
      ? generatedData.questions
      : Array.isArray(generatedData)
      ? generatedData
      : [];

    if (rawQuestions.length === 0) {
      throw new Error('Gagal menghasilkan pertanyaan kuis. Silakan coba kembali.');
    }

    const quiz = QuizModel.create({
      sessionId,
      documentId,
      topic: quizTopic,
      difficulty,
      type,
      questions: rawQuestions
    });

    if (sessionId) {
      const session = SessionService.getSession(sessionId);
      if (session && !session.quizIds.includes(quiz.quizId)) {
        session.quizIds.push(quiz.quizId);
      }
    }

    return QuizModel.getPublicView(quiz.quizId);
  }

  /**
   * Build the prompt for quiz generation
   */
  static buildQuizGenerationPrompt({ sourceContent, topic, type, count, difficulty }) {
    const isMultipleChoice = type === 'multiple_choice';

    return `
Buatlah ${count} butir soal kuis dengan spesifikasi berikut:
- Topik: ${topic}
- Tipe Soal: ${isMultipleChoice ? 'Pilihan Ganda (multiple_choice)' : 'Jawaban Singkat (short_answer)'}
- Tingkat Kesulitan: ${difficulty} (mudah / sedang / sulit)
${sourceContent ? `- Sumber Materi:\n${sourceContent}` : ''}

Format output WAJIB berupa JSON dengan struktur persis seperti berikut:
{
  "topic": "${topic}",
  "questions": [
    {
      "questionText": "Teks pertanyaan di sini",
      "type": "${type}",
      ${isMultipleChoice ? '"options": ["A. Opsi 1", "B. Opsi 2", "C. Opsi 3", "D. Opsi 4"],\n      "correctAnswer": "A",' : '"options": null,\n      "correctAnswer": "Kata kunci jawaban yang benar",'}
      "explanation": "Penjelasan mendalam mengapa jawaban tersebut benar",
      "hints": [
        "Petunjuk 1 (arahan konsep umum)",
        "Petunjuk 2 (petunjuk lebih spesifik)"
      ]
    }
  ]
}
`;
  }

  /**
   * Fallback questions if external AI is not reachable
   */
  static getFallbackQuestions(topic, type, difficulty) {
    if (type === 'multiple_choice') {
      return {
        questions: [
          {
            questionText: `Apa konsep dasar yang paling fundamental dalam topik ${topic}?`,
            type: 'multiple_choice',
            options: [
              'A. Memahami prinsip utama dan terminologi dasar',
              'B. Mengabaikan dokumentasi dan pengujian',
              'C. Langsung ke optimasi tingkat lanjut tanpa dasar',
              'D. Menghafal seluruh baris kode tanpa paham konteks'
            ],
            correctAnswer: 'A',
            explanation: 'Pemahaman konsep dasar dan terminologi adalah pondasi utama dalam mempelajari topik apa pun secara efektif.',
            hints: [
              'Pikirkan langkah awal yang paling bijak saat belajar materi baru.',
              'Pilihan yang benar berkaitan dengan pemahaman prinsip utama.'
            ]
          },
          {
            questionText: 'Metode apa yang paling efektif untuk memvalidasi pemahaman materi?',
            type: 'multiple_choice',
            options: [
              'A. Mengulang latihan dan menjelaskan kembali konsep tersebut',
              'B. Membaca sekilas sekali saja',
              'C. Menghindari evaluasi dan pertanyaan',
              'D. Hanya mengandalkan ingatan jangka pendek'
            ],
            correctAnswer: 'A',
            explanation: 'Teknik active recall dan menguji diri sendiri melalui latihan serta menjelaskan ulang terbukti paling efektif.',
            hints: [
              'Metode ini dikenal sebagai teknik Feynman dan active recall.',
              'Melibatkan pengujian aktif terhadap diri sendiri.'
            ]
          }
        ]
      };
    }

    return {
      questions: [
        {
          questionText: `Sebutkan tujuan utama dari proses evaluasi interaktif pada topik ${topic}!`,
          type: 'short_answer',
          options: null,
          correctAnswer: 'memahami materi',
          explanation: 'Tujuan utama evaluasi interaktif adalah memastikan pemahaman materi secara mendalam dan memperbaiki kesalahan.',
          hints: [
            'Fokus pada kata kerja pemahaman atau penguasaan materi.',
            'Kuncinya adalah memahami materi pembelajaran.'
          ]
        }
      ]
    };
  }

  /**
   * Get public view of quiz
   * @param {string} quizId
   */
  static getQuiz(quizId) {
    return QuizModel.getPublicView(quizId);
  }
}

module.exports = QuizService;
