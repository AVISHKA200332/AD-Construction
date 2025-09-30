const express = require("express");
const router = express.Router();
//Insert Model
const Finance = require("../Model/FinanceModel");
//Insert Report Controller
const FinanceControllers = require("../Controllers/FinanceControllers");

router.get("/",FinanceControllers.getAllFinance);
router.post("/",FinanceControllers.addFinance);
router.get("/:id",FinanceControllers.getById);
router.put("/:id",FinanceControllers.updateFinance);
router.delete("/:id",FinanceControllers.deleteFinance);

//export
module.exports = router;