const Report = require("../Model/ReportModel");

// display data
const getAllReports = async (req, res, next) => {
    
    let report;
    // Get All Reports
    try{
        report = await Report.find();
    }catch (err){
        console.log(err);
    }

    // not found reports
    if(!report){
        return res.status(404).json({message:"Report not found"});
    }

    // display all reports
    return res.status(200).json({ report });
};

// insert data
const addReports = async (req, res, next) => {

    const {project_Id,record_Type,party_Name,amount,date,status,description,bank_Slip_Ref_No} = req.body;

    let report;

    try {
        report = new Report({project_Id,record_Type,party_Name,amount,date,status,description,bank_Slip_Ref_No});
        await report.save();
    }catch (err) {
        console.log(err);
    }

    // if not insert reports
    if (!report){
        return res.status(404).json({message:"Unable to add reports"});
    }
    return res.status(200).json({report});
};

//get by id
const getById = async (req, res, next) => {

    const report_Id = req.params.id;

    let report;

    try {
        report = await Report.findById(report_Id);
    }catch (err) {
        console.log(err);
    }

    // not available reports
    if(!report){
        return res.status(404).json({message:"Report not found"});
    }
    return res.status(200).json({report});
}

//update report details
const updateReport = async (req, res, next) => {

    const report_Id = req.params.id;
    const {project_Id,record_Type,party_Name,amount,date,status,description,bank_Slip_Ref_No} = req.body;

    let report;

    try {
        report = await Report.findByIdAndUpdate(report_Id, 
         { project_Id: project_Id, record_Type: record_Type, party_Name: party_Name, amount: amount, date: date, status: status, description: description, bank_Slip_Ref_No: bank_Slip_Ref_No});
         report = await report.save();
    }catch(err) {
        console.log(err);
    }
    // can not update reports
    if(!report){
        return res.status(404).json({message:"Unable to update Report Details"});
    }
    return res.status(200).json({report});
}

//delete report details
const deleteReport = async (req, res, next) => {
    const report_Id = req.params.id;

    let report;

    try{
        report = await Report.findByIdAndDelete(report_Id);
    }catch (err) {
        console.log(err);
    }
    if(!report){
        return res.status(404).json({message:"Unable to delete Report Details"});
    }
    return res.status(200).json({report});
}

exports.getAllReports = getAllReports;
exports.addReports = addReports;
exports.getById = getById;
exports.updateReport = updateReport;
exports.deleteReport = deleteReport;