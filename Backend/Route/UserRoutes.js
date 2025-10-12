const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/UserControllers");
const loginController = require("../Controllers/LoginController");

router.get("/", UserController.getAllUsers);
router.post("/", UserController.addUsers);
router.post("/login", loginController.login);
router.get("/:id", UserController.getById);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

module.exports = router;