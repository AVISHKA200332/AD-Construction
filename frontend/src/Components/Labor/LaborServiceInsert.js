import React from 'react';

const Backdrop = ({ onClick }) => (
  <div className="fixed inset-0 bg-black/30 z-40" onClick={onClick} aria-hidden="true" />
);

const Modal = ({ children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="w-full max-w-xl bg-white rounded-lg shadow-xl overflow-hidden">
      {children}
    </div>
  </div>
);

function LaborServiceInsert({ open, onClose, onSubmit, form, setForm, submitting, editingId, errors = {} }) {
  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Backdrop onClick={onClose} />
      <Modal>
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-[#0B3954]">
            Update Service Status
          </h2>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Service Type</label>
              <input
                type="text"
                name="serviceType"
                value={form.serviceType}
                onChange={handleChange}
                disabled
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                placeholder="Enter service type"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Provider</label>
              <input
                type="text"
                name="provider"
                value={form.provider}
                onChange={handleChange}
                disabled
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                placeholder="Enter provider"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status *</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B3954]"
              >
                <option value="">Select status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-xs text-red-600">{errors.status}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                disabled
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cost</label>
              <input
                type="number"
                step="0.01"
                name="cost"
                value={form.cost}
                onChange={handleChange}
                disabled
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> As a Labor worker, you can only update the status of assigned services. 
              Other fields are read-only and managed by Site Managers.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-md bg-[#0B3954] text-white font-semibold hover:bg-[#0a2f46] disabled:opacity-60"
            >
              {submitting ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default LaborServiceInsert;