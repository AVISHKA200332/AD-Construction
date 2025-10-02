// Model/BuyerInventoryItem.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Enumerations aligned with UI and InventoryItem model
const TYPE_ENUM = [
  "Cement",
  "Granite",
  "Sand",
  "Concrete Blocks",
  "Steel Bars",
  "Bricks",
  "Tiles",
  "Paint",
  "Other Construction Material",
];
const METRIC_ENUM = [
  "Bags",
  "Tons",
  "Cubes",
  "Packets",
  "Count",
  "Liters",
  "Pieces",
  "Kg",
  "Other",
];

const LineItemSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: TYPE_ENUM,
    },
    metric: {
      type: String,
      required: true,
      enum: METRIC_ENUM,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    seller: {
      type: String,
      trim: true,
      default: "",
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

const buyerOrderSchema = new Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
      trim: true,
    },
    items: {
      type: [LineItemSchema],
      validate: [(arr) => arr && arr.length > 0, "At least one line item is required"],
      default: [],
    },
    orderTotal: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

function computeOrderTotals(next) {
  // compute each lineTotal and overall orderTotal
  if (Array.isArray(this.items)) {
    let sum = 0;
    this.items = this.items.map((li) => {
      const qty = Number(li.amount || 0);
      const price = Number(li.unitPrice || 0);
      const lt = Math.max(0, qty * price);
      return { ...(li.toObject?.() ?? li), lineTotal: lt };
    });
    sum = this.items.reduce((acc, li) => acc + Number(li.lineTotal || 0), 0);
    this.orderTotal = Math.max(0, sum);
  } else {
    this.orderTotal = 0;
  }
  next && next();
}

buyerOrderSchema.pre("validate", computeOrderTotals);
buyerOrderSchema.pre("save", computeOrderTotals);

module.exports = mongoose.model("BuyerInventoryItem", buyerOrderSchema);
