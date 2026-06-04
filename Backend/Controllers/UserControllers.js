const User = require("../Model/UserModel");
const {
    canViewUser,
    canUpdateUser,
    isAdmin,
} = require("../utils/accessControl");

// Get all users with pagination (Admin only — enforced on route)
const getAllUsers = async (req, res, next) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search = '', 
            role = '', 
            sortBy = 'createdAt', 
            sortOrder = 'desc' 
        } = req.query;

        // Convert to numbers
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build query conditions
        let query = {};
        
        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { gmail: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Role filter
        if (role) {
            query.role = role;
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Get total count for pagination info
        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limitNum);

        // Get users with pagination
        const users = await User.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .select('-password'); // Exclude password field

        return res.status(200).json({ 
            users,
            currentPage: pageNum,
            totalPages,
            totalUsers,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while fetching users" });
    }
};

// Create new user (Admin only — enforced on route)
const addUsers = async (req, res, next) => {
    try {
        const { name, gmail, phone, role, age, address, password, profileImage } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        // Don't hash password here - let the UserModel pre-save hook handle it
        let user = new User({ name, gmail, phone, role, age, address, password });
        await user.save();
        const safe = user.toObject();
        delete safe.password;
        return res.status(200).json({ user: safe });
    } catch (err) {
        return res.status(500).json({ message: "Server error while creating user" });
    }
};

// Get user by ID
const getById = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!canViewUser(req.user, id)) {
            return res.status(403).json({ message: "Forbidden: You can only view your own profile." });
        }
        let user = await User.findById(id).select("-password");
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
        if (!canUpdateUser(req.user, id)) {
            return res.status(403).json({ message: "Forbidden: You can only update your own profile." });
        }
        const { name, gmail, phone, role, age, address, password } = req.body;
        let user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (name) user.name = name;
        if (gmail) user.gmail = gmail;
        if (phone) user.phone = phone;
        if (role && isAdmin(req.user)) user.role = role;
        if (age !== undefined) user.age = age;
        if (address) user.address = address;
        if (password && password.length >= 6) {
            user.password = password; // Let pre-save hook handle hashing
        }
        // Handle profile image upload
        if (req.file) {
            user.profileImage = `/uploads/profileImages/${req.file.filename}`;
        } else if (req.body.profileImage) {
            user.profileImage = req.body.profileImage;
        }
        // Save the user (this will trigger updatedAt update and password hashing if needed)
        await user.save();
        const safe = user.toObject();
        delete safe.password;
        return res.status(200).json({ user: safe });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while updating user" });
    }
};

// Delete user (Admin only — enforced on route)
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

// Minimal user list for messaging / compose (any authenticated user)
const getUserDirectory = async (req, res) => {
    try {
        const { role, search } = req.query;
        const query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { gmail: { $regex: search, $options: "i" } },
            ];
        }
        const users = await User.find(query)
            .select("name gmail role")
            .sort({ name: 1 })
            .lean();
        return res.status(200).json({ users });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while fetching user directory" });
    }
};

exports.getAllUsers = getAllUsers;
exports.getUserDirectory = getUserDirectory;
exports.addUsers = addUsers;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;