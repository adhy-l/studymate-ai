const request = require('supertest');
const app = require('../src/app');
const { DocumentModel } = require('../src/models/documentModel');

describe('Document Upload & Processing API Endpoints', () => {
  beforeEach(() => {
    DocumentModel._resetForTesting();
  });

  const sampleTxtContent = `
Siklus Air dan Presipitasi
Siklus hidrologi adalah sirkulasi air yang tidak pernah berhenti dari atmosfer ke bumi dan kembali ke atmosfer.
Proses utamanya mencakup evaporasi, kondensasi, presipitasi, dan infiltrasi.
Evaporasi adalah penguapan air dari permukaan laut dan sungai akibat sinar matahari.
Kondensasi adalah perubahan uap air menjadi titik-titik air di awan.
Presipitasi terjadi ketika awan sudah tidak mampu menampung air dan jatuh sebagai hujan.
`;

  it('POST /api/documents should reject request without file', async () => {
    const res = await request(app).post('/api/documents');

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/documents should reject unsupported file formats (e.g. png)', async () => {
    const fakeImageBuffer = Buffer.from('fake image content');

    const res = await request(app)
      .post('/api/documents')
      .attach('file', fakeImageBuffer, 'gambar.png');

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Format file tidak didukung');
  });

  it('POST /api/documents should successfully upload and extract TXT document', async () => {
    const textBuffer = Buffer.from(sampleTxtContent, 'utf-8');

    const res = await request(app)
      .post('/api/documents')
      .attach('file', textBuffer, 'siklus_air.txt');

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.documentId).toBeDefined();
    expect(res.body.data.fileName).toBe('siklus_air.txt');
    expect(res.body.data.fileType).toBe('txt');
    expect(res.body.data.totalChunks).toBeGreaterThan(0);
    expect(res.body.data.totalCharacters).toBeGreaterThan(50);
  });

  it('GET /api/documents/:documentId should return document processing status', async () => {
    const textBuffer = Buffer.from(sampleTxtContent, 'utf-8');
    const uploadRes = await request(app)
      .post('/api/documents')
      .attach('file', textBuffer, 'siklus_air.txt');

    const documentId = uploadRes.body.data.documentId;

    const res = await request(app).get(`/api/documents/${documentId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.documentId).toBe(documentId);
    expect(res.body.data.status).toBe('ready');
    expect(res.body.data.preview).toBeDefined();
  });

  it('POST /api/documents/:documentId/ask should answer questions grounded in document', async () => {
    const textBuffer = Buffer.from(sampleTxtContent, 'utf-8');
    const uploadRes = await request(app)
      .post('/api/documents')
      .attach('file', textBuffer, 'siklus_air.txt');

    const documentId = uploadRes.body.data.documentId;

    const res = await request(app)
      .post(`/api/documents/${documentId}/ask`)
      .send({ question: 'Apa itu evaporasi?' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.answer).toBeDefined();
    expect(res.body.data.isGrounded).toBe(true);
    expect(res.body.data.sources.length).toBeGreaterThan(0);
  });

  it('POST /api/documents/:documentId/ask should state when information is not in document', async () => {
    const textBuffer = Buffer.from(sampleTxtContent, 'utf-8');
    const uploadRes = await request(app)
      .post('/api/documents')
      .attach('file', textBuffer, 'siklus_air.txt');

    const documentId = uploadRes.body.data.documentId;

    // Ask something completely unrelated (e.g. quantum mechanics)
    const res = await request(app)
      .post(`/api/documents/${documentId}/ask`)
      .send({ question: 'Berapa konstanta Planck pada mekanika kuantum?' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.isGrounded).toBe(false);
    expect(res.body.data.answer).toContain('tidak tersedia dalam dokumen');
  });

  it('POST /api/documents/:documentId/summarize should produce summary', async () => {
    const textBuffer = Buffer.from(sampleTxtContent, 'utf-8');
    const uploadRes = await request(app)
      .post('/api/documents')
      .attach('file', textBuffer, 'siklus_air.txt');

    const documentId = uploadRes.body.data.documentId;

    const res = await request(app)
      .post(`/api/documents/${documentId}/summarize`)
      .send({ length: 'ringkas' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.summary).toBeDefined();
  });
});
