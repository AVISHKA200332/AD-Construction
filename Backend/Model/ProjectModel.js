const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    client: {
        type: String,
        required: true,
    },
    budget: {
        type: Number,
        required: true,
    }
});

module.exports = mongoose.model("Project", projectSchema);
