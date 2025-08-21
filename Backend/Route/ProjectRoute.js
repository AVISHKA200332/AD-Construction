const express = require("express");
const router = express.Router();
//Insert Model
const Project = require("../Model/ProjectModel");
//Insert Project Controller
const ProjectController = require("../Controllers/ProjectController");

// Now responds to GET /users

router.get("/",ProjectController.getAllProject);
router.post("/", ProjectController.addProject);
//router.get('/:id', ProjectController.getById);
//router.put('/:id', ProjectController.updateUser);
//router.delete('/:id', ProjectController.deleteUser);

//export
module.exports = router;
