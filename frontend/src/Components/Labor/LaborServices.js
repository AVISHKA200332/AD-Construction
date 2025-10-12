import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import LaborServiceInsert from './LaborServiceInsert';
import { generateServicesPDF } from '../../utils/pdfUtils';

const LaborServices = () => {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
  const [errors, setErrors] = useState({});

  // Validation function - Labor can only update status
  const validate = (values) => {
    const errs = {};
    if (!values.status)
      errs.status = 'Status is required.';
    return errs;
  };

  const BASE_URL = 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const fetchServices = useCallback(async () => {
    setFetchError(null);
    try {
      // Fetch only services assigned to this labor worker
      const res = await axios.get(`${BASE_URL}/services/assigned`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setServices(res.data.services || []);
    } catch (err) {
      setFetchError(err.message || 'Error fetching assigned services');
      setServices([]);
    }
  }, [token]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Filter services based on search term and status
  const filteredServices = useMemo(() => {
    let filtered = services;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(service => 
        service.status && service.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const query = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(service =>
        service.serviceType?.toLowerCase().includes(query) ||
        service.provider?.toLowerCase().includes(query) ||
        service.status?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [services, searchTerm, statusFilter]);

  const openEdit = (svc) => {
    setEditingId(svc._id);
    setForm({
      serviceType: svc.serviceType || '',
      provider: svc.provider || '',
      status: svc.status || '',
      date: svc.date ? svc.date.slice(0, 10) : '',
      cost: svc.cost || ''
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      // Labor can only update status, so only send the status field
      if (editingId) {
        await axios.put(`${BASE_URL}/services/${editingId}`, 
          { status: form.status }, 
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }
        );
        setModalOpen(false);
        setForm({ serviceType: '', provider: '', status: '', date: '', cost: '' });
        await fetchServices();
      }
    } catch (err) {
      alert('Error updating service status: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800'
    };
    const className = statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  return (
    <div className="px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3954]">My Assigned Services</h1>
          <p className="text-gray-600 mt-2">Services assigned to you and their current status.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => generateServicesPDF(filteredServices)}
            className="px-4 py-2 rounded-md border border-[#0B3954] text-[#0B3954] font-semibold hover:bg-[#0B3954] hover:text-white transition-colors"
          >
            Export PDF
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{fetchError}</p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Services</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by service type, provider, or status..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B3954]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B3954]"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-[#0B3954]">
            Assigned Services 
            {statusFilter !== 'all' && (
              <span className="ml-2 text-sm text-gray-500">
                ({statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)})
              </span>
            )}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-600 uppercase tracking-wide">
            <div className="col-span-2">Service Type</div>
            <div className="col-span-2">Provider</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1">Cost</div>
            <div className="col-span-2">Assigned By</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>
          
          {fetchError && (
            <div className="px-6 py-8 text-center text-red-600">Error loading services</div>
          )}
          
          {!fetchError && filteredServices.map((svc) => (
            <div key={svc._id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b hover:bg-gray-50">
              <div className="col-span-2 text-[#0B3954] font-medium">{svc.serviceType}</div>
              <div className="col-span-2">{svc.provider}</div>
              <div className="col-span-2">{getStatusBadge(svc.status)}</div>
              <div className="col-span-2">{svc.date ? new Date(svc.date).toLocaleDateString() : ''}</div>
              <div className="col-span-1">${svc.cost}</div>
              <div className="col-span-2">
                <span className="text-sm text-gray-600">
                  {svc.assignedByName || 'System'}
                  {svc.assignedDate && (
                    <div className="text-xs text-gray-400">
                      {new Date(svc.assignedDate).toLocaleDateString()}
                    </div>
                  )}
                </span>
              </div>
              <div className="col-span-1 flex items-center justify-center gap-2">
                <button
                  onClick={() => openEdit(svc)}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  title="Update Status"
                >
                  Update
                </button>
              </div>
            </div>
          ))}
          
          {!fetchError && filteredServices.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              {statusFilter === 'all' ? 'No assigned services found.' : `No ${statusFilter} assigned services found.`}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <LaborServiceInsert
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        submitting={submitting}
        editingId={editingId}
        errors={errors}
      />
    </div>
  );
};

export default LaborServices;