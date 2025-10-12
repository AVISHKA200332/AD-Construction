const Message = require('../Model/MessageModel');
const User = require('../Model/UserModel');
const { validationResult } = require('express-validator');

// Get all messages
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find();
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single message by ID
// Requires authentication so we can determine if the requester is the recipient
exports.getMessageById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    // If the requester is the recipient and message is unread, mark it as read
    try {
      if (req.user && String(message.recipientId) === String(req.user._id) && !message.isRead) {
        message.isRead = true;
        message.status = 'Read';
        message.readAt = new Date();
        await message.save();
      }
    } catch (innerErr) {
      // don't block returning the message if marking read fails
      console.warn('Failed to mark message as read:', innerErr.message);
    }

    res.json({ message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new message
exports.createMessage = async (req, res) => {
  console.log('Creating message with body:', req.body);
  console.log('User from token:', req.user);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const { subject, message, recipientId } = req.body;

    // Validate recipient user exists
    const recipientUser = await User.findById(recipientId);
    if (!recipientUser) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Sender is the logged-in user
    const senderUser = await User.findById(req.user._id);
    if (!senderUser) {
      return res.status(401).json({ error: 'Invalid sender' });
    }

    // Set display names (keep your UI columns working)
    const displaySender = senderUser.name || senderUser.gmail;
    const displayRecipient = recipientUser.name || recipientUser.gmail;

    const newMessage = new Message({
      subject,
      message,
      sender: displaySender,
      recipient: displayRecipient,
      senderId: senderUser._id,
      recipientId: recipientUser._id,
      status: 'Unread',
      isRead: false
    });
    await newMessage.save();
    console.log('Message created successfully:', newMessage);
    res.status(201).json({ message: newMessage });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a message
exports.updateMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const updated = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Message not found' });
    res.json({ message: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a message (only sender or recipient can delete)
exports.deleteMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const id = req.params.id;
    const deleted = await Message.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Message not found' });
    return res.json({ message: deleted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message', details: err.message });
  }
};

// Get inbox for logged-in user (by recipientId)
exports.getInbox = async (req, res) => {
  try {
    const messages = await Message.find({ recipientId: req.user._id }).sort({ date: -1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get sent messages for logged-in user (by senderId)
exports.getSent = async (req, res) => {
  try {
    const messages = await Message.find({ senderId: req.user._id }).sort({ date: -1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark a message as read (only if current user is recipient)
exports.markAsRead = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (String(msg.recipientId) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Not allowed to mark this message as read' });
    }
    if (!msg.isRead) {
      msg.isRead = true;
      msg.status = 'Read';
      msg.readAt = new Date();
      await msg.save();
    }
    res.json({ message: msg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


