const Project = require("../Model/ProjectModel");

// Helper function to get client IP
const getClientIP = (req) => {
  return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
};

// Helper function to add audit log
const addAuditLog = async (project, action, field, oldValue, newValue, req) => {
  try {
    // Ensure project exists and has auditLog array
    if (!project) {
      console.error('Cannot add audit log: project is null or undefined');
      return;
    }

    // Initialize auditLog if it doesn't exist
    if (!project.auditLog) {
      project.auditLog = [];
    }

    await project.addAuditLog(
      action,
      field,
      oldValue,
      newValue,
      req.user?.name || 'System',
      getClientIP(req)
    );
  } catch (error) {
    console.error('Error adding audit log:', error);
  }
};

// Get all projects with enhanced filtering and pagination
const getAllProject = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      search,
      clientName,
      clientEmail,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

  // Build filter object
  const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { client: { $regex: search, $options: 'i' } },
        { 'projectManager.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Client-assignment filters
    if (clientName) {
      filter.client = { $regex: clientName, $options: 'i' };
    }
    if (clientEmail) {
      filter['clientContact.email'] = { $regex: `^${clientEmail}$`, $options: 'i' };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const projects = await Project.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-auditLog'); // Exclude audit logs from main query for performance

    const total = await Project.countDocuments(filter);

    // Note: Audit logging for list views is disabled for performance reasons
    // since we exclude auditLog from the main query

    return res.status(200).json({ 
      projects,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error retrieving projects" });
  }
};

// Get project by ID with audit logging
const getProjectById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Note: RBAC for project access is enforced via separate role-ops endpoints to avoid changing existing admin flows

    // Add audit log for view action
    await addAuditLog(project, 'VIEW', 'single', null, `Project ${project.projectId} viewed`, req);

    return res.status(200).json({ project });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error retrieving project" });
  }
};

// Get project statistics (60-30-10 rule implementation)
const getProjectStats = async (req, res, next) => {
  try {
    const stats = await Project.getProjectStats();
    
    if (stats.length === 0) {
      return res.status(200).json({ 
        total: 0,
        distribution: []
      });
    }

    const data = stats[0];
    
    return res.status(200).json({
      total: data.total,
      distribution: data.distribution
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error retrieving project statistics" });
  }
};

// Add new project with comprehensive validation
const addProject = async (req, res, next) => {
  try {
    // Note: Creation permissions are handled at the router level for admin flows; preserving existing behavior
    // Validate required fields
    const requiredFields = ['name', 'client', 'startDate', 'endDate', 'budget'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields 
      });
    }

    // Additional validation
    const { startDate, endDate, budget } = req.body;
    
    // Check if start date is from today onwards
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(startDate) < today) {
      return res.status(400).json({ 
        message: "Start date must be from today onwards" 
      });
    }

    // Check if end date is after start date
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ 
        message: "End date must be after start date" 
      });
    }

    // Check budget range
    if (budget < 100000 || budget > 1000000000) {
      return res.status(400).json({ 
        message: "Budget must be between Rs. 100,000 and Rs. 1,000,000,000" 
      });
    }

    const project = new Project(req.body);
    await project.save();

    // Add audit log for creation
    await addAuditLog(project, 'CREATE', 'project', null, `Project ${project.projectId} created`, req);

    return res.status(201).json({ 
      project,
      message: "Project created successfully"
    });
  } catch (err) {
    console.error(err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: "Validation failed",
        errors 
      });
    }

    return res.status(500).json({ message: "Unable to add project" });
  }
};

// Update project with audit logging
const updateProject = async (req, res, next) => {
  const { id } = req.params;

  try {
    console.log('Update request for project ID:', id);
    console.log('Update data:', req.body);
    const existingProject = await Project.findById(id);
    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Note: Update permissions are not altered here to avoid impacting existing admin flows

    // Store old values for audit log
    const oldValues = {
      name: existingProject.name,
      client: existingProject.client,
      status: existingProject.status,
      budget: existingProject.budget,
      completion: existingProject.completion,
      priority: existingProject.priority,
      startDate: existingProject.startDate,
      endDate: existingProject.endDate
    };

    // Update the project
    const project = await Project.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found after update" });
    }

    // Add audit log for each changed field
    for (const [field, oldValue] of Object.entries(oldValues)) {
      if (req.body[field] !== undefined && req.body[field] !== oldValue) {
        try {
          await addAuditLog(project, 'UPDATE', field, oldValue, req.body[field], req);
        } catch (auditError) {
          console.error('Audit log error:', auditError);
          // Continue with the update even if audit logging fails
        }
      }
    }

    return res.status(200).json({ 
      project,
      message: "Project updated successfully"
    });
  } catch (err) {
    console.error('Update project error:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: "Validation failed",
        errors 
      });
    }

    // Handle specific MongoDB errors
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        message: "Invalid project ID format" 
      });
    }

    return res.status(500).json({ 
      message: "Unable to update project",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Delete project with audit logging
const deleteProject = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Note: Delete permissions unchanged here to preserve existing behavior
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Add audit log before deletion
    await addAuditLog(project, 'DELETE', 'project', project.projectId, 'Project deleted', req);

    await Project.findByIdAndDelete(id);

    return res.status(200).json({ 
      message: "Project deleted successfully",
      deletedProjectId: project.projectId
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to delete project" });
  }
};

// Get audit logs for a project
const getProjectAuditLogs = async (req, res, next) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id).select('auditLog projectId name');
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json({ 
      projectId: project.projectId,
      projectName: project.name,
      auditLogs: project.auditLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error retrieving audit logs" });
  }
};

module.exports = {
  getAllProject,
  getProjectById,
  getProjectStats,
  addProject,
  updateProject,
  deleteProject,
  getProjectAuditLogs,
};

// Fetch all projects assigned to a specific client (by name or email)
const getProjectsByClient = async (req, res) => {
  try {
    const { clientName, clientEmail } = req.query;
    if (!clientName && !clientEmail) {
      return res.status(400).json({ message: "clientName or clientEmail is required" });
    }
    const filter = {};
    if (clientName) filter.client = { $regex: clientName, $options: 'i' };
    if (clientEmail) filter['clientContact.email'] = { $regex: `^${clientEmail}$`, $options: 'i' };
    const projects = await Project.find(filter).select('-auditLog').sort({ createdAt: -1 });
    return res.status(200).json({ projects });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error retrieving client projects" });
  }
};

module.exports.getProjectsByClient = getProjectsByClient;


