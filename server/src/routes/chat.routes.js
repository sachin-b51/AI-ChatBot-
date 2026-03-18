const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/chat.controller');

// Chat management
router.get('/chats', ctrl.getChats);
router.post('/chats', ctrl.createChat);
router.post('/stateless', ctrl.statelessMessage);
router.delete('/chats/:id', ctrl.deleteChat);
router.patch('/chats/:id/title', ctrl.renameChat);

// Messaging
router.get('/chats/:id/messages', ctrl.getMessages);
router.post('/chats/:id/message', ctrl.sendMessage);

// Utilities
router.post('/execute', ctrl.executeCode);

module.exports = router;
