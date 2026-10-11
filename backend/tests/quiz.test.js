const request = require('supertest');
const app = require('../src/app');
const { QuizModel } = require('../src/models/quizModel');
const { SessionModel } = require('../src/models/sessionModel');

describe('Quiz & Interactive Answer Evaluation API Endpoints', () => {
  beforeEach(() => {
    QuizModel._resetForTesting();
    SessionModel._resetForTesting();
  });

  it('POST /api/quizzes should generate a quiz and hide answers in public response', async () => {
    const res = await request(app).post('/api/quizzes').send({
      topic: 'Pemrograman Node.js',
      type: 'multiple_choice',
      count: 2,
      difficulty: 'sedang'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.quizId).toBeDefined();
    expect(Array.isArray(res.body.data.questions)).toBe(true);
    expect(res.body.data.questions.length).toBeGreaterThan(0);

    const firstQuestion = res.body.data.questions[0];
    expect(firstQuestion.questionText).toBeDefined();
    expect(firstQuestion.correctAnswer).toBeUndefined(); // Answer must be hidden!
    expect(firstQuestion.explanation).toBeUndefined(); // Explanation must be hidden!
    expect(firstQuestion.isCompleted).toBe(false);
  });

  it('POST /api/quizzes/:quizId/answers should evaluate correct answer directly', async () => {
    // Seed a specific test quiz directly in QuizModel
    const quiz = QuizModel.create({
      topic: 'Dasar Web',
      type: 'multiple_choice',
      questions: [
        {
          questionText: 'Protokol apa yang digunakan web?',
          type: 'multiple_choice',
          options: ['A. HTTP', 'B. FTP', 'C. SSH', 'D. SMTP'],
          correctAnswer: 'A',
          explanation: 'HTTP adalah protokol transfer hiperteks untuk web.',
          hints: ['Awalan huruf H.', 'Biasa ada di URL browser.']
        }
      ]
    });

    const questionId = quiz.questions[0].id;

    const res = await request(app)
      .post(`/api/quizzes/${quiz.quizId}/answers`)
      .send({
        questionId,
        answer: 'A'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.isCorrect).toBe(true);
    expect(res.body.data.isCompleted).toBe(true);
    expect(res.body.data.canRetry).toBe(false);
    expect(res.body.data.explanation).toContain('HTTP');
  });

  it('POST /api/quizzes/:quizId/answers should provide progressive hints for wrong answers then reveal solution after exceeding max hints', async () => {
    // Create a session with maxHints = 2
    const session = SessionModel.create({ maxHints: 2 });

    const quiz = QuizModel.create({
      sessionId: session.sessionId,
      topic: 'Fisika Dasar',
      type: 'short_answer',
      questions: [
        {
          questionText: 'Berapa percepatan gravitasi bumi (dalam m/s2)?',
          type: 'short_answer',
          correctAnswer: '9.8',
          explanation: 'Percepatan gravitasi standar bumi adalah sekitar 9.8 m/s^2.',
          hints: [
            'Nilainya mendekati angka 10.',
            'Ada angka desimal 8 di belakang koma.'
          ]
        }
      ]
    });

    const questionId = quiz.questions[0].id;

    // Attempt 1: Wrong Answer -> Should receive Hint 1, can retry
    const res1 = await request(app)
      .post(`/api/quizzes/${quiz.quizId}/answers`)
      .send({
        sessionId: session.sessionId,
        questionId,
        answer: '100'
      });

    expect(res1.statusCode).toBe(200);
    expect(res1.body.data.isCorrect).toBe(false);
    expect(res1.body.data.canRetry).toBe(true);
    expect(res1.body.data.hintNumber).toBe(1);
    expect(res1.body.data.hint).toBe('Nilainya mendekati angka 10.');
    expect(res1.body.data.solution).toBeUndefined(); // Solution still hidden

    // Attempt 2: Wrong Answer again -> Should receive Hint 2, can retry
    const res2 = await request(app)
      .post(`/api/quizzes/${quiz.quizId}/answers`)
      .send({
        sessionId: session.sessionId,
        questionId,
        answer: '50'
      });

    expect(res2.statusCode).toBe(200);
    expect(res2.body.data.isCorrect).toBe(false);
    expect(res2.body.data.canRetry).toBe(true);
    expect(res2.body.data.hintNumber).toBe(2);
    expect(res2.body.data.hint).toBe('Ada angka desimal 8 di belakang koma.');
    expect(res2.body.data.solution).toBeUndefined(); // Still hidden

    // Attempt 3: Wrong Answer after 2 hints (attempts > maxHints) -> Solution revealed!
    const res3 = await request(app)
      .post(`/api/quizzes/${quiz.quizId}/answers`)
      .send({
        sessionId: session.sessionId,
        questionId,
        answer: '15'
      });

    expect(res3.statusCode).toBe(200);
    expect(res3.body.data.isCorrect).toBe(false);
    expect(res3.body.data.canRetry).toBe(false);
    expect(res3.body.data.isCompleted).toBe(true);
    expect(res3.body.data.solution).toBe('9.8');
    expect(res3.body.data.explanation).toBeDefined();
  });
});
