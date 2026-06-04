const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const FinanceControllers = require("../Controllers/FinanceControllers");
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/rbac");

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
  },
});

const upload = multer({ storage });

router.use(authMiddleware);

const financeReaders = requireRole("Admin", "Project Manager", "Site Manager");
const financeWriters = requireRole("Admin");

router.get("/", financeReaders, FinanceControllers.getAllFinance);
router.get("/:id", financeReaders, FinanceControllers.getById);
router.post("/", financeWriters, upload.single("bankSlip"), FinanceControllers.addFinance);
router.put("/:id", financeWriters, upload.single("bankSlip"), FinanceControllers.updateFinance);
router.delete("/:id", financeWriters, FinanceControllers.deleteFinance);

module.exports = router;
