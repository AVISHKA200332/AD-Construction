import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ServiceInsert from '../ServiceInsert/ServiceInsert';
import { generateServicesPDF } from '../../utils/pdfUtils';

const Service = () => {
  const [services, setServices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    serviceType: '',
    provider: '',
    status: '',
    date: '',
    cost: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minCost, setMinCost] = useState('');
  const [maxCost, setMaxCost] = useState('');

  const BASE_URL = 'http://localhost:5000';
  const fetchServices = useCallback(async () => {
    setFetchError(null);
    try {
      const res = await axios.get(`${BASE_URL}/services`, {
        params: {
          q: q || undefined,
          status: statusFilter || undefined,
          serviceType: serviceTypeFilter || undefined,
          provider: providerFilter || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          minCost: minCost || undefined,
          maxCost: maxCost || undefined,
        },
      });
      setServices(res.data.services || []);
    } catch (err) {
      setFetchError(err.message || 'Error fetching services');
      setServices([]);
    }
  }, [q, statusFilter, serviceTypeFilter, providerFilter, dateFrom, dateTo, minCost, maxCost]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const openNew = () => {
    setEditingId(null);
    setForm({ serviceType: '', provider: '', status: '', date: '', cost: '' });
    setModalOpen(true);
  };

  const openEdit = (svc) => {
    setEditingId(svc._id);
    setForm({
      serviceType: svc.serviceType || '',
      provider: svc.provider || '',
      status: svc.status || '',
      date: svc.date ? new Date(svc.date).toISOString().slice(0,10) : '',
      cost: svc.cost || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/services/${editingId}`, form);
      } else {
        await axios.post(`${BASE_URL}/services`, form);
      }
      setModalOpen(false);
      setForm({ serviceType: '', provider: '', status: '', date: '', cost: '' });
      await fetchServices();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        alert('Error saving service: ' + err.response.data.error);
      } else {
        alert('Error saving service: ' + err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    await axios.delete(`${BASE_URL}/services/${id}`);
    await fetchServices();
  };

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl font-bold text-[#0B3954]">Services</div>
        <div className="flex gap-2">
          <button onClick={openNew} className="px-4 py-2 rounded-md bg-[#0B3954] text-white font-semibold hover:bg-[#0a2f46]">+ New Service</button>
          <button onClick={() => generateServicesPDF(services)} className="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700">Generate PDF</button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow">
        {/* Search & Filters */}
        <div className="px-6 py-4 border-b">
          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-3">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Search (Type or Provider)</label>
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search services..."
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Service Type</label>
              <input
                type="text"
                value={serviceTypeFilter}
                onChange={(e) => setServiceTypeFilter(e.target.value)}
                placeholder="e.g., Plumbing"
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Provider</label>
              <input
                type="text"
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                placeholder="e.g., ABC Co."
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Min Cost</label>
              <input
                type="number"
                min="0"
                value={minCost}
                onChange={(e) => setMinCost(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Max Cost</label>
              <input
                type="number"
                min="0"
                value={maxCost}
                onChange={(e) => setMaxCost(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <div className="col-span-12 flex gap-2 mt-2">
              <button
                onClick={fetchServices}
                className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                Apply
              </button>
              <button
                onClick={() => { setQ(''); setStatusFilter('All'); setServiceTypeFilter(''); setProviderFilter(''); setDateFrom(''); setDateTo(''); setMinCost(''); setMaxCost(''); fetchServices(); }}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-10 px-6 py-3 text-sm font-semibold text-gray-500 border-b">
          <div className="col-span-2">SERVICE TYPE</div>
          <div className="col-span-2">PROVIDER</div>
          <div className="col-span-2">STATUS</div>
          <div className="col-span-2">DATE</div>
          <div className="col-span-1">COST</div>
          <div className="col-span-1 text-right">ACTIONS</div>
        </div>
        <div>
          {fetchError && (
            <div className="px-6 py-8 text-center text-red-500 font-semibold">{fetchError}</div>
          )}
          {!fetchError && services.map((svc) => (
            <div key={svc._id} className="grid grid-cols-10 px-6 py-4 items-center border-b hover:bg-gray-50">
              <div className="col-span-2 text-[#0B3954] font-medium">{svc.serviceType}</div>
              <div className="col-span-2">{svc.provider}</div>
              <div className="col-span-2">{svc.status}</div>
              <div className="col-span-2">{svc.date ? new Date(svc.date).toISOString().slice(0,10) : ''}</div>
              <div className="col-span-1">{svc.cost}</div>
              <div className="col-span-1 flex items-center justify-end gap-2">
                <button onClick={() => openEdit(svc)} className="px-2 py-1 text-xs rounded-md border border-gray-300 text-[#0B3954] hover:bg-gray-100">Edit</button>
                <button onClick={() => deleteService(svc._id)} className="px-2 py-1 text-xs rounded-md border border-red-300 text-red-700 hover:bg-red-50">Delete</button>
              </div>
            </div>
          ))}
          {!fetchError && services.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">No services found.</div>
          )}
        </div>
      </div>
      {/* Modal */}
      <ServiceInsert
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        submitting={submitting}
        editingId={editingId}
      />
    </div>
  );
};

export default Service;
