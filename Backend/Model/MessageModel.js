const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'Unread' }
});

module.exports = mongoose.model('Message', MessageSchema);
