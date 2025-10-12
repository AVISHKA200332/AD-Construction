import React, { useState, useEffect } from 'react';

const ITEM_TYPES = [
  "Cement",
  "Granite",
  "Sand",
  "Concrete Blocks",
  "Steel Bars",
  "Bricks",
  "Tiles",
  "Paint",
  "Other Construction Material"
];

const METRICS = [
  "Bags",
  "Tons",
  "Cubes",
  "Packets",
  "Count",
  "Liters",
  "Pieces",
  "Kg",
  "Other"
];

function AddInventoryModal({ showModal, setShowModal, newItem, handleChange, handleSaveItem, isEditing, loading }) {
  const [errors, setErrors] = useState({});

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!newItem.name || newItem.name.trim() === '') {
      newErrors.name = 'Item name is required';
    }
    
    if (!newItem.seller || newItem.seller.trim() === '') {
      newErrors.seller = 'Seller/Supplier name is required';
    }
    
    // Coerce empty string to number for validation
    const amountVal = newItem.amount === '' ? NaN : Number(newItem.amount);
    const unitPriceVal = newItem.unitPrice === '' ? NaN : Number(newItem.unitPrice);

    if (Number.isNaN(amountVal) || amountVal < 0) {
      newErrors.amount = 'Amount must be 0 or greater';
    }

    if (Number.isNaN(unitPriceVal) || unitPriceVal < 0) {
      newErrors.unitPrice = 'Unit price must be 0 or greater';
    }
    
    if (!newItem.type) {
      newErrors.type = 'Item type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      handleSaveItem();
    }
  };

  // Clear errors when modal closes
  useEffect(() => {
    if (!showModal) {
      setErrors({});
    }
  }, [showModal]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              {isEditing ? '📝 Edit Inventory Item' : '📦 Add New Inventory Item'}
            </h2>
            <button
              onClick={() => setShowModal(false)}
              className="text-white hover:text-gray-200 text-3xl font-bold transition-colors"
              disabled={loading}
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <span className="text-blue-600 mr-2">📋</span> Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={newItem.name}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={newItem.type}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.type ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <option value="">Select Type</option>
                  {ITEM_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
              </div>
            </div>
          </div>

          {/* Stock Information Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <span className="text-green-600 mr-2">📊</span> Stock Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={newItem.amount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit/Metric
                </label>
                <select
                  name="metric"
                  value={newItem.metric || 'Other'}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  {METRICS.map(metric => (
                    <option key={metric} value={metric}>{metric}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={newItem.status || 'active'}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing Information Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <span className="text-yellow-600 mr-2">💰</span> Pricing Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Price <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    Rs.
                  </span>
                  <input
                    type="number"
                    name="unitPrice"
                    value={newItem.unitPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`flex-1 px-4 py-2 border rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.unitPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  />
                </div>
                {errors.unitPrice && <p className="text-red-500 text-xs mt-1">{errors.unitPrice}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={newItem.currency || 'LKR'}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="LKR">LKR (Rs.)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Supplier Information Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <span className="text-purple-600 mr-2">🏭</span> Supplier Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seller/Supplier <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="seller"
                  value={newItem.seller}
                  onChange={handleChange}
                  placeholder="Enter seller or supplier name"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.seller ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.seller && <p className="text-red-500 text-xs mt-1">{errors.seller}</p>}
              </div>
            </div>
          </div>

          {/* Total Value Display */}
          {newItem.amount && newItem.unitPrice && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Total Value:</span>
                <span className="text-2xl font-bold text-blue-600">
                  Rs. {(Number(newItem.amount) * Number(newItem.unitPrice)).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  {isEditing ? '💾 Update Item' : '➕ Add Item'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddInventoryModal;
