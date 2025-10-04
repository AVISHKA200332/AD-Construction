const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const controller = require("../Controllers/ClientFinanceController");

const router = express.Router();

const uploadDirectory = path.join(__dirname, "../uploads/bank-slips");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `finance-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

router.use(authMiddleware);

router.get("/projects", controller.listProjects);
router.post("/invoice", upload.single("bankSlip"), controller.submitPayment);

module.exports = router;
