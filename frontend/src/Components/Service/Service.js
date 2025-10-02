import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import ServiceInsert from '../ServiceInsert/ServiceInsert';
import { generateServicesPDF } from '../../utils/pdfUtils';

const StatusBadge = ({ status }) => {
  const map = {
    'Pending': 'bg-yellow-100 text-yellow-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Completed': 'bg-green-100 text-green-700',
    'Cancelled': 'bg-gray-100 text-gray-700',
  };
  const cls = map[status] || map['Pending'];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{status}</span>;
};

const PreviewModal = ({ open, onClose, svc }) => {
  if (!open || !svc) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl p-6 z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-[#0B3954]">{svc.serviceType}</h3>
            <p className="text-sm text-gray-500 mt-1">Provider {svc.provider} • {svc.date ? new Date(svc.date).toLocaleString() : ''}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
          <div>Cost: <span className="font-semibold">{svc.cost}</span></div>
          <div>Status: <StatusBadge status={svc.status} /></div>
        </div>
        <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">{svc.message || 'No description'}</div>
        <div className="mt-6 text-right">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-[#0B3954] text-white hover:bg-[#0a2f46]">Close</button>
        </div>
      </div>
    </div>
  );
};

const Service = () => {
  const [activeTab, setActiveTab] = useState('my');
  const [myServices, setMyServices] = useState([]);
  const [created, setCreated] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ serviceType: '', status: '', date: '', cost: '', assigneeId: '', provider: '' });
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);

  const BASE_URL = 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const validate = (values) => {
    const errs = {};
    if (!values.serviceType || values.serviceType.trim().length < 3)
      errs.serviceType = 'Service type must be at least 3 characters.';
    if (!editingId && !values.assigneeId)
      errs.assigneeId = 'Assignee is required.';
    if (!values.date)
      errs.date = 'Date is required.';
    if (!values.cost || isNaN(values.cost) || Number(values.cost) <= 0)
      errs.cost = 'Cost must be a positive number.';
    return errs;
  };

  const fetchMy = useCallback(async () => {
    setFetchError(null);
    try {
      const res = await axios.get(`${BASE_URL}/services/my`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setMyServices(res.data.services || []);
    } catch (err) {
      setFetchError(err.message || 'Error fetching services');
      setMyServices([]);
    }
  }, [BASE_URL, token]);

  const fetchCreated = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/services/created`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setCreated(res.data.services || []);
    } catch (_) {
      setCreated([]);
    }
  }, [BASE_URL, token]);

  const loadUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/users`);
      setUsers(res.data.users || []);
    } catch (_) {}
  }, [BASE_URL]);

  useEffect(() => { fetchMy(); fetchCreated(); loadUsers(); }, [fetchMy, fetchCreated, loadUsers]);

  const list = activeTab === 'my' ? myServices : created;
  const filteredServices = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return list;
    return list.filter((svc) => {
      const dateStr = svc.date ? new Date(svc.date).toISOString().slice(0, 10) : '';
      return [svc.serviceType, svc.provider, svc.status, dateStr, svc.cost]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q));
    });
  }, [list, searchTerm]);

  const openNew = () => {
    setEditingId(null);
    setForm({ serviceType: '', status: 'Pending', date: '', cost: '', assigneeId: '' });
    setModalOpen(true);
  };

  const openEdit = (svc) => {
    setEditingId(svc._id);
    setForm({
      serviceType: svc.serviceType || '',
      provider: svc.provider || '',
      status: svc.status || 'Pending',
      date: svc.date ? new Date(svc.date).toISOString().slice(0,10) : '',
      cost: svc.cost || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/services/${editingId}`, form, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      } else {
        const payload = { serviceType: form.serviceType, assigneeId: form.assigneeId, date: form.date, cost: form.cost, message: form.message, status: form.status || 'Pending' };
        await axios.post(`${BASE_URL}/services`, payload, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      }
      setModalOpen(false);
      setForm({ serviceType: '', status: 'Pending', date: '', cost: '', assigneeId: '' });
      await fetchMy();
      await fetchCreated();
    } catch (err) {
      alert('Error saving service: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    await axios.delete(`${BASE_URL}/services/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    await fetchMy();
    await fetchCreated();
  };

  const updateStatus = async (svc, status) => {
    try {
      await axios.patch(`${BASE_URL}/services/${svc._id}/status`, { status }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setMyServices(prev => prev.map(s => s._id === svc._id ? { ...s, status } : s));
      setCreated(prev => prev.map(s => s._id === svc._id ? { ...s, status } : s));
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="px-6 py-4">
      <div className="flex gap-8 mb-6 border-b">
        <button className={`pb-2 text-lg font-semibold ${activeTab==='my' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500'}`} onClick={() => setActiveTab('my')}>My Services</button>
        <button className={`pb-2 text-lg font-semibold ${activeTab==='created' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500'}`} onClick={() => setActiveTab('created')}>Created</button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-2 w-full max-w-xl">
          <div className="text-2xl font-bold text-[#0B3954]">Services</div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search services..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B3954]"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={openNew} className="px-4 py-2 rounded-md bg-[#0B3954] text-white font-semibold hover:bg-[#0a2f46]">+ New Service</button>
          <button onClick={() => generateServicesPDF(filteredServices)} className="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700">Generate PDF</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-12 px-6 py-3 text-sm font-semibold text-gray-500 border-b">
          <div className="col-span-4">SERVICE TYPE</div>
          <div className="col-span-2">PROVIDER</div>
          <div className="col-span-2">DATE</div>
          <div className="col-span-2">STATUS</div>
          <div className="col-span-2 text-right">ACTIONS</div>
        </div>
        <div>
          {fetchError && (
            <div className="px-6 py-8 text-center text-red-500 font-semibold">{fetchError}</div>
          )}
          {!fetchError && filteredServices.map((svc) => (
            <div
              key={svc._id}
              className={`grid grid-cols-12 px-6 py-4 items-center border-b hover:bg-gray-50 cursor-pointer ${svc.status === 'Pending' ? 'bg-yellow-50' : ''}`}
              onClick={() => setPreview(svc)}
            >
              <div className="col-span-4 text-[#0B3954] font-medium">{svc.serviceType}</div>
              <div className="col-span-2">{svc.provider}</div>
              <div className="col-span-2">{svc.date ? new Date(svc.date).toISOString().slice(0,10) : ''}</div>
              <div className="col-span-2"><StatusBadge status={svc.status} /></div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <select
                  className="text-xs border rounded px-2 py-1"
                  value={svc.status}
                  onChange={(e) => updateStatus(svc, e.target.value)}
                  onClick={(e)=> e.stopPropagation()}
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
                <button onClick={(e) => { e.stopPropagation(); openEdit(svc); }} className="px-2 py-1 text-xs rounded-md border border-gray-300 text-[#0B3954] hover:bg-gray-100">Edit</button>
                <button onClick={(e) => { e.stopPropagation(); deleteService(svc._id); }} className="px-2 py-1 text-xs rounded-md border border-red-300 text-red-700 hover:bg-red-50">Delete</button>
              </div>
            </div>
          ))}
          {!fetchError && filteredServices.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">No services found.</div>
          )}
        </div>
      </div>

      <PreviewModal open={!!preview} onClose={() => setPreview(null)} svc={preview} />

      {/* Modal */}
      <ServiceInsert
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        submitting={submitting}
        editingId={editingId}
        errors={errors}
        users={users}
      />
    </div>
  );
};

export default Service;
