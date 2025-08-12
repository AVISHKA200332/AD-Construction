const express = require("express");
const router = express.Router();
//Insert Model
const User = require("../Model/UserModel");
//Insert User Controller
const UserController = require("../Controllers/UserController");

// Now responds to GET /users
router.get('/', UserController.getAllUsers);
router.post('/', UserController.addUsers);
router.get('/:id', UserController.getById);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

//export
module.exports = router;
