// Controllers/InventoryItemController.js
const InventoryItem = require("../Model/InventoryItem");

// Build a Mongo filter from query params
function buildFilter(query) {
  const { q, type, status, minStock, maxStock } = query;
  const filter = {};

  if (q) {
    // search by name or seller (case-insensitive)
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { seller: { $regex: q, $options: "i" } },
    ];
  }

  if (type) filter.type = type;
  if (status) filter.status = status;

  // stock range
  if (minStock !== undefined || maxStock !== undefined) {
    filter.amount = {};
    if (minStock !== undefined) filter.amount.$gte = Number(minStock);
    if (maxStock !== undefined) filter.amount.$lte = Number(maxStock);
  }

  return filter;
}

function buildSort(sortParam) {
  // e.g. "createdAt:desc,name:asc"
  // defaults to createdAt desc
  if (!sortParam) return { createdAt: -1 };

  const parts = sortParam.split(",").map((p) => p.trim());
  const sort = {};
  parts.forEach((p) => {
    const [field, dir = "asc"] = p.split(":");
    sort[field] = dir.toLowerCase() === "desc" ? -1 : 1;
  });
  return sort;
}

// Get all items (with filters/search/sort)
exports.getAllItems = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const sort = buildSort(req.query.sort);

    const listings = await InventoryItem.find(filter).sort(sort);
    return res.status(200).json(listings);
  } catch (err) {
    console.error("Error in getAllItems:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Create new item
exports.addItems = async (req, res) => {
  try {
    const { name, type, amount, seller, unitPrice, currency, status } = req.body;

    if (!name || !type || amount === undefined || unitPrice === undefined || !seller) {
      return res
        .status(400)
        .json({ message: "Name, Type, Amount, Unit Price & Seller are required!" });
    }

    const newItem = await InventoryItem.create({
      name,
      type,
      amount,
      seller,
      unitPrice,
      currency,
      status,
    });

    return res.status(201).json({ message: "Item created", item: newItem });
  } catch (err) {
    console.error("Error in addItems:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    return res.status(200).json(item);
  } catch (err) {
    console.error("Error in getItemById:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const updatedItem = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    return res.status(200).json({ message: "Item updated", item: updatedItem });
  } catch (err) {
    console.error("Error in updateItem:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const deletedItem = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    return res.status(200).json({ message: "Item deleted" });
  } catch (err) {
    console.error("Error in deleteItem:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Inventory statistics
exports.getStats = async (req, res) => {
  try {
    const items = await InventoryItem.find({});
    const totalItems = items.length;
    const totalValue = items.reduce((sum, it) => sum + (it.unitPrice * it.amount), 0);
    const lowStock = items.filter(i => i.amount > 0 && i.amount < 10).length;
    const outOfStock = items.filter(i => i.amount === 0).length;
    return res.status(200).json({ totalItems, totalValue, lowStock, outOfStock });
  } catch (err) {
    console.error('Error in getStats:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Restock item (increase amount)
exports.restockItem = async (req, res) => {
  try {
    const { amount } = req.body;
    const qty = Number(amount);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.amount += qty;
    await item.save();

    return res.status(200).json({ message: "Item restocked", item });
  } catch (err) {
    console.error("Error in restockItem:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Order item (decrease amount)
exports.orderItem = async (req, res) => {
  try {
    const { amount } = req.body;
    const qty = Number(amount);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.amount - qty < 0) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    item.amount -= qty;
    await item.save();

    return res.status(200).json({ message: "Item ordered", item });
  } catch (err) {
    console.error("Error in orderItem:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
