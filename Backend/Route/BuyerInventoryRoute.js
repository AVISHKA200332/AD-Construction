const express = require("express");
const ctrl = require("../Controllers/BuyerInventoryController");

const router = express.Router();

// GET /buyer-items
router.get("/", ctrl.list);

// POST /buyer-items
router.post("/", ctrl.create);

// GET /buyer-items/:id
router.get("/:id", ctrl.getById);

// PUT /buyer-items/:id
router.put("/:id", ctrl.update);

// DELETE /buyer-items/:id
router.delete("/:id", ctrl.remove);

module.exports = router;
