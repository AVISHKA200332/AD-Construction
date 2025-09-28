const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  subject: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
  sender: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  recipient: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  message: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['Unread', 'Read', 'Archived'], default: 'Unread' }
});

module.exports = mongoose.model('Message', MessageSchema);
