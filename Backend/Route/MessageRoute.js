const express = require('express');
const router = express.Router();


const MessageController = require('../Controllers/MessageController');
const { body, param } = require('express-validator');

// Get all messages
router.get('/', MessageController.getMessages);

// Get a single message by ID
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid message id')],
  MessageController.getMessageById
);

// Create a new message
router.post(
  '/',
  [
    body('subject')
      .isString().withMessage('Subject must be a string')
      .trim()
      .isLength({ min: 3, max: 100 }).withMessage('Subject must be 3-100 characters'),
    body('sender')
      .isString().withMessage('Sender must be a string')
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('Sender must be 2-50 characters'),
    body('recipient')
      .isString().withMessage('Recipient must be a string')
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('Recipient must be 2-50 characters'),
    body('message')
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
    body('sender')
      .optional()
      .isString().withMessage('Sender must be a string')
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('Sender must be 2-50 characters'),
    body('recipient')
      .optional()
      .isString().withMessage('Recipient must be a string')
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('Recipient must be 2-50 characters'),
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
  [param('id').isMongoId().withMessage('Invalid message id')],
  MessageController.deleteMessage
);

module.exports = router;
