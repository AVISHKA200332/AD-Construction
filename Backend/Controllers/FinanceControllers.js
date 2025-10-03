const Finance = require("../Model/FinanceModel");

// display data
const getAllFinance = async (req, res, next) => {
    const { projectId } = req.query;

    try{
        const query = projectId ? { project: projectId } : {};
        const finance = await Finance.find(query).sort({ date: -1 });

        return res.status(200).json({ finance: finance || [] });
    }catch (err){
        // faild to load finance data
        console.log(err);
        return res.status(500).json({message:"Failed to load finance data"});
    }
};

// insert data
const addFinance = async (req, res, next) => {

    const {description,Project_Name,category,amount,date,status,project} = req.body;
    const bankSlipPath = req.file ? `/uploads/bank-slips/${req.file.filename}` : req.body.bankSlipPath;

    try {
        const finance = new Finance({description,Project_Name,category,amount,date,status,project,bankSlipPath});
        await finance.save();
        return res.status(201).json({finance});
    }catch (err) {
        console.log(err);
        return res.status(500).json({message:"Unable to add finance data"});
    }
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
    const bankSlipPath = req.file ? `/uploads/bank-slips/${req.file.filename}` : req.body.bankSlipPath;

    let finance;

    try {
        finance = await Finance.findById(finance_Id);

        if(!finance){
            return res.status(404).json({message:"Finance data not found"});
        }

        finance.description = description;
        finance.Project_Name = Project_Name;
        finance.category = category;
        finance.amount = amount;
        finance.date = date;
        finance.status = status;

        if (bankSlipPath) {
            finance.bankSlipPath = bankSlipPath;
        }

        await finance.save();
    }catch(err) {
        console.log(err);
        return res.status(500).json({message:"Unable to update Finance Details"});
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