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

exports.getAllReports = getAllReports;
exports.addReports = addReports;
exports.getById = getById;