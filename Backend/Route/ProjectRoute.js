const express = require("express");
const router = express.Router();
//Insert Model
const Project = require("../Model/ProjectModel");
//Insert Project Controller
const ProjectController = require("../Controllers/ProjectController");

// Project routes

router.get("/", ProjectController.getAllProject);
router.get("/stats", ProjectController.getProjectStats);
router.get("/:id", ProjectController.getProjectById);
router.get("/:id/audit-logs", ProjectController.getProjectAuditLogs);
router.post("/", ProjectController.addProject);
router.put("/:id", ProjectController.updateProject);
router.delete("/:id", ProjectController.deleteProject);

//export
module.exports = router;
