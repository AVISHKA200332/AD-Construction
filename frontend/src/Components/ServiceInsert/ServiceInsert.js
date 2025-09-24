import React from 'react';

const ServiceInsert = ({ open, onClose, onSubmit, form, setForm, submitting, editingId }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-xl font-bold mb-4 text-[#0B3954]">{editingId ? 'Edit Service' : 'New Service'}</div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Service Type</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={form.serviceType} onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Provider</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Status</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Date</label>
            <input type="date" className="w-full border rounded px-3 py-2" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Cost</label>
            <input type="number" className="w-full border rounded px-3 py-2" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} required />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-[#0B3954] text-white font-semibold hover:bg-[#0a2f46]">{submitting ? 'Saving...' : (editingId ? 'Update' : 'Create')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceInsert;
