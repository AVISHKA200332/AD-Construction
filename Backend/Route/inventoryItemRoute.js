// Routes/inventoryItemRoute.js
const express = require("express");
const router = express.Router();
const InventoryItemController = require("../Controllers/InventoryItemController.js");

// List + create
router.get("/", InventoryItemController.getAllItems);
router.post("/", InventoryItemController.addItems);

// Read/Update/Delete
router.get("/:id", InventoryItemController.getItemById);
router.put("/:id", InventoryItemController.updateItem);
router.delete("/:id", InventoryItemController.deleteItem);

// New actions
router.patch("/:id/restock", InventoryItemController.restockItem);
router.patch("/:id/order", InventoryItemController.orderItem);

module.exports = router;
