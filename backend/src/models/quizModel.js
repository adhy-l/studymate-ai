const { randomUUID } = require('crypto');

// In-memory store for quizzes
const quizzesStore = new Map();

class QuizModel {
  /**
   * Create and store quiz
   * @param {Object} quizData
   * @returns {Object}
   */
  static create({ sessionId = null, documentId = null, topic = 'Umum', difficulty = 'sedang', type = 'multiple_choice', questions = [] }) {
    const quizId = randomUUID();
    const now = new Date();

    const formattedQuestions = questions.map((q, idx) => ({
      id: q.id || randomUUID(),
      questionNumber: idx + 1,
      questionText: q.questionText,
      type: q.type || type,
      options: q.options || null,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      hints: Array.isArray(q.hints) && q.hints.length > 0 ? q.hints : ['Pikirkan kembali konsep dasar materi ini.', 'Perhatikan kata kunci pada pertanyaan.'],
      attemptsCount: 0,
      isCompleted: false,
      attempts: []
    }));

    const quiz = {
      quizId,
      sessionId,
      documentId,
      topic,
      difficulty,
      type,
      totalQuestions: formattedQuestions.length,
      questions: formattedQuestions,
      createdAt: now.toISOString()
    };

    quizzesStore.set(quizId, quiz);
    return quiz;
  }

  /**
   * Find quiz by ID
   * @param {string} quizId
   * @returns {Object|null}
   */
  static findById(quizId) {
    if (!quizId) return null;
    return quizzesStore.get(quizId) || null;
  }

  /**
   * Find question within a quiz
   * @param {string} quizId
   * @param {string} questionId
   * @returns {{ quiz: Object, question: Object }|null}
   */
  static findQuestion(quizId, questionId) {
    const quiz = QuizModel.findById(quizId);
    if (!quiz) return null;

    const question = quiz.questions.find((q) => q.id === questionId);
    if (!question) return null;

    return { quiz, question };
  }

  /**
   * Get public sanitized view of the quiz (hides answers/solutions for uncompleted questions)
   * @param {string} quizId
   * @returns {Object|null}
   */
  static getPublicView(quizId) {
    const quiz = QuizModel.findById(quizId);
    if (!quiz) return null;

    return {
      quizId: quiz.quizId,
      sessionId: quiz.sessionId,
      documentId: quiz.documentId,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      type: quiz.type,
      totalQuestions: quiz.totalQuestions,
      questions: quiz.questions.map((q) => {
        const publicQuestion = {
          id: q.id,
          questionNumber: q.questionNumber,
          questionText: q.questionText,
          type: q.type,
          options: q.options,
          attemptsCount: q.attemptsCount,
          isCompleted: q.isCompleted,
          totalHintsAvailable: q.hints.length
        };

        // Only reveal explanation and solution if completed
        if (q.isCompleted) {
          publicQuestion.correctAnswer = q.correctAnswer;
          publicQuestion.explanation = q.explanation;
        }

        return publicQuestion;
      }),
      createdAt: quiz.createdAt
    };
  }

  /**
   * Delete quiz by ID
   * @param {string} quizId
   * @returns {boolean}
   */
  static delete(quizId) {
    return quizzesStore.delete(quizId);
  }

  static getStoreSize() {
    return quizzesStore.size;
  }

  static _resetForTesting() {
    quizzesStore.clear();
  }
}

module.exports = {
  QuizModel
};
