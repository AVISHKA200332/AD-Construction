import React, { useEffect, useState, useCallback } from "react";
import { useCart } from "./CartContext";
import { useNavigate } from "react-router-dom";
import searchIcon from "../../assets/icons/search.png";
import filterIcon from "../../assets/icons/filter.png";
import fileTextIcon from "../../assets/icons/file-text.png";
import plusIcon from "../../assets/icons/plus.png";
import AddInventoryModal from "./AddInventoryModal";
import inventoryService from "../../services/inventoryService";
import { generateInventoryReportPDF } from "./inventoryReportPdfUtil";

export default function AdminInventory() {
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [inventoryStats, setInventoryStats] = useState(null);
  const [items, setItems] = useState([]);
  const [showStockAlert, setShowStockAlert] = useState(false);
  const [stockAlerts, setStockAlerts] = useState({ low: [], out: [] });

  const [newItem, setNewItem] = useState({
    name: "",
    type: "Cement",
    amount: 0,
    seller: "",
    unitPrice: 0,
    metric: "Other",
    currency: "LKR",
    status: "active"
  });

  // Fetch inventory items
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        ...(searchTerm && { q: searchTerm }),
        ...(typeFilter && { type: typeFilter }),
        ...(statusFilter && { status: statusFilter }),
        sort: `${sortBy}:${sortOrder}`
      };

      const data = await inventoryService.getAllItems(params);
      setItems(data);
      
      // Calculate stock alerts
      const lowStock = data.filter(item => item.amount > 0 && item.amount < 10);
      const outOfStock = data.filter(item => item.amount === 0);
      setStockAlerts({ low: lowStock, out: outOfStock });
    } catch (err) {
      setError("Failed to fetch inventory items. Please try again.");
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, typeFilter, statusFilter, sortBy, sortOrder]);

  // Fetch inventory statistics
  const fetchInventoryStats = async () => {
    try {
      const data = await inventoryService.getInventoryStats();
      setInventoryStats(data);
    } catch (err) {
      console.error("Error fetching inventory stats:", err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchInventoryStats();
  }, [fetchItems]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Prevent negative numbers from being entered for amount and unitPrice
    if (name === 'amount' || name === 'unitPrice') {
      // don't allow a leading minus sign
      if (String(value).startsWith('-')) return;

      // Allow empty value so user can clear input while typing
      if (value === '') {
        setNewItem({ ...newItem, [name]: '' });
        return;
      }

      if (name === 'amount') {
        // Only allow integer digits for amount
        const digitsOnly = String(value).replace(/[^0-9]/g, '');
        // keep it as a string while typing; convert on save
        setNewItem({ ...newItem, [name]: digitsOnly === '' ? '' : digitsOnly });
        return;
      }

      if (name === 'unitPrice') {
        // Allow numbers with optional single decimal point
        const valid = /^\d*\.?\d*$/.test(value);
        if (!valid) return;
        setNewItem({ ...newItem, [name]: value });
        return;
      }
    }

    setNewItem({ ...newItem, [name]: value });
  };

  // Save item (create or update)
  const handleSaveItem = async () => {
    try {
      setLoading(true);
      setError(null);

      const itemData = {
        ...newItem,
        amount: Number(newItem.amount),
        unitPrice: Number(newItem.unitPrice)
      };

      if (isEditing && editIndex !== null) {
        const itemToUpdate = items[editIndex];
        await inventoryService.updateItem(itemToUpdate._id, itemData);
        setSuccess("Item updated successfully!");
      } else {
        await inventoryService.createItem(itemData);
        setSuccess("Item created successfully!");
      }

      await fetchItems();
      await fetchInventoryStats();
      setNewItem({
        name: "",
        type: "Cement",
        amount: 0,
        seller: "",
        unitPrice: 0,
        metric: "Other",
        currency: "LKR",
        status: "active"
      });
      setShowModal(false);
      setIsEditing(false);
      setEditIndex(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to save item. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete item
  const handleDelete = async (index) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    
    try {
      setLoading(true);
      setError(null);
      const itemToDelete = items[index];
      await inventoryService.deleteItem(itemToDelete._id);
      await fetchItems();
      await fetchInventoryStats();
      setSuccess("Item deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to delete item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Edit item
  const handleEdit = (index) => {
    const itemToEdit = items[index];
    setNewItem({
      ...itemToEdit,
      metric: itemToEdit.metric || "Other",
      currency: itemToEdit.currency || "LKR"
    });
    setIsEditing(true);
    setEditIndex(index);
    setShowModal(true);
  };

  // Restock item
  const handleRestock = async (id) => {
    const amount = prompt("Enter restock quantity:", "10");
    if (!amount || Number(amount) <= 0) return;
    
    try {
      setLoading(true);
      await inventoryService.restockItem(id, Number(amount));
      await fetchItems();
      await fetchInventoryStats();
      setSuccess("Item restocked successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to restock item.");
    } finally {
      setLoading(false);
    }
  };

  // Order item (reduce stock)
  const handleOrder = (item) => {
    const amount = window.prompt("Enter order quantity:", "1");
    if (!amount || Number(amount) <= 0) return;
    const qty = Number(amount);

    // Determine existing quantity in cart for this item (match by backend id or fallback to name+price)
    const existing = cart.find(i => (i._id && i._id === item._id) || (!i._id && i.name === item.name && Number(i.unitPrice) === Number(item.unitPrice)));
    const existingQty = existing ? existing.quantity : 0;

    if (existingQty + qty > (item.amount || 0)) {
      const available = (item.amount || 0) - existingQty;
      setError(`Cannot add ${qty} units. Only ${available} unit(s) available in stock.`);
      // Clear the error automatically after a short delay
      setTimeout(() => setError(null), 4000);
      return;
    }

    addToCart(item, qty);
    setSuccess("Added to cart!");
    setTimeout(() => setSuccess(null), 2000);
    // Navigate to cart page after adding
    navigate('/cart');
  };

  // Generate report
  const handleGenerateReport = () => {
    if (items.length === 0) {
      setError("No inventory items available to generate report.");
      return;
    }
    try {
      generateInventoryReportPDF({ items, stats: inventoryStats });
      setSuccess("Report generated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to generate report. Please try again.");
      console.error("Error generating report:", err);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString()}`;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // Get stock level color
  const getStockLevelColor = (amount) => {
    if (amount === 0) return 'text-red-600 font-bold';
    if (amount < 10) return 'text-orange-600 font-semibold';
    if (amount < 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 font-bold text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <span>✅ {success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-500 hover:text-green-700 font-bold text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Inventory Management System
            </h1>
            <p className="text-gray-600 mt-2">Manage your construction materials efficiently</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowStockAlert(!showStockAlert)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                stockAlerts.out.length > 0 || stockAlerts.low.length > 0
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 animate-pulse'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔔 Alerts ({stockAlerts.out.length + stockAlerts.low.length})
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
            >
              🛒 Cart
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={loading || items.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md disabled:opacity-50"
            >
              <img src={fileTextIcon} alt="Report" className="w-5 h-5" />
              Generate Report
            </button>
            <button
              onClick={() => {
                setShowModal(true);
                setIsEditing(false);
                setNewItem({
                  name: "",
                  type: "Cement",
                  amount: 0,
                  seller: "",
                  unitPrice: 0,
                  metric: "Other",
                  currency: "LKR",
                  status: "active"
                });
              }}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md transform hover:scale-105"
            >
              <img src={plusIcon} alt="Add" className="w-5 h-5" />
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {inventoryStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
                <p className="text-3xl font-bold text-gray-900 mt-1">{inventoryStats.totalItems}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(inventoryStats.totalValue)}
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Low Stock</h3>
                <p className="text-3xl font-bold text-orange-600 mt-1">{inventoryStats.lowStock}</p>
                <p className="text-xs text-gray-500 mt-1">Below 10 units</p>
              </div>
              <div className="text-4xl">⚠️</div>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Out of Stock</h3>
                <p className="text-3xl font-bold text-red-600 mt-1">{inventoryStats.outOfStock}</p>
                <p className="text-xs text-gray-500 mt-1">Needs restock</p>
              </div>
              <div className="text-4xl">🚨</div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Alerts */}
      {showStockAlert && (stockAlerts.low.length > 0 || stockAlerts.out.length > 0) && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 border-l-4 border-red-500">
          <h3 className="font-semibold text-lg mb-3 text-red-600">⚠️ Stock Alerts</h3>
          {stockAlerts.out.length > 0 && (
            <div className="mb-3">
              <h4 className="font-medium text-red-700 mb-2">Out of Stock Items:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {stockAlerts.out.map((item, idx) => (
                  <div key={idx} className="bg-red-50 p-2 rounded text-sm">
                    <span className="font-medium">{item.name}</span> - {item.type}
                    <button
                      onClick={() => handleRestock(item._id)}
                      className="ml-2 text-red-600 hover:text-red-800 underline text-xs"
                    >
                      Restock Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {stockAlerts.low.length > 0 && (
            <div>
              <h4 className="font-medium text-orange-700 mb-2">Low Stock Items ({"<"} 10 units):</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {stockAlerts.low.map((item, idx) => (
                  <div key={idx} className="bg-orange-50 p-2 rounded text-sm">
                    <span className="font-medium">{item.name}</span> - Current: {item.amount} units
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <AddInventoryModal
        showModal={showModal}
        setShowModal={setShowModal}
        newItem={newItem}
        handleChange={handleChange}
        handleSaveItem={handleSaveItem}
        isEditing={isEditing}
        loading={loading}
      />

      {/* Search & Filter */}
      <div className="bg-white p-5 rounded-xl shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative md:col-span-2">
            <img
              src={searchIcon}
              alt="Search"
              className="absolute left-3 top-3 w-5 h-5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search items, sellers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="Cement">Cement</option>
            <option value="Granite">Granite</option>
            <option value="Sand">Sand</option>
            <option value="Concrete Blocks">Concrete Blocks</option>
            <option value="Steel Bars">Steel Bars</option>
            <option value="Bricks">Bricks</option>
            <option value="Tiles">Tiles</option>
            <option value="Paint">Paint</option>
            <option value="Other Construction Material">Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (sortBy === 'createdAt') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('createdAt');
                  setSortOrder('desc');
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <img src={filterIcon} alt="Sort" className="w-4 h-4" />
              Sort: Date {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Item Name</th>
                <th className="px-6 py-4 text-left font-semibold">Type</th>
                <th className="px-6 py-4 text-left font-semibold">Seller/Supplier</th>
                <th className="px-6 py-4 text-center font-semibold">Quantity</th>
                <th className="px-6 py-4 text-center font-semibold">Unit</th>
                <th className="px-6 py-4 text-right font-semibold">Unit Price</th>
                <th className="px-6 py-4 text-right font-semibold">Total Value</th>
                <th className="px-6 py-4 text-center font-semibold">Status</th>
                <th className="px-6 py-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3">Loading inventory...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length > 0 ? (
                items.map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{item.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-700">{item.seller}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-semibold ${getStockLevelColor(item.amount)}`}>
                        {item.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {item.metric || 'Units'}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-green-600">
                      {formatCurrency(item.amount * item.unitPrice)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.amount === 0 ? 'out_of_stock' : item.status)}`}>
                        {item.amount === 0 ? 'out_of_stock' : item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => handleEdit(idx)}
                          disabled={loading}
                          className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          title="Edit Item"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRestock(item._id)}
                          disabled={loading}
                          className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                          title="Restock Item"
                        >
                          +Stock
                        </button>
                        <button
                          onClick={() => handleOrder(item)}
                          disabled={loading || item.amount === 0}
                          className="px-2 py-1 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Add to Cart"
                        >
                          -Order
                        </button>
                        <button
                          onClick={() => handleDelete(idx)}
                          disabled={loading}
                          className="px-2 py-1 text-xs border border-red-300 text-red-700 rounded hover:bg-red-50 transition-colors"
                          title="Delete Item"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="text-6xl mb-4">📦</div>
                      <div className="text-xl font-medium">No inventory items found</div>
                      <div className="text-sm text-gray-400 mt-2">
                        {searchTerm || typeFilter || statusFilter
                          ? "Try adjusting your filters"
                          : "Add your first item to get started"}
                      </div>
                      <button
                        onClick={() => {
                          setShowModal(true);
                          setIsEditing(false);
                        }}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add First Item
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
