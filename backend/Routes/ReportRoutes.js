const express = require("express");
const router = express.Router();
//Insert Model
const Report = require("../Model/ReportModel");
//Insert Report Controller
const ReportController = require("../Controlers/ReportControllers");

router.get("/",ReportController.getAllReports);

//export
module.exports = router;