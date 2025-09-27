const Service = require('../Model/ServiceModel');

// Get all services
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json({ services });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json({ service });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new service
exports.createService = async (req, res) => {
  try {
    const newService = new Service(req.body);
    await newService.save();
    res.status(201).json({ service: newService });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a service
exports.updateService = async (req, res) => {
  try {
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Service not found' });
    res.json({ service: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a service
exports.deleteService = async (req, res) => {
  try {
    const deleted = await Service.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Service not found' });
    res.json({ service: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
