const Project = require('../Model/ProjectModel');
const User = require('../Model/UserModel');
const Task = require('../Model/TaskModel');

// Site Manager: fetch only assigned projects (supports legacy mapping by projectManager.name)
exports.getSMProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const name = req.user?.name || '';
    const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const query = {
      $or: [
        { siteManager: userId },
        // legacy projects created without linking the user id
        ...(name ? [{ 'projectManager.name': { $regex: `^${esc(name)}$`, $options: 'i' } }] : [])
      ]
    };
    const projects = await Project.find(query).sort({ updatedAt: -1 });
    res.json({ success: true, projects });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch Site Manager projects', error: e.message });
  }
};

// Site Manager: assign a supervisor to a project they manage
exports.addSupervisorToProject = async (req, res) => {
  try {
    const { projectId, supervisorId } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    // Ownership rules:
    // 1) If siteManager is set, it must match current user
    // 2) Legacy projects: accept if projectManager.name matches current user's name (case-insensitive);
    //    and backfill siteManager if it is empty
    let isOwner = false;
    if (project.siteManager) {
      isOwner = String(project.siteManager) === String(req.user._id);
    }
    if (!isOwner) {
      const pmName = project?.projectManager?.name ? String(project.projectManager.name).toLowerCase() : '';
      const myName = req.user?.name ? String(req.user.name).toLowerCase() : '';
      if (pmName && myName && pmName === myName) {
        isOwner = true;
        if (!project.siteManager) {
          // Backfill linkage for future checks
          project.siteManager = req.user._id;
        }
      }
    }
    if (!isOwner) return res.status(403).json({ success: false, message: 'Not your project' });
    const user = await User.findById(supervisorId);
    if (!user || !['Site Supervisor', 'Supervisor'].includes(user.role)) {
      return res.status(400).json({ success: false, message: 'Supervisor user invalid' });
    }
    project.supervisors = project.supervisors || [];
    if (!project.supervisors.find(id => String(id) === String(supervisorId))) {
      project.supervisors.push(supervisorId);
    }
    await project.save();
    res.json({ success: true, project });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to add supervisor', error: e.message });
  }
};

// Site Supervisor: list projects they are assigned to
exports.getSSProjects = async (req, res) => {
  try {
    const uid = req.user._id;
    const projects = await Project.find({ supervisors: uid }).sort({ updatedAt: -1 });
    res.json({ success: true, projects });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch supervisor projects', error: e.message });
  }
};

// Site Supervisor: create task and assign laborers
exports.createTask = async (req, res) => {
  try {
    const { projectId, title, description, dueDate, laborerIds = [] } = req.body;
    // must be assigned supervisor on the project
    const project = await Project.findOne({ _id: projectId, supervisors: req.user._id });
    if (!project) return res.status(403).json({ success: false, message: 'Not assigned to this project' });
    const task = await Task.create({ project: projectId, title, description, dueDate, supervisor: req.user._id, laborers: laborerIds });
    res.status(201).json({ success: true, task });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to create task', error: e.message });
  }
};

// Supervisor: list tasks for their projects
exports.listMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ supervisor: req.user._id }).populate('project', 'name projectId');
    res.json({ success: true, tasks });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch tasks', error: e.message });
  }
};

// Supervisor: update task progress/status
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (String(task.supervisor) !== String(req.user._id)) return res.status(403).json({ success: false, message: 'Not your task' });
    const { title, description, status, progress, laborerIds, logNote } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (progress !== undefined) task.progress = Math.max(0, Math.min(100, Number(progress)));
    if (Array.isArray(laborerIds)) task.laborers = laborerIds;
    if (logNote) task.workLogs.push({ note: logNote, createdBy: req.user._id });
    await task.save();
    res.json({ success: true, task });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update task', error: e.message });
  }
};

// Labor: list only tasks assigned to them
exports.myAssignedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ laborers: req.user._id }).populate('project', 'name projectId');
    res.json({ success: true, tasks });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch my tasks', error: e.message });
  }
};

// Labor: mark a task complete that they are assigned to
exports.completeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id, laborers: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found or not assigned' });
    task.status = 'Completed';
    task.progress = 100;
    task.workLogs.push({ note: 'Marked complete by labor', createdBy: req.user._id });
    await task.save();
    res.json({ success: true, task });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to complete task', error: e.message });
  }
};

// Client: view projects linked to them + summarized progress
exports.clientProjects = async (req, res) => {
  try {
    const projects = await Project.find({ clients: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, projects });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch client projects', error: e.message });
  }
};
