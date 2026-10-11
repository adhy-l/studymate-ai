const express = require('express');
const ChatController = require('../controllers/chatController');

const router = express.Router();

// POST /api/chat - Interact with AI tutor
router.post('/', ChatController.chat);

module.exports = router;
