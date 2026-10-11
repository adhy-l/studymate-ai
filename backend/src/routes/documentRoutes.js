const express = require('express');
const DocumentController = require('../controllers/documentController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// POST /api/documents - Upload PDF or TXT
router.post('/', upload.single('file'), DocumentController.uploadDocument);

// GET /api/documents/:documentId - View document processing status
router.get('/:documentId', DocumentController.getDocumentStatus);

// POST /api/documents/:documentId/ask - Q&A grounded in document
router.post('/:documentId/ask', DocumentController.askDocument);

// POST /api/documents/:documentId/summarize - Summarize document content
router.post('/:documentId/summarize', DocumentController.summarizeDocument);

module.exports = router;
