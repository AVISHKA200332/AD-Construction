import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import MessageInsert from "../MessaageInsert/MessageInsert";

function Badge({ children, type = 'default' }) {
  const styles = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[type]}`}>{children}</span>
  );
}

function PreviewModal({ open, onClose, message }) {
  if (!open || !message) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl p-6 z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-[#0B3954]">{message.subject}</h3>
            <p className="text-sm text-gray-500 mt-1">
              From <span className="font-medium text-gray-700">{message.sender}</span>
              <span className="mx-2">•</span>
              {message.date ? new Date(message.date).toLocaleString() : ''}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">{message.message}</div>
        <div className="mt-6 text-right">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-[#0B3954] text-white hover:bg-[#0a2f46]">Close</button>
        </div>
      </div>
    </div>
  );
}

function ClientCommunication() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ subject: '', message: '', recipientId: '' });
  const BASE_URL = "http://localhost:5000";
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const fetchInbox = useCallback(async () => {
    setError("");
    try {
      const res = await axios.get(`${BASE_URL}/messages/inbox`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setInbox(res.data.messages || []);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Failed to load inbox');
      setInbox([]);
    }
  }, [BASE_URL, token]);

  const deleteMessage = useCallback(async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await axios.delete(`${BASE_URL}/messages/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      // Remove from current list(s)
      setInbox(prev => prev.filter(m => m._id !== id));
      setSent(prev => prev.filter(m => m._id !== id));
    } catch (e) {
      alert(e.response?.data?.error || e.message || 'Failed to delete message');
    }
  }, [BASE_URL, token]);

  const fetchSent = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/messages/sent`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setSent(res.data.messages || []);
    } catch (_) {
      setSent([]);
    }
  }, [BASE_URL, token]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/users`);
      setUsers(res.data.users || []);
    } catch (_) {
      setUsers([]);
    }
  }, [BASE_URL]);

  const markRead = useCallback(async (msg) => {
    try {
      await axios.patch(`${BASE_URL}/messages/${msg._id}/read`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setInbox(prev => prev.map(m => m._id === msg._id ? { ...m, isRead: true, status: 'Read' } : m));
    } catch (_) {}
  }, [BASE_URL, token]);

  useEffect(() => {
    fetchInbox();
    fetchSent();
    fetchUsers();
  }, [fetchInbox, fetchSent, fetchUsers]);

  const list = activeTab === 'inbox' ? inbox : sent;
  const unreadCount = useMemo(() => inbox.filter(m => !m.isRead).length, [inbox]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(m => [m.subject, m.sender, m.recipient, m.status].filter(Boolean).some(v => String(v).toLowerCase().includes(q)));
  }, [list, search]);

  const openMessage = (m) => {
    setPreview(m);
    if (activeTab === 'inbox' && !m.isRead) markRead(m);
  };

  const openNew = () => {
    setForm({ subject: '', message: '', recipientId: '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { subject: form.subject, message: form.message, recipientId: form.recipientId };
      await axios.post(`${BASE_URL}/messages`, payload, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setModalOpen(false);
      setForm({ subject: '', message: '', recipientId: '' });
      await fetchInbox();
      setActiveTab('inbox');
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3954]">Communication</h1>
          <p className="text-gray-600 mt-1">Your messages and updates.</p>
        </div>
        <div className="w-full max-w-sm flex items-center gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search messages..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B3954]"
          />
          <button
            onClick={() => { fetchInbox(); if (activeTab==='sent') fetchSent(); }}
            className="px-3 py-2 rounded-md bg-[#0B3954] text-white hover:bg-[#0a2f46]"
            title="Refresh"
          >
            Refresh
          </button>
          <button
            onClick={openNew}
            className="px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
            title="New Message"
          >
            + New
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b mb-4">
        <button
          className={`pb-2 font-semibold ${activeTab==='inbox' ? 'border-b-2 border-[#0B3954] text-[#0B3954]' : 'text-gray-500'}`}
          onClick={() => setActiveTab('inbox')}
        >
          Inbox {unreadCount > 0 && <span className="ml-2 text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5">{unreadCount}</span>}
        </button>
        <button
          className={`pb-2 font-semibold ${activeTab==='sent' ? 'border-b-2 border-[#0B3954] text-[#0B3954]' : 'text-gray-500'}`}
          onClick={() => setActiveTab('sent')}
        >
          Sent
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-12 px-6 py-3 text-sm font-semibold text-gray-500 border-b">
          <div className="col-span-5">Subject</div>
          <div className="col-span-3">{activeTab==='inbox' ? 'Sender' : 'Recipient'}</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Status</div>
        </div>

        {error && <div className="px-6 py-6 text-red-600">{error}</div>}
        {!error && filtered.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">No messages found.</div>
        )}

        {!error && filtered.map((m) => (
          <div
            key={m._id}
            className={`grid grid-cols-12 px-6 py-4 items-center border-b hover:bg-gray-50 cursor-pointer ${!m.isRead && activeTab==='inbox' ? 'bg-yellow-50' : ''}`}
            onClick={() => openMessage(m)}
          >
            <div className="col-span-5 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {!m.isRead && activeTab==='inbox' && <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />}
                <span className="text-[#0B3954] font-medium">{m.subject}</span>
              </div>
              {m.message && (
                <div className="text-xs text-gray-500 line-clamp-1">{m.message}</div>
              )}
            </div>
            <div className="col-span-3">{activeTab==='inbox' ? m.sender : m.recipient}</div>
            <div className="col-span-2">{m.date ? new Date(m.date).toLocaleDateString() : ''}</div>
            <div className="col-span-2">
              {m.status === 'Read' ? (
                <Badge type="success">Read</Badge>
              ) : m.status === 'Unread' ? (
                <Badge type="warning">Unread</Badge>
              ) : (
                <Badge>Archived</Badge>
              )}
            </div>
            {activeTab==='inbox' && (
              <div className="col-span-12 md:col-span-12 flex justify-end mt-2 md:mt-0">
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMessage(m._id); }}
                  className="px-2 py-1 text-xs rounded-md border border-red-300 text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <PreviewModal open={!!preview} onClose={() => setPreview(null)} message={preview} />

      <MessageInsert
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        submitting={submitting}
        editingId={null}
        users={users}
      />
    </div>
  );
}

export default ClientCommunication;
