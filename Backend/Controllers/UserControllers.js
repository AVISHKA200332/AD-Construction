const User = require("../Model/UserModel");

// Get all users
const getAllUsers = async (req, res, next) => {
    try {
        let users = await User.find();
        
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }
        
        return res.status(200).json({ users });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while fetching users" });
    }
};

// Create new user
const bcrypt = require('bcrypt');
const addUsers = async (req, res, next) => {
    try {
        const { name, gmail, phone, role, age, address, password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        let user = new User({ name, gmail, phone, role, age, address, password: hashedPassword });
        await user.save();
        return res.status(200).json({ user });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while creating user" });
    }
};

// Get user by ID
const getById = async (req, res, next) => {
    try {
        const id = req.params.id;
        let user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        return res.status(200).json({ user });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while fetching user" });
    }
};

// Update user
const updateUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { name, gmail, phone, role, age, address, password } = req.body;
        let updateData = { name, gmail, phone, role, age, address };
        if (password && password.length >= 6) {
            updateData.password = await bcrypt.hash(password, 10);
        }
        let user = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: "Unable to Update User Details" });
        }
        return res.status(200).json({ user });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while updating user" });
    }
};

// Delete user
const deleteUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        let user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ message: "Unable to Delete User Details" });
        }

        return res.status(200).json({ user });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while deleting user" });
    }
};

exports.getAllUsers = getAllUsers;
exports.addUsers = addUsers;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;