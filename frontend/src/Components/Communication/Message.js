
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import MessageInsert from '../MessaageInsert/MessageInsert';
import { generateMessagesPDF } from '../../utils/pdfUtils';
import Service from '../Service/Service';

const Message = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    subject: '',
    sender: '',
    recipient: '',
    date: '',
    status: 'Unread',
  });
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const BASE_URL = 'http://localhost:5000';
  const fetchMessages = useCallback(async () => {
    setFetchError(null);
    try {
      const res = await axios.get(`${BASE_URL}/messages`, {
        params: {
          q: q || undefined,
          status: statusFilter || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        },
      });
      setMessages(res.data.messages || []);
    } catch (err) {
      setFetchError(err.message || 'Error fetching messages');
      setMessages([]);
    }
  }, [q, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const openNew = () => {
    setEditingId(null);
    setForm({ subject: '', sender: '', recipient: '', date: '', status: 'Unread' });
    setModalOpen(true);
  };

  const openEdit = (msg) => {
    setEditingId(msg._id);
    setForm({
      subject: msg.subject || '',
      sender: msg.sender || '',
      recipient: msg.recipient || '',
      date: msg.date ? new Date(msg.date).toISOString().slice(0,10) : '',
      status: msg.status || 'Unread',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/messages/${editingId}`, form);
      } else {
        await axios.post(`${BASE_URL}/messages`, form);
      }
      setModalOpen(false);
      setForm({ subject: '', sender: '', recipient: '', date: '', status: 'Unread' });
      await fetchMessages();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        alert('Error saving message: ' + err.response.data.error);
      } else {
        alert('Error saving message: ' + err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
  await axios.delete(`${BASE_URL}/messages/${id}`);
    await fetchMessages();
  };

  return (
    <div className="px-6 py-4">
      <div className="flex gap-8 mb-6 border-b">
        <button
          className={`pb-2 text-lg font-semibold ${activeTab === 'messages' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500'}`}
          onClick={() => setActiveTab('messages')}
        >
          Messages
        </button>
        <button
          className={`pb-2 text-lg font-semibold ${activeTab === 'services' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500'}`}
          onClick={() => setActiveTab('services')}
        >
          Services
        </button>
      </div>
      {activeTab === 'messages' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl font-bold text-[#0B3954]">Messages</div>
            <div className="flex gap-2">
              <button onClick={openNew} className="px-4 py-2 rounded-md bg-[#0B3954] text-white font-semibold hover:bg-[#0a2f46]">+ New Message</button>
              <button onClick={() => generateMessagesPDF(messages)} className="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700">Generate PDF</button>
            </div>
          </div>
          {/* Search & Filters */}
          <div className="bg-white rounded-lg shadow mb-4">
            <div className="grid grid-cols-12 gap-3 px-6 py-4 items-end">
              <div className="col-span-4">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Search (Subject)</label>
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search messages..."
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
                  <option value="Unread">Unread</option>
                  <option value="Read">Read</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div className="col-span-2 flex gap-2">
                <button
                  onClick={fetchMessages}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Apply
                </button>
                <button
                  onClick={() => { setQ(''); setStatusFilter('All'); setDateFrom(''); setDateTo(''); fetchMessages(); }}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow">
            <div className="grid grid-cols-10 px-6 py-3 text-sm font-semibold text-gray-500 border-b">
              <div className="col-span-2">SUBJECT</div>
              <div className="col-span-2">SENDER</div>
              <div className="col-span-2">RECIPIENT</div>
              <div className="col-span-2">DATE</div>
              <div className="col-span-1">STATUS</div>
              <div className="col-span-1 text-right">ACTIONS</div>
            </div>
            <div>
              {fetchError && (
                <div className="px-6 py-8 text-center text-red-500 font-semibold">{fetchError}</div>
              )}
              {!fetchError && messages.map((m) => (
                <div key={m._id} className="grid grid-cols-10 px-6 py-4 items-center border-b hover:bg-gray-50">
                  <div className="col-span-2 text-[#0B3954] font-medium">{m.subject}</div>
                  <div className="col-span-2">{m.sender}</div>
                  <div className="col-span-2">{m.recipient}</div>
                  <div className="col-span-2">{m.date ? new Date(m.date).toISOString().slice(0,10) : ''}</div>
                  <div className="col-span-1">{String(m.status) === 'true' || m.status === true ? 'Read' : 'Unread'}</div>
                  <div className="col-span-1 flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(m)} className="px-2 py-1 text-xs rounded-md border border-gray-300 text-[#0B3954] hover:bg-gray-100">Edit</button>
                    <button onClick={() => deleteMessage(m._id)} className="px-2 py-1 text-xs rounded-md border border-red-300 text-red-700 hover:bg-red-50">Delete</button>
                  </div>
                </div>
              ))}
              {!fetchError && messages.length === 0 && (
                <div className="px-6 py-8 text-center text-gray-500">No messages found.</div>
              )}
            </div>
          </div>
          {/* Modal */}
          <MessageInsert
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={handleSubmit}
            form={form}
            setForm={setForm}
            submitting={submitting}
            editingId={editingId}
          />
        </>
      )}
      {activeTab === 'services' && (
        <Service />
      )}
    </div>
  );
};

export default Message;

