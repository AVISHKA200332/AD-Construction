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

    const {project_Id,record_Type,party_Name,amount,date,status,description,bank_Slip_Ref_No} = req.body;

    let finance;

    try {
        finance = new Finance({project_Id,record_Type,party_Name,amount,date,status,description,bank_Slip_Ref_No});
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
    const {project_Id,record_Type,party_Name,amount,date,status,description,bank_Slip_Ref_No} = req.body;

    let finance;

    try {
        finance = await Finance.findByIdAndUpdate(finance_Id, 
         { project_Id: project_Id, record_Type: record_Type, party_Name: party_Name, amount: amount, date: date, status: status, description: description, bank_Slip_Ref_No: bank_Slip_Ref_No});
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