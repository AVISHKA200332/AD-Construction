const Report = require("../Model/ReportModel");

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

exports.getAllReports = getAllReports;