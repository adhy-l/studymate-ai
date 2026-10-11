const express = require('express');
const QuizController = require('../controllers/quizController');

const router = express.Router();

// POST /api/quizzes - Create multiple choice or short answer quiz
router.post('/', QuizController.createQuiz);

// GET /api/quizzes/:quizId - Retrieve public quiz details
router.get('/:quizId', QuizController.getQuiz);

// POST /api/quizzes/:quizId/answers - Check answer and receive hint or solution
router.post('/:quizId/answers', QuizController.submitAnswer);

module.exports = router;
