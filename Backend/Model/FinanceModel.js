const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const financeSchema = new Schema({
    description: { type: String, required: true },
    Project_Name: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, required: true, default: "Unpaid" },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    bankSlipPath: { type: String },
    stage: {
        type: String,
        enum: ["deposit", "balance", "full"],
        default: "full"
    },
    expectedAmount: { type: Number },
    paidAmount: { type: Number },
    paidAt: { type: Date },
    submittedBy: { type: Schema.Types.ObjectId, ref: "User" },
    source: {
        type: String,
        enum: ["admin", "client", "system"],
        default: "admin"
    }
});

module.exports = mongoose.model("FinanceModel", financeSchema)