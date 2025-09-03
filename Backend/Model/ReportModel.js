const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportSchema = new Schema({
    project_Id:{ type:String, required:true },//dataType, validate
    record_Type:{ type:String, required:true },
    party_Name:{ type:String, required:true },
    amount:{ type:Number, required:true },
    date:{ type:Date, default:Date.now },
    status:{ type:String, required:true },
    description:{ type:String, required:true },
    bank_Slip_Ref_No:{ type:String, required:true }
});

module.exports = mongoose.model("ReportModel", reportSchema) //file_name, function_name