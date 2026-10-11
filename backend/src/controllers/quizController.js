const QuizService = require('../services/quizService');
const AnswerEvaluationService = require('../services/answerEvaluationService');
const { successResponse, errorResponse } = require('../utils/responseUtils');

class QuizController {
  /**
   * POST /api/quizzes - Generate a multiple choice or short answer quiz
   */
  static async createQuiz(req, res, next) {
    try {
      const {
        sessionId,
        documentId,
        topic,
        type = 'multiple_choice',
        count = 3,
        difficulty = 'sedang'
      } = req.body;

      const validTypes = ['multiple_choice', 'short_answer'];
      if (!validTypes.includes(type)) {
        return errorResponse(res, 400, `Tipe kuis tidak valid. Nilai yang diperbolehkan: ${validTypes.join(', ')}`);
      }

      const validDifficulties = ['mudah', 'sedang', 'sulit'];
      if (!validDifficulties.includes(difficulty)) {
        return errorResponse(res, 400, `Tingkat kesulitan tidak valid. Nilai yang diperbolehkan: ${validDifficulties.join(', ')}`);
      }

      const quiz = await QuizService.createQuiz({
        sessionId,
        documentId,
        topic,
        type,
        count,
        difficulty
      });

      return successResponse(res, 201, 'Kuis berhasil dibuat', quiz);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/quizzes/:quizId - Retrieve public quiz details
   */
  static getQuiz(req, res, next) {
    try {
      const { quizId } = req.params;
      const quiz = QuizService.getQuiz(quizId);

      if (!quiz) {
        return errorResponse(res, 404, 'Kuis tidak ditemukan.');
      }

      return successResponse(res, 200, 'Data kuis berhasil diambil', quiz);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/quizzes/:quizId/answers - Submit an answer and get hints or solution
   */
  static submitAnswer(req, res, next) {
    try {
      const { quizId } = req.params;
      const { questionId, answer, sessionId } = req.body;

      if (!questionId) {
        return errorResponse(res, 400, 'questionId wajib disertakan.');
      }

      if (answer === undefined || answer === null || String(answer).trim() === '') {
        return errorResponse(res, 400, 'Jawaban wajib diisi.');
      }

      const result = AnswerEvaluationService.evaluateAnswer({
        quizId,
        questionId,
        answer: String(answer),
        sessionId
      });

      return successResponse(res, 200, 'Jawaban berhasil dievaluasi', result);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = QuizController;
