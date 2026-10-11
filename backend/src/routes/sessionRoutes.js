const express = require('express');
const SessionController = require('../controllers/sessionController');

const router = express.Router();

// POST /api/sessions - Create new session
router.post('/', SessionController.createSession);

// GET /api/sessions/:sessionId - Get active session context
router.get('/:sessionId', SessionController.getSession);

// DELETE /api/sessions/:sessionId - Terminate session
router.delete('/:sessionId', SessionController.deleteSession);

// PATCH /api/sessions/:sessionId/settings - Update tutor parameters
router.patch('/:sessionId/settings', SessionController.updateSettings);

module.exports = router;
