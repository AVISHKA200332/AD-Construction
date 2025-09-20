const Project = require("../Model/ProjectModel");

// Get all projects
const getAllProject = async (req, res, next) => {
  try {
    const projects = await Project.find();

    if (!projects || projects.length === 0) {
      return res.status(404).json({ message: "No project found" });
    }

    return res.status(200).json({ projects });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error retrieving projects" });
  }
};

// Get project by ID
const getProjectById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json({ project });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error retrieving project" });
  }
};

// Add new project
const addProject = async (req, res, next) => {
  const { name, client, status, startDate, endDate, budget, completion } =
    req.body;

  try {
    const project = new Project({
      name,
      client,
      status,
      startDate,
      endDate,
      budget,
      completion,
    });

    await project.save();
    return res.status(201).json({ project });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to add project" });
  }
};

// Update project
const updateProject = async (req, res, next) => {
  const { id } = req.params;
  const { name, client, status, startDate, endDate, budget, completion } =
    req.body;

  try {
    const project = await Project.findByIdAndUpdate(
      id,
      {
        name,
        client,
        status,
        startDate,
        endDate,
        budget,
        completion,
      },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json({ project });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to update project" });
  }
};

// Delete project
const deleteProject = async (req, res, next) => {
  const { id } = req.params;

  try {
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to delete project" });
  }
};

module.exports = {
  getAllProject,
  getProjectById,
  addProject,
  updateProject,
  deleteProject,
};


