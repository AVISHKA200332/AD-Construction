const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const financeSchema = new Schema({
    description:{ type:String, required:true },
    Project_Name:{ type:String, required:true },
    category:{ type:String, required:true },
    amount:{ type:Number, required:true },
    date:{ type:Date, default:Date.now },
    status:{ type:String, required:true },
});

module.exports = mongoose.model("FinanceModel", financeSchema) 