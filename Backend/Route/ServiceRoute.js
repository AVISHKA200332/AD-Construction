const express = require('express');
const router = express.Router();
const Service = require('../Model/ServiceModel');
const User = require('../Model/UserModel');
const authMiddleware = require('../middleware/authMiddleware');

// Get services assigned to the logged-in user
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const services = await Service.find({ assigneeId: req.user._id }).sort({ date: -1 });
    res.json({ services });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get services created by the logged-in user
router.get('/created', authMiddleware, async (req, res) => {
  try {
    const services = await Service.find({ creatorId: req.user._id }).sort({ date: -1 });
    res.json({ services });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json({ service });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a service by ID (only creator can edit full record)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const svc = await Service.findById(req.params.id);
    if (!svc) return res.status(404).json({ error: 'Service not found' });
    if (String(svc.creatorId) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Not allowed to edit this service' });
    }
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Service not found' });
    res.json({ service: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a service by ID (creator or assignee)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user._id;
    const deleted = await Service.findOneAndDelete({
      _id: id,
      $or: [{ creatorId: userId }, { assigneeId: userId }]
    });
    if (deleted) return res.json({ service: deleted });
    const exists = await Service.findById(id).lean();
    if (!exists) return res.status(404).json({ error: 'Service not found' });
    return res.status(403).json({ error: 'Not allowed to delete this service' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all services (admin/reporting use)
router.get('/', async (req, res) => {
  try {
    const services = await Service.find();
    res.json({ services });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new service - requires assigneeId, auto-sets creatorId and provider display
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { serviceType, assigneeId, date, cost, message, status } = req.body;
    if (!serviceType || !assigneeId || !date || !cost) {
      return res.status(400).json({ error: 'serviceType, assigneeId, date, and cost are required' });
    }
    const assignee = await User.findById(assigneeId);
    if (!assignee) return res.status(400).json({ error: 'Invalid assigneeId' });
    const providerDisplay = assignee.name || assignee.gmail || 'Unknown';
    const newService = await Service.create({
      serviceType,
      provider: providerDisplay,
      creatorId: req.user._id,
      assigneeId,
      status: status || 'Pending',
      date,
      cost,
      message
    });
    res.status(201).json({ service: newService });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH status (creator or assignee)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const id = req.params.id;
    const userId = req.user._id;
    const svc = await Service.findById(id);
    if (!svc) return res.status(404).json({ error: 'Service not found' });
    if (String(svc.creatorId) !== String(userId) && String(svc.assigneeId) !== String(userId)) {
      return res.status(403).json({ error: 'Not allowed to update status' });
    }
    svc.status = status;
    await svc.save();
    res.json({ service: svc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
