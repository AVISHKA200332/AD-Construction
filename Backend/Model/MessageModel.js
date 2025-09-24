const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId,ref:"user", required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId,ref:"user", required: true },
  date: { type: Date, default: Date.now },
  status: { type: Boolean, default: false }
});

module.exports = mongoose.model('Message', MessageSchema);
