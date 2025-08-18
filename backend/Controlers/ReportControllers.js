const Report = require("../Model/ReportModel");

// display data
const getAllReports = async (req, res, next) => {
    
    let Reports;
    // Get All Reports
    try{
        reports = await Report.find();
    }catch (err){
        console.log(err);
    }

    // not found reports
    if(!reports){
        return res.status(404).json({message:"Report not found"});
    }

    // display all reports
    return res.status(200).json({ reports });
};

// insert data
const addReports = async (req, res, next) => {

    const {project_Id,record_Type,party_Name,amount,date,status,description,bank_Slip_Ref_No} = req.body;

    let reports;

    try {
        reports = new Report({project_Id,record_Type,party_Name,amount,date,status,description,bank_Slip_Ref_No});
        await reports.save();
    }catch (err) {
        console.log(err);
    }

    // if not insert reports
    if (!reports){
        return res.status(404).json({message:"Unable to add reports"});
    }
    return res.status(200).json({reports});
};

exports.getAllReports = getAllReports;
exports.addReports = addReports;