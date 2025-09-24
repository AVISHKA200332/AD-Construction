const Message = require('../Model/MessageModel');

// Get all messages with optional search and filters
exports.getMessages = async (req, res) => {
  try {
    const { q, status, dateFrom, dateTo, sender, recipient } = req.query;

    const filter = {};

    // Text search on subject
    if (q) {
      filter.subject = { $regex: q, $options: 'i' };
    }

    // Status filter (schema uses Boolean; accept several forms from client)
    if (typeof status !== 'undefined' && status !== '' && status !== 'All') {
      let statusBool = undefined;
      const s = String(status).toLowerCase();
      if (s === 'read' || s === 'true' || s === '1') statusBool = true;
      if (s === 'unread' || s === 'false' || s === '0') statusBool = false;
      if (typeof statusBool === 'boolean') {
        filter.status = statusBool;
      }
    }

    // Sender and recipient filters (ObjectId strings)
    if (sender) filter.sender = sender;
    if (recipient) filter.recipient = recipient;

    // Date range filter
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) {
        const d = new Date(dateTo);
        // Include the entire end date by setting time to end of the day
        d.setHours(23, 59, 59, 999);
        filter.date.$lte = d;
      }
    }

    const messages = await Message.find(filter);
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single message by ID
exports.getMessageById = async (req, res) => {
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
