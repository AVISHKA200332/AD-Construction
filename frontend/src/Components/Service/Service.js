import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ServiceInsert from '../ServiceInsert/ServiceInsert';
import { generateServicesPDF } from '../../utils/pdfUtils';


const Service = () => {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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
  // Validation function
  const validate = (values) => {
    const errs = {};
    if (!values.serviceType || values.serviceType.trim().length < 3)
      errs.serviceType = 'Service type must be at least 3 characters.';
    if (!values.provider || values.provider.trim().length < 2)
      errs.provider = 'Provider must be at least 2 characters.';
    if (!values.status)
      errs.status = 'Status is required.';
    if (!values.date)
      errs.date = 'Date is required.';
    if (!values.cost || isNaN(values.cost) || Number(values.cost) <= 0)
      errs.cost = 'Cost must be a positive number.';
    return errs;
  };


  const BASE_URL = 'http://localhost:5000';
  const fetchServices = async () => {
    setFetchError(null);
    try {
      const res = await axios.get(`${BASE_URL}/services` );
      setServices(res.data.services || []);
    } catch (err) {
      setFetchError(err.message || 'Error fetching services');
      setServices([]);
    }
  };


  useEffect(() => {
    fetchServices();
  }, []);

  const filteredServices = services.filter((svc) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    const dateStr = svc.date ? new Date(svc.date).toISOString().slice(0, 10) : '';
    return [svc.serviceType, svc.provider, svc.status, dateStr, svc.cost]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(q));
  });


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
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/services/${editingId}` , form);
      } else {
        await axios.post(`${BASE_URL}/services` , form);
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
    await axios.delete(`${BASE_URL}/services/${id}` );
    await fetchServices();
  };


  return (
    <div className="px-6 py-4">
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
          {!fetchError && filteredServices.map((svc) => (
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
          {!fetchError && filteredServices.length === 0 && (
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
        errors={errors}
      />
    </div>
  );
};


export default Service;
