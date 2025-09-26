const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  serviceType: { type: String, required: true },
  provider: { type: String, required: true },
  status: { type: String, required: true },
  date: { type: Date, required: true },
  cost: { type: Number, required: true }
});

module.exports = mongoose.model('Service', ServiceSchema);
