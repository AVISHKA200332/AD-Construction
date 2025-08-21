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

module.exports = {
  getAllProject,
  addProject,
};
