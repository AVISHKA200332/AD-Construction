const express = require('express');
const router = express.Router();


const MessageController = require('../Controllers/MessageController');
const { body, param } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', MessageController.getMessages);

// Authenticated inbox and sent routes (place BEFORE dynamic :id route)
router.get('/inbox', authMiddleware, MessageController.getInbox);
router.get('/sent', authMiddleware, MessageController.getSent);

// Create a new message
router.post(
  '/',
  [
    authMiddleware,
    body('subject')
      .isString().withMessage('Subject must be a string')
      .trim()
      .isLength({ min: 3, max: 100 }).withMessage('Subject must be 3-100 characters'),
    body('message')
      .isString().withMessage('Message must be a string')
      .trim()
      .isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters'),
    body('recipientId')
      .isMongoId().withMessage('recipientId must be a valid Mongo ID'),
  ],
  MessageController.createMessage
);

// Update a message
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid message id'),
    body('subject')
      .optional()
      .isString().withMessage('Subject must be a string')
      .trim()
      .isLength({ min: 3, max: 100 }).withMessage('Subject must be 3-100 characters'),
    body('message')
      .optional()
      .isString().withMessage('Message must be a string')
      .trim()
      .isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters'),
    body('date')
      .optional({ values: 'falsy' })
      .isISO8601().withMessage('Date must be a valid ISO date')
      .toDate(),
    body('status')
      .optional({ values: 'falsy' })
      .isIn(['Unread', 'Read', 'Archived']).withMessage('Invalid status'),
  ],
  MessageController.updateMessage
);

// Delete a message
router.delete(
  '/:id',
  [authMiddleware, param('id').isMongoId().withMessage('Invalid message id')],
  MessageController.deleteMessage
);

// Mark a message as read (recipient only) - place BEFORE dynamic :id route of GET
router.patch(
  '/:id/read',
  [authMiddleware, param('id').isMongoId().withMessage('Invalid message id')],
  MessageController.markAsRead
);

// Get a single message by ID (keep last to avoid catching static routes)
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid message id')],
  MessageController.getMessageById
);

module.exports = router;
