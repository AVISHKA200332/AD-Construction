const User = require("../Model/UserModel");


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

        
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

       
        let query = {};
        
       
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { gmail: { $regex: search, $options: 'i' } }
            ];
        }
        
       
        if (role) {
            query.role = role;
        }

        
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        
        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limitNum);

       
        const users = await User.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .select('-password'); 

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


const addUsers = async (req, res, next) => {
    try {
        const { name, gmail, phone, role, age, address, password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
       
        let user = new User({ name, gmail, phone, role, age, address, password });
        await user.save();
        return res.status(200).json({ user });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while creating user" });
    }
};


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


const updateUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { name, gmail, phone, role, age, address, password } = req.body;
        
        
        let user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        
        if (name) user.name = name;
        if (gmail) user.gmail = gmail;
        if (phone) user.phone = phone;
        if (role) user.role = role;
        if (age !== undefined) user.age = age;
        if (address) user.address = address;
        if (password && password.length >= 6) {
            user.password = password; 
        }

        
        await user.save();

        return res.status(200).json({ user });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while updating user" });
    }
};


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