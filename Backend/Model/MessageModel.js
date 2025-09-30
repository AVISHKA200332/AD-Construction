const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  subject: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
  sender: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  recipient: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  // New: store actual user ids to route by login
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['Unread', 'Read', 'Archived'], default: 'Unread' },
  // Read tracking
  isRead: { type: Boolean, default: false },
  readAt: { type: Date, default: null }
});

module.exports = mongoose.model('Message', MessageSchema);
