const request = require('supertest');
const app = require('../src/app');
const { SessionModel } = require('../src/models/sessionModel');

describe('AI Tutor Chat API Endpoints', () => {
  beforeEach(() => {
    SessionModel._resetForTesting();
  });

  it('POST /api/chat should reject missing message with 400', async () => {
    const res = await request(app).post('/api/chat').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/chat should reject empty whitespace message with 400', async () => {
    const res = await request(app).post('/api/chat').send({ message: '   ' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/chat should return a tutor response without session', async () => {
    const res = await request(app).post('/api/chat').send({
      message: 'Jelaskan konsep dasar Object Oriented Programming!'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reply).toBeDefined();
    expect(typeof res.body.data.reply).toBe('string');
  });

  it('POST /api/chat should maintain conversation history when sessionId is provided', async () => {
    const sessionRes = await request(app).post('/api/sessions').send({});
    const sessionId = sessionRes.body.data.sessionId;

    const chat1 = await request(app).post('/api/chat').send({
      sessionId,
      message: 'Halo, saya ingin belajar JavaScript.'
    });

    expect(chat1.statusCode).toBe(200);

    const sessionData = await request(app).get(`/api/sessions/${sessionId}`);
    expect(sessionData.body.data.chatHistory.length).toBe(2); // 1 user + 1 tutor
    expect(sessionData.body.data.chatHistory[0].role).toBe('user');
    expect(sessionData.body.data.chatHistory[1].role).toBe('model');
  });
});
