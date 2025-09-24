const Service = require('../Model/ServiceModel');

// Get all services with optional search and filters
exports.getServices = async (req, res) => {
  try {
    const { q, status, dateFrom, dateTo, minCost, maxCost, provider, serviceType } = req.query;

    const filter = {};

    // Text search on serviceType or provider
    if (q) {
      filter.$or = [
        { serviceType: { $regex: q, $options: 'i' } },
        { provider: { $regex: q, $options: 'i' } }
      ];
    }

    if (serviceType) {
      filter.serviceType = { $regex: serviceType, $options: 'i' };
    }
    if (provider) {
      filter.provider = { $regex: provider, $options: 'i' };
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    // Date range
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) {
        const d = new Date(dateTo);
        d.setHours(23, 59, 59, 999);
        filter.date.$lte = d;
      }
    }

    // Cost range
    if (minCost || maxCost) {
      filter.cost = {};
      if (minCost) filter.cost.$gte = Number(minCost);
      if (maxCost) filter.cost.$lte = Number(maxCost);
    }

    const services = await Service.find(filter);
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
