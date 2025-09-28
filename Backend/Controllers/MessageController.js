const Message = require('../Model/MessageModel');
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
exports.getMessageById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json({ message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new message
exports.createMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const newMessage = new Message(req.body);
    await newMessage.save();
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

// Delete a message
exports.deleteMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const deleted = await Message.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Message not found' });
    res.json({ message: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ...existing code...

// ...existing code...
