const { QuizModel } = require('../models/quizModel');
const SessionService = require('./sessionService');
const { normalizeAnswer } = require('../utils/textUtils');

class AnswerEvaluationService {
  /**
   * Evaluate a user's answer to a quiz question
   * @param {Object} params
   * @param {string} params.quizId
   * @param {string} params.questionId
   * @param {string} params.answer
   * @param {string} [params.sessionId]
   * @returns {Object} evaluation outcome
   */
  static evaluateAnswer({ quizId, questionId, answer, sessionId = null }) {
    if (!answer || typeof answer !== 'string' || answer.trim() === '') {
      throw new Error('Jawaban tidak boleh kosong.');
    }

    const found = QuizModel.findQuestion(quizId, questionId);
    if (!found) {
      throw new Error('Soal kuis tidak ditemukan.');
    }

    const { question } = found;

    // Determine maxHints allowed from session settings or default to 2
    let maxHints = 2;
    if (sessionId) {
      const session = SessionService.getSession(sessionId);
      if (session && session.settings && session.settings.maxHints) {
        maxHints = session.settings.maxHints;
      }
    }

    // If question was already completed earlier
    if (question.isCompleted) {
      return {
        isCorrect: true,
        isCompleted: true,
        canRetry: false,
        message: 'Soal ini sudah diselesaikan sebelumnya.',
        solution: question.correctAnswer,
        explanation: question.explanation,
        totalAttempts: question.attemptsCount
      };
    }

    // Check correctness
    const isCorrect = AnswerEvaluationService.checkCorrectness(question, answer);
    question.attemptsCount += 1;

    const attemptRecord = {
      attemptNumber: question.attemptsCount,
      answer: answer.trim(),
      isCorrect,
      timestamp: new Date().toISOString()
    };
    question.attempts.push(attemptRecord);

    // Scenario 1: Correct Answer
    if (isCorrect) {
      question.isCompleted = true;
      return {
        isCorrect: true,
        isCompleted: true,
        canRetry: false,
        message: 'Luar biasa! Jawaban Anda benar!',
        attempts: question.attemptsCount,
        solution: question.correctAnswer,
        explanation: question.explanation
      };
    }

    // Scenario 2: Incorrect Answer, still within maxHints
    if (question.attemptsCount <= maxHints) {
      const hintIndex = question.attemptsCount - 1;
      const hint = (question.hints && question.hints[hintIndex]) 
        || (question.hints && question.hints[question.hints.length - 1]) 
        || 'Perhatikan kembali konsep materi terkait.';

      return {
        isCorrect: false,
        isCompleted: false,
        canRetry: true,
        message: 'Jawaban Anda belum tepat. Coba telaah petunjuk berikut dan coba kembali!',
        attempts: question.attemptsCount,
        maxHints,
        hintNumber: question.attemptsCount,
        hint,
        remainingAttempts: maxHints - question.attemptsCount + 1
      };
    }

    // Scenario 3: Incorrect Answer and max attempts exhausted -> Reveal Solution
    question.isCompleted = true;
    return {
      isCorrect: false,
      isCompleted: true,
      canRetry: false,
      message: 'Batas percobaan untuk soal ini telah selesai. Berikut adalah solusi dan penjelasan lengkapnya.',
      attempts: question.attemptsCount,
      maxHints,
      solution: question.correctAnswer,
      explanation: question.explanation
    };
  }

  /**
   * Compare user answer with correct answer
   * @param {Object} question
   * @param {string} userAnswer
   * @returns {boolean}
   */
  static checkCorrectness(question, userAnswer) {
    const rawUser = userAnswer.trim();
    const rawCorrect = String(question.correctAnswer || '').trim();

    // Multiple Choice
    if (question.type === 'multiple_choice') {
      // Check if user answered option letter e.g. "A", "B"
      const userLetter = rawUser.charAt(0).toUpperCase();
      const correctLetter = rawCorrect.charAt(0).toUpperCase();

      if (userLetter === correctLetter) {
        return true;
      }

      // Check if user typed full option text
      const normUser = normalizeAnswer(rawUser);
      const normCorrect = normalizeAnswer(rawCorrect);
      return normUser === normCorrect;
    }

    // Short Answer
    const normUser = normalizeAnswer(rawUser);
    const normCorrect = normalizeAnswer(rawCorrect);

    if (normUser === normCorrect) {
      return true;
    }

    // Also match if user answer contains or is contained in correct answer (if substantive)
    if (normUser.length >= 4 && normCorrect.includes(normUser)) {
      return true;
    }

    return false;
  }
}

module.exports = AnswerEvaluationService;
