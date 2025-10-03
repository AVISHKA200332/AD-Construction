const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const fs = require("fs");

//Insert Model
const Finance = require("../Model/FinanceModel");
//Insert Report Controller
const FinanceControllers = require("../Controllers/FinanceControllers");

const uploadDirectory = path.join(__dirname, "../uploads/bank-slips");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `finance-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

router.get("/",FinanceControllers.getAllFinance);
router.post("/",FinanceControllers.addFinance);
router.get("/:id",FinanceControllers.getById);
router.put("/:id",FinanceControllers.updateFinance);
router.delete("/:id",FinanceControllers.deleteFinance);

//export
module.exports = router;