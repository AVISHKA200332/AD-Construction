import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MessageInsert from '../MessaageInsert/MessageInsert';
import { generateMessagesPDF } from '../../utils/pdfUtils';
import Service from '../Service/Service';

function AdminCommunication() {
  return <Message />;
}

const StatusBadge = ({ status }) => {
  const map = {
    Read: 'bg-green-100 text-green-700',
    Unread: 'bg-yellow-100 text-yellow-700',
    Archived: 'bg-gray-100 text-gray-700',
  };
  const cls = map[status] || map.Archived;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{status}</span>;
};

const Message = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    subject: '',
    message: '',
    recipientId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [users, setUsers] = useState([]);

  const BASE_URL = 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const fetchMessages = async () => {
    setFetchError(null);
    try {
      const res = await axios.get(`${BASE_URL}/messages`);
      setMessages(res.data.messages || []);
    } catch (err) {
      setFetchError(err.message || 'Error fetching messages');
      setMessages([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/users`);
      setUsers(res.data.users || []);
    } catch (e) {
      // Non-blocking
      console.warn('Failed to load users list', e);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, []);

  const filteredMessages = messages.filter((m) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    const dateStr = m.date ? new Date(m.date).toISOString().slice(0, 10) : '';
    return [m.subject, m.sender, m.recipient, m.status, dateStr]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(q));
  });

  const openNew = () => {
    setEditingId(null);
    setForm({ subject: '', message: '', recipientId: '' });
    setModalOpen(true);
  };

  const openEdit = (msg) => {
    setEditingId(msg._id);
    setForm({
      subject: msg.subject || '',
      sender: msg.sender || '',
      recipient: msg.recipient || '',
      date: msg.date ? new Date(msg.date).toISOString().slice(0, 10) : '',
      status: msg.status || 'Unread',
      message: msg.message || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/messages/${editingId}`, form, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
      } else {
        const payload = {
          subject: form.subject,
          message: form.message,
          recipientId: form.recipientId,
        };
        await axios.post(`${BASE_URL}/messages`, payload, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
      }
      setModalOpen(false);
      setForm({ subject: '', message: '', recipientId: '' });
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
    await axios.delete(`${BASE_URL}/messages/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    await fetchMessages();
  };

  const markRead = async (msg) => {
    try {
      await axios.patch(`${BASE_URL}/messages/${msg._id}/read`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      // Optimistic update
      setMessages((prev) => prev.map(m => m._id === msg._id ? { ...m, isRead: true, status: 'Read' } : m));
    } catch (e) {
      // ignore if not allowed (not recipient)
    }
  };

  return (
    <div className="px-6 py-4">
      <div className="flex gap-8 mb-6 border-b">
        <button
          className={`pb-2 text-lg font-semibold ${
            activeTab === 'messages'
              ? 'border-b-2 border-blue-600 text-blue-700'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('messages')}
        >
          Messages
        </button>
        <button
          className={`pb-2 text-lg font-semibold ${
            activeTab === 'services'
              ? 'border-b-2 border-blue-600 text-blue-700'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('services')}
        >
          Services
        </button>
      </div>

      {activeTab === 'messages' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col gap-2 w-full max-w-xl">
              <div className="text-2xl font-bold text-[#0B3954]">Messages</div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search messages..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B3954]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={openNew}
                className="px-4 py-2 rounded-md bg-[#0B3954] text-white font-semibold hover:bg-[#0a2f46]"
              >
                + New Message
              </button>
              <button
                onClick={() => generateMessagesPDF(filteredMessages)}
                className="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700"
              >
                Generate PDF
              </button>
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
                <div className="px-6 py-8 text-center text-red-500 font-semibold">
                  {fetchError}
                </div>
              )}
              {!fetchError &&
                filteredMessages.map((m) => (
                  <div
                    key={m._id}
                    className={`grid grid-cols-10 px-6 py-4 items-center border-b hover:bg-gray-50 cursor-pointer ${m.status === 'Unread' ? 'bg-yellow-50' : ''}`}
                    onClick={() => markRead(m)}
                  >
                    <div className="col-span-2 text-[#0B3954] font-medium">{m.subject}</div>
                    <div className="col-span-2">{m.sender}</div>
                    <div className="col-span-2">{m.recipient}</div>
                    <div className="col-span-2">
                      {m.date ? new Date(m.date).toISOString().slice(0, 10) : ''}
                    </div>
                    <div className="col-span-1"><StatusBadge status={m.status} /></div>
                    <div className="col-span-1 flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(m); }}
                        className="px-2 py-1 text-xs rounded-md border border-gray-300 text-[#0B3954] hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteMessage(m._id); }}
                        className="px-2 py-1 text-xs rounded-md border border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              {!fetchError && filteredMessages.length === 0 && (
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
            users={users}
          />
        </>
      )}

      {activeTab === 'services' && <Service />}
    </div>
  );
};

export default AdminCommunication;
