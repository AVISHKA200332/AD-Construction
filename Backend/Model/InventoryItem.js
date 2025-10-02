// Model/InventoryItem.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const inventoryItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "Cement",
        "Granite",
        "Sand",
        "Concrete Blocks",
        "Steel Bars",
        "Bricks",
        "Tiles",
        "Paint",
        "Other Construction Material"
      ],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    seller: {
      type: String,
      required: true,
      trim: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    metric: {
      type: String,
      default: "Other",
      trim: true,
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["active", "archived", "out_of_stock"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Auto-adjust status based on stock
inventoryItemSchema.pre("save", function nextStatus(next) {
  if (this.amount === 0 && this.status !== "archived") {
    this.status = "out_of_stock";
  } else if (this.amount > 0 && this.status === "out_of_stock") {
    this.status = "active";
  }
  next();
});

module.exports = mongoose.model("InventoryItem", inventoryItemSchema);
