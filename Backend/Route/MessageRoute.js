const express = require('express');
const router = express.Router();
const MessageController = require('../Controllers/MessageController');

router.get('/', MessageController.getMessages);
router.get('/:id', MessageController.getMessageById);
router.post('/', MessageController.createMessage);
router.put('/:id', MessageController.updateMessage);
router.delete('/:id', MessageController.deleteMessage);

module.exports = router;
