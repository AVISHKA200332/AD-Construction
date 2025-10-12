const Service = require('../Model/ServiceModel');
const User = require('../Model/UserModel');

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
    // Set default status to 'Pending' if not provided
    // Provide safe defaults for provider, cost and date when clients omit them
    const serviceData = {
      ...req.body,
      status: req.body.status || 'Pending',
      provider: req.body.provider || 'Unassigned',
      cost: (req.body.cost !== undefined && req.body.cost !== null) ? parseFloat(req.body.cost) : 0,
      date: req.body.date ? new Date(req.body.date) : new Date()
    };
    
    const newService = new Service(serviceData);
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

// Assign service to labor (Site Manager only)
exports.assignService = async (req, res) => {
  try {
    const { serviceId, laborId } = req.body;
    
    // Verify the service exists
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    
    // Verify the labor user exists and has Labor role
    const laborUser = await User.findById(laborId);
    if (!laborUser) return res.status(404).json({ error: 'Labor user not found' });
    if (laborUser.role !== 'Labor') return res.status(400).json({ error: 'User is not a Labor worker' });
    
    // Get the assigning user (Site Manager)
    const assigningUser = await User.findById(req.user._id);
    if (!assigningUser) return res.status(401).json({ error: 'Invalid assigning user' });
    
    // Update the service with assignment details
    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      {
        assignedTo: laborId,
        assignedBy: req.user._id,
        assignedDate: new Date(),
        assignedToName: laborUser.name,
        assignedByName: assigningUser.name
      },
      { new: true }
    );
    
    res.json({ service: updatedService, message: 'Service assigned successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get services assigned to a specific labor worker
exports.getAssignedServices = async (req, res) => {
  try {
    const laborId = req.user._id; // Get from authenticated user
    const services = await Service.find({ assignedTo: laborId });
    res.json({ services });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all labor workers (for assignment dropdown)
exports.getLaborWorkers = async (req, res) => {
  try {
    const laborWorkers = await User.find({ role: 'Labor' }).select('_id name gmail');
    res.json({ laborWorkers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
