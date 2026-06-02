const express = require("express");
const router = express.Router();
const ProjectController = require("../Controllers/ProjectController");
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/rbac");

// All project routes require a valid JWT
router.use(authMiddleware);

router.get("/", ProjectController.getAllProject);
router.get("/stats", ProjectController.getProjectStats);
router.get("/:id", ProjectController.getProjectById);
router.get("/:id/audit-logs", ProjectController.getProjectAuditLogs);
router.post("/", requireRole("Admin"), ProjectController.addProject);
router.put("/:id", ProjectController.updateProject);
router.delete("/:id", requireRole("Admin"), ProjectController.deleteProject);

module.exports = router;
