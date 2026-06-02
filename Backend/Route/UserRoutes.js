const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/UserControllers");
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/rbac");

router.use(authMiddleware);

router.get("/directory", UserController.getUserDirectory);
router.get("/", requireRole("Admin"), UserController.getAllUsers);
router.post("/", requireRole("Admin"), UserController.addUsers);
router.get("/:id", UserController.getById);
router.put("/:id", UserController.updateUser);
router.delete("/:id", requireRole("Admin"), UserController.deleteUser);

module.exports = router;
