const BuyerInventoryItem = require("../Model/BuyerInventoryModel");

// Build Mongo filters from query params
function buildFilters(query) {
  const { q, type, metric, minPrice, maxPrice } = query;
  const filters = {};

  if (q) {
    filters.$or = [
      { customerName: { $regex: q, $options: "i" } },
      { "items.type": { $regex: q, $options: "i" } },
      { "items.metric": { $regex: q, $options: "i" } },
    ];
  }
  if (type) filters.items = { ...(filters.items || {}), $elemMatch: { type } };
  if (metric) filters.items = { ...(filters.items || {}), $elemMatch: { ...(filters.items?.$elemMatch || {}), metric } };

  // Filter by unitPrice range across any line item
  const price = {};
  if (minPrice !== undefined && minPrice !== "") price.$gte = Number(minPrice);
  if (maxPrice !== undefined && maxPrice !== "") price.$lte = Number(maxPrice);
  if (Object.keys(price).length) {
    filters.items = {
      ...(filters.items || {}),
      $elemMatch: { ...(filters.items?.$elemMatch || {}), unitPrice: price },
    };
  }

  return filters;
}

function buildSort(sortParam) {
  // sort looks like: "createdAt:desc" or "name:asc"
  const sort = {};
  const param = sortParam || "createdAt:desc";
  const [field, dir] = param.split(":");
  sort[field] = dir === "asc" ? 1 : -1;
  return sort;
}

// Create a buyer inventory item
exports.create = async (req, res) => {
  try {
    const item = await BuyerInventoryItem.create(req.body);
    res.status(201).json({ item });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all items with filtering and sorting
exports.list = async (req, res) => {
  try {
    const filters = buildFilters(req.query);
    const sort = buildSort(req.query.sort);
    const items = await BuyerInventoryItem.find(filters).sort(sort);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get by id
exports.getById = async (req, res) => {
  try {
    const item = await BuyerInventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update (use save() so pre-validate/save hooks recompute totals)
exports.update = async (req, res) => {
  try {
    const doc = await BuyerInventoryItem.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Item not found" });
    // Assign provided fields
    if (req.body.customerName !== undefined) doc.customerName = req.body.customerName;
    if (req.body.currency !== undefined) doc.currency = req.body.currency;
    if (req.body.items !== undefined) doc.items = req.body.items;
    // Save to trigger hooks for totals
    await doc.save();
    res.json({ item: doc });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete
exports.remove = async (req, res) => {
  try {
    const item = await BuyerInventoryItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

