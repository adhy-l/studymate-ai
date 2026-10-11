const request = require('supertest');
const app = require('../src/app');
const { SessionModel } = require('../src/models/sessionModel');

describe('Session Management API Endpoints', () => {
  beforeEach(() => {
    SessionModel._resetForTesting();
  });

  it('POST /api/sessions should create a new session with default settings', async () => {
    const res = await request(app).post('/api/sessions').send({});

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sessionId).toBeDefined();
    expect(res.body.data.settings.skillLevel).toBe('pemula');
    expect(res.body.data.settings.learningMode).toBe('tutor');
    expect(res.body.data.settings.maxHints).toBe(2);
  });

  it('POST /api/sessions should create a session with custom valid settings', async () => {
    const payload = {
      settings: {
        skillLevel: 'mahir',
        explanationDepth: 'mendalam',
        learningMode: 'sokratik',
        quizDifficulty: 'sulit',
        maxHints: 3
      }
    };

    const res = await request(app).post('/api/sessions').send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.data.settings.skillLevel).toBe('mahir');
    expect(res.body.data.settings.explanationDepth).toBe('mendalam');
    expect(res.body.data.settings.learningMode).toBe('sokratik');
    expect(res.body.data.settings.quizDifficulty).toBe('sulit');
    expect(res.body.data.settings.maxHints).toBe(3);
  });

  it('GET /api/sessions/:sessionId should return 200 and session data', async () => {
    const created = await request(app).post('/api/sessions').send({});
    const sessionId = created.body.data.sessionId;

    const res = await request(app).get(`/api/sessions/${sessionId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.sessionId).toBe(sessionId);
    expect(Array.isArray(res.body.data.chatHistory)).toBe(true);
  });

  it('GET /api/sessions/:sessionId with invalid ID should return 404', async () => {
    const res = await request(app).get('/api/sessions/non-existent-id');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/sessions/:sessionId/settings should update tutor settings', async () => {
    const created = await request(app).post('/api/sessions').send({});
    const sessionId = created.body.data.sessionId;

    const patchRes = await request(app)
      .patch(`/api/sessions/${sessionId}/settings`)
      .send({ settings: { skillLevel: 'menengah', explanationDepth: 'ringkas' } });

    expect(patchRes.statusCode).toBe(200);
    expect(patchRes.body.data.settings.skillLevel).toBe('menengah');
    expect(patchRes.body.data.settings.explanationDepth).toBe('ringkas');
  });

  it('PATCH /api/sessions/:sessionId/settings should reject invalid options with 400', async () => {
    const created = await request(app).post('/api/sessions').send({});
    const sessionId = created.body.data.sessionId;

    const patchRes = await request(app)
      .patch(`/api/sessions/${sessionId}/settings`)
      .send({ settings: { skillLevel: 'super-genius' } });

    expect(patchRes.statusCode).toBe(400);
    expect(patchRes.body.success).toBe(false);
  });

  it('DELETE /api/sessions/:sessionId should delete session and return 404 on subsequent get', async () => {
    const created = await request(app).post('/api/sessions').send({});
    const sessionId = created.body.data.sessionId;

    const delRes = await request(app).delete(`/api/sessions/${sessionId}`);
    expect(delRes.statusCode).toBe(200);

    const getRes = await request(app).get(`/api/sessions/${sessionId}`);
    expect(getRes.statusCode).toBe(404);
  });
});
