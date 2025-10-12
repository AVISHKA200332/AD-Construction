import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import ServiceInsert from '../ServiceInsert/ServiceInsert';
import { generateServicesPDF } from '../../utils/pdfUtils';

const SiteManagerServices = () => {
  const [services, setServices] = useState([]);
  const [laborWorkers, setLaborWorkers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedLabor, setSelectedLabor] = useState('');
  const [assignProvider, setAssignProvider] = useState('');
  const [assignCost, setAssignCost] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    serviceType: '',
    provider: '',
    date: '',
    cost: '',
    assigneeId: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [errors, setErrors] = useState({});

  // Validation function
  const validate = (values) => {
    const errs = {};
    if (!values.serviceType || values.serviceType.trim().length < 3)
      errs.serviceType = 'Service type must be at least 3 characters.';
    if (!values.provider || values.provider.trim().length < 2)
      errs.provider = 'Provider must be at least 2 characters.';
    if (!values.date)
      errs.date = 'Date is required.';
    if (!values.cost || isNaN(values.cost) || Number(values.cost) <= 0)
      errs.cost = 'Cost must be a positive number.';
    return errs;
  };

  const BASE_URL = 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const fetchServices = useCallback(async () => {
    setFetchError(null);
    try {
      const res = await axios.get(`${BASE_URL}/services`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setServices(res.data.services || []);
    } catch (err) {
      setFetchError(err.message || 'Error fetching services');
      setServices([]);
    }
  }, [token]);

  const fetchLaborWorkers = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/services/labor-workers`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setLaborWorkers(res.data.laborWorkers || []);
    } catch (err) {
      console.error('Error fetching labor workers:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchServices();
    fetchLaborWorkers();
  }, [fetchServices, fetchLaborWorkers]);

  // Filter services based on search term
  const filteredServices = useMemo(() => {
    if (!searchTerm.trim()) return services;
    
    const query = searchTerm.trim().toLowerCase();
    return services.filter(service =>
      service.serviceType?.toLowerCase().includes(query) ||
      service.provider?.toLowerCase().includes(query) ||
      service.status?.toLowerCase().includes(query) ||
      service.assignedToName?.toLowerCase().includes(query)
    );
  }, [services, searchTerm]);

  const openNew = () => {
    setEditingId(null);
    setForm({ serviceType: '', provider: '', date: '', cost: '', assigneeId: '' });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (svc) => {
    setEditingId(svc._id);
    setForm({
      serviceType: svc.serviceType || '',
      provider: svc.provider || '',
      date: svc.date ? svc.date.slice(0, 10) : '',
      cost: svc.cost || '',
      assigneeId: svc.assignedTo || ''
    });
    setErrors({});
    setModalOpen(true);
  };

  const openAssignModal = (service) => {
    setSelectedService(service);
    setSelectedLabor('');
    setAssignProvider(service?.provider || '');
    setAssignCost(service?.cost || '');
    setAssignModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/services/${editingId}`, form, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
      } else {
        // Create the service first
        const serviceResponse = await axios.post(`${BASE_URL}/services`, form, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        // If an assignee is selected, assign the service immediately
        if (form.assigneeId) {
          await axios.post(`${BASE_URL}/services/assign`, {
            serviceId: serviceResponse.data.service._id,
            laborId: form.assigneeId
          }, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
        }
      }
      setModalOpen(false);
      setForm({ serviceType: '', provider: '', date: '', cost: '', assigneeId: '' });
      await fetchServices();
    } catch (err) {
      alert('Error saving service: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignService = async () => {
    if (!selectedLabor) {
      alert('Please select a labor worker');
      return;
    }

    try {
      // first update the service with provider/cost if provided
      await axios.put(`${BASE_URL}/services/${selectedService._id}`, {
        provider: assignProvider,
        cost: assignCost
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      // then assign to labor
      await axios.post(`${BASE_URL}/services/assign`, {
        serviceId: selectedService._id,
        laborId: selectedLabor
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      setAssignModalOpen(false);
      setSelectedService(null);
      setSelectedLabor('');
      setAssignProvider('');
      setAssignCost('');
      await fetchServices();
      alert('Service assigned successfully!');
    } catch (err) {
      alert('Error assigning service: ' + (err.response?.data?.error || err.message));
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await axios.delete(`${BASE_URL}/services/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      await fetchServices();
    } catch (err) {
      alert('Error deleting service: ' + (err.response?.data?.error || err.message));
    }
  };

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

  const getAssignmentBadge = (service) => {
    if (service.assignedToName) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {service.assignedToName}
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        Unassigned
      </span>
    );
  };

  return (
    <div className="px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3954]">Site Manager Services</h1>
          <p className="text-gray-600 mt-2">Manage services and assign them to labor workers.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openNew}
            className="px-4 py-2 rounded-md bg-[#0B3954] text-white font-semibold hover:bg-[#0a2f46]"
          >
            + New Service
          </button>
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

      {/* Search */}
      <div className="mb-6 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Services</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by service type, provider, status, or assigned worker..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B3954]"
          />
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-[#0B3954]">Service Management</h3>
        </div>
        
        <div className="overflow-x-auto">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-600 uppercase tracking-wide">
            <div className="col-span-2">Service Type</div>
            <div className="col-span-2">Provider</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1">Cost</div>
            <div className="col-span-2">Assigned To</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>
          
          {fetchError && (
            <div className="px-6 py-8 text-center text-red-600">Error loading services</div>
          )}
          
          {!fetchError && filteredServices.map((svc) => (
            <div key={svc._id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b hover:bg-gray-50">
              <div className="col-span-2 text-[#0B3954] font-medium">{svc.serviceType}</div>
              <div className="col-span-2">{svc.provider}</div>
              <div className="col-span-1">{getStatusBadge(svc.status)}</div>
              <div className="col-span-2">{svc.date ? new Date(svc.date).toLocaleDateString() : ''}</div>
              <div className="col-span-1">${svc.cost}</div>
              <div className="col-span-2">{getAssignmentBadge(svc)}</div>
              <div className="col-span-2 flex items-center justify-center gap-1">
                <button 
                  onClick={() => openAssignModal(svc)} 
                  className="px-2 py-1 text-xs rounded-md bg-green-100 text-green-700 hover:bg-green-200"
                  title="Assign to Labor"
                >
                  Assign
                </button>
                <button 
                  onClick={() => openEdit(svc)} 
                  className="px-2 py-1 text-xs rounded-md border border-gray-300 text-[#0B3954] hover:bg-gray-100"
                >
                  Edit
                </button>
                <button 
                  onClick={() => deleteService(svc._id)} 
                  className="px-2 py-1 text-xs rounded-md border border-red-300 text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          
          {!fetchError && filteredServices.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">No services found.</div>
          )}
        </div>
      </div>

      {/* Service Create/Edit Modal */}
      <ServiceInsert
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        submitting={submitting}
        editingId={editingId}
        errors={errors}
        users={laborWorkers}
      />

      {/* Assignment Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setAssignModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl p-6 z-10">
            <h3 className="text-lg font-semibold text-[#0B3954] mb-4">
              Assign Service to Labor
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Service:</p>
              <p className="font-medium">{selectedService?.serviceType}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Provider (estimate)</label>
              <input
                type="text"
                value={assignProvider}
                onChange={(e) => setAssignProvider(e.target.value)}
                placeholder="Enter provider or vendor"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B3954]"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Cost</label>
              <input
                type="number"
                value={assignCost}
                onChange={(e) => setAssignCost(e.target.value)}
                placeholder="Enter estimated cost (numeric)"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B3954]"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Labor Worker
              </label>
              <select
                value={selectedLabor}
                onChange={(e) => setSelectedLabor(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B3954]"
              >
                <option value="">Choose a labor worker...</option>
                {laborWorkers.map((worker) => (
                  <option key={worker._id} value={worker._id}>
                    {worker.name} ({worker.gmail})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignService}
                className="px-4 py-2 rounded-md bg-[#0B3954] text-white hover:bg-[#0a2f46]"
              >
                Assign Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteManagerServices;