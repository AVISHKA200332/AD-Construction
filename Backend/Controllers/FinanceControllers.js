const Finance = require("../Model/FinanceModel");

// display data
const getAllFinance = async (req, res, next) => {
    
    let finance;
    // Get All Finance
    try{
        finance = await Finance.find();
    }catch (err){
        console.log(err);
    }

    // not found finance
    if(!finance){
        return res.status(404).json({message:"Finance data not found"});
    }

    // display all reports
    return res.status(200).json({ finance });
};

// insert data
const addFinance = async (req, res, next) => {

    const {description,Project_Name,category,amount,date,status} = req.body;

    let finance;

    try {
        finance = new Finance({description,Project_Name,category,amount,date,status});
        await finance.save();
    }catch (err) {
        console.log(err);
    }

    // if not insert finance data
    if (!finance){
        return res.status(404).json({message:"Unable to add finance data"});
    }
    return res.status(200).json({finance});
};

//get by id
const getById = async (req, res, next) => {

    const finance_Id = req.params.id;

    let finance;

    try {
        finance = await Finance.findById(finance_Id);
    }catch (err) {
        console.log(err);
    }

    // not available finance data
    if(!finance){
        return res.status(404).json({message:"Finance data not found"});
    }
    return res.status(200).json({finance});
}

//update finance details
const updateFinance = async (req, res, next) => {

    const finance_Id = req.params.id;
    const {description,Project_Name,category,amount,date,status} = req.body;

    let finance;

    try {
        finance = await Finance.findByIdAndUpdate(finance_Id, 
         { description: description,Project_Name: Project_Name,category: category,amount: amount,date: date,status: status});
         finance = await finance.save();
    }catch(err) {
        console.log(err);
    }
    // can not update reports
    if(!finance){
        return res.status(404).json({message:"Unable to update Finance Details"});
    }
    return res.status(200).json({finance});
}

//delete report details
const deleteFinance = async (req, res, next) => {
    const finance_Id = req.params.id;

    let finance;

    try{
        finance = await Finance.findByIdAndDelete(finance_Id);
    }catch (err) {
        console.log(err);
    }
    if(!finance){
        return res.status(404).json({message:"Unable to delete Finance Details"});
    }
    return res.status(200).json({finance});
}

exports.getAllFinance = getAllFinance;
exports.addFinance = addFinance;
exports.getById = getById;
exports.updateFinance = updateFinance;
exports.deleteFinance = deleteFinance;