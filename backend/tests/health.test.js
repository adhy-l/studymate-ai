const request = require('supertest');
const app = require('../src/app');

describe('Health API Endpoint', () => {
  it('GET /api/health should return 200 OK and health status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.service).toBe('StudyMate AI Backend');
    expect(typeof res.body.data.uptime).toBe('number');
  });

  it('GET / should return basic welcome info', async () => {
    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('StudyMate AI API');
  });

  it('GET /api/unknown-endpoint should return 404', async () => {
    const res = await request(app).get('/api/unknown-endpoint');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
