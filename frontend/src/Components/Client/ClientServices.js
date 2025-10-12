import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { generateServicesPDF } from '../../utils/pdfUtils';

const ClientServices = () => {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fetchError, setFetchError] = useState(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({ serviceType: '', details: '' });
  const [requesting, setRequesting] = useState(false);

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
        service.status?.toLowerCase().includes(query) ||
        service.assignedToName?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [services, searchTerm, statusFilter]);

  const submitRequest = async (e) => {
    e.preventDefault();
    setRequesting(true);
    try {
      const payload = {
        serviceType: requestForm.serviceType,
        details: requestForm.details,
        status: 'Pending'
      };
      await axios.post(`${BASE_URL}/services`, payload, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setRequestOpen(false);
      setRequestForm({ serviceType: '', details: '' });
      await fetchServices();
    } catch (err) {
      alert('Failed to submit request: ' + (err.response?.data?.error || err.message));
    } finally {
      setRequesting(false);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on hold', label: 'On Hold' }
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'on hold': 'bg-orange-100 text-orange-800'
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

  return (<>
    <div className="px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3954]">Project Services Overview</h1>
          <p className="text-gray-600 mt-2">Track all services and their progress across your projects.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => generateServicesPDF(filteredServices)}
            className="px-4 py-2 rounded-md border border-[#0B3954] text-[#0B3954] font-semibold hover:bg-[#0B3954] hover:text-white transition-colors"
          >
            Export PDF
          </button>
          <button
            onClick={() => setRequestOpen(true)}
            className="px-4 py-2 rounded-md bg-[#0B3954] text-white font-semibold hover:bg-[#0a2f46] transition-colors"
          >
            Request Service
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
              placeholder="Search by service type, provider, status, or assigned worker..."
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
            Services Overview
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
            <div className="col-span-2">Assigned To</div>
            <div className="col-span-1">Progress</div>
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
              <div className="col-span-2">{getAssignmentBadge(svc)}</div>
              <div className="col-span-1">
                {svc.assignedDate && (
                  <div className="text-xs text-gray-500">
                    Assigned: {new Date(svc.assignedDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {!fetchError && filteredServices.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              {statusFilter === 'all' ? 'No services found.' : `No ${statusFilter} services found.`}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Request Service Modal */}
    {requestOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/30" onClick={() => setRequestOpen(false)} />
        <div className="relative w-full max-w-xl bg-white rounded-lg shadow-xl p-6 z-10">
          <h3 className="text-lg font-semibold text-[#0B3954] mb-3">Request Service</h3>
          <form onSubmit={submitRequest}>
            <div className="grid grid-cols-1 gap-3">
              <input
                required
                placeholder="Service Type"
                value={requestForm.serviceType}
                onChange={(e) => setRequestForm(prev => ({ ...prev, serviceType: e.target.value }))}
                className="rounded-md border border-gray-300 px-3 py-2"
              />
              <textarea
                placeholder="Details (optional)"
                value={requestForm.details}
                onChange={(e) => setRequestForm(prev => ({ ...prev, details: e.target.value }))}
                className="rounded-md border border-gray-300 px-3 py-2 h-24"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setRequestOpen(false)} className="px-3 py-2 rounded-md border">Cancel</button>
              <button type="submit" disabled={requesting} className="px-4 py-2 rounded-md bg-[#0B3954] text-white">{requesting ? 'Requesting...' : 'Submit Request'}</button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
};

export default ClientServices;