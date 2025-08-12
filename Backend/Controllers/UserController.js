const User = require("../Model/UserModel");

//data Display
const getAllUsers = async (req, res, next) => {
    let users;

    // Get all users
    try {
        users = await User.find();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error retrieving users" });
    }

    // Not found
    if (!users || users.length === 0) {
        return res.status(404).json({ message: "No users found" });
    }

    // Display all users
    return res.status(200).json({ users });
};


//data Insert
const addUsers = async (req, res, next) => {
    const {name, age, gmail, address} = req.body;

    let users;

    try{
        users = new User({name, age, gmail, address});
        await users.save();
    }catch (err) {
        console.log(err);
    }
    //not insert users
    if(!users){
        return req.status(404).send({message: "unable to add users"});
    }
    return res.status(200).json({ users });
};

//Get by ID
const getById = async (req, res, next) => {
    const id = req.params.id;

    let users;

    try{
        users = await User.findById(id);
    }catch (err){
        console.log(err);
    }
    //not available users
    if(!users){
        return res.status(404).send({message: "User not found"});
    }
    return res.status(200).json({ users });
};

//Update User Details
const updateUser = async (req, res, next) => {
    const id = req.params.id;
    const {name, age, gmail, address} = req.body;

    let users;

    try{
        users = await User.findByIdAndUpdate(id, {name: name, gmail: gmail, age: age, address: address});
        users = await users.save();
    }catch(err) {
        console.log(err);
    }
    //not update details
    if(!users){
        return res.status(404).send({message: "Unable to Update User Details"});
    }
    return res.status(200).json({ users });
};

//Delete User Details
const deleteUser = async (req, res, next) => {
    const id = req.params.id;

    let users;

    try{
        users = await User.findByIdAndDelete(id);
    }catch(err) {
        console.log(err);
    }
     //not delete
    if(!users){
        return res.status(404).send({message: "Unable to delete User Details"});
    }
    return res.status(200).json({ users });
};

exports.getAllUsers = getAllUsers;
exports.addUsers = addUsers;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
