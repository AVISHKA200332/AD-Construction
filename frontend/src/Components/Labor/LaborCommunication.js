import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import MessageInsert from "../MessaageInsert/MessageInsert";
import LaborServices from "./LaborServices";

function PreviewModal({ open, onClose, message }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !message) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-2xl p-6 z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-semibold text-[#0B3954]">{message.subject}</h3>
            <p className="text-sm text-gray-500 mt-1">
              From <span className="font-medium text-gray-700">{message.sender}</span>
              <span className="mx-2">•</span>
              {message.date ? new Date(message.date).toLocaleString() : ''}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close preview">✕</button>
        </div>
        <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">{message.message}</div>
        <div className="mt-6 text-right">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-[#0B3954] text-white hover:bg-[#0a2f46]">Close</button>
        </div>
      </div>
    </div>
  );
}

function LaborCommunication() {
  const [activeTab, setActiveTab] = useState('messages');
  const [messagesTab, setMessagesTab] = useState('my');
  const [myMessages, setMyMessages] = useState([]);
  const [sent, setSent] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ subject: '', message: '', recipientId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null); // used for modal preview on mobile
  const [selected, setSelected] = useState(null); // used for desktop right-side preview
  const [isMobile, setIsMobile] = useState(false);

  const BASE_URL = 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const validate = (values) => {
    const errs = {};
    if (!values.subject || values.subject.trim().length < 3)
      errs.subject = 'Subject must be at least 3 characters.';
    if (!values.message || values.message.trim().length < 10)
      errs.message = 'Message must be at least 10 characters.';
    if (!editingId && !values.recipientId)
      errs.recipientId = 'Recipient is required.';
    return errs;
  };

  const fetchMy = useCallback(async () => {
    setFetchError(null);
    try {
      const res = await axios.get(`${BASE_URL}/messages/my`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setMyMessages(res.data.messages || []);
    } catch (err) {
      setFetchError(err.message || 'Error fetching messages');
      setMyMessages([]);
    }
  }, [BASE_URL, token]);

  const fetchSent = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/messages/sent`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setSent(res.data.messages || []);
    } catch (_) {
      setSent([]);
    }
  }, [BASE_URL, token]);

  const loadUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/users`);
      setUsers(res.data.users || []);
    } catch (_) {}
  }, [BASE_URL]);

  useEffect(() => { fetchMy(); fetchSent(); loadUsers(); }, [fetchMy, fetchSent, loadUsers]);

  // detect mobile width to switch preview behaviour
  useEffect(() => {
    const onResize = () => setIsMobile(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const list = messagesTab === 'my' ? myMessages : sent;
  const filteredMessages = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return list;
    return list.filter((msg) => {
      const dateStr = msg.date ? new Date(msg.date).toISOString().slice(0, 10) : '';
      return [msg.subject, msg.sender, msg.recipient, dateStr]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q));
    });
  }, [list, searchTerm]);

  const openNew = () => {
    setEditingId(null);
    setForm({ subject: '', message: '', recipientId: '' });
    setModalOpen(true);
  };

  const openEdit = (msg) => {
    setEditingId(msg._id);
    setForm({
      subject: msg.subject || '',
      message: msg.message || '',
      recipientId: msg.recipientId || '',
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
        await axios.put(`${BASE_URL}/messages/${editingId}`, form, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      } else {
        const payload = { subject: form.subject, recipientId: form.recipientId, message: form.message };
        await axios.post(`${BASE_URL}/messages`, payload, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      }
      setModalOpen(false);
      setForm({ subject: '', message: '', recipientId: '' });
      await fetchMy();
      await fetchSent();
    } catch (err) {
      alert('Error saving message: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    await axios.delete(`${BASE_URL}/messages/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    await fetchMy();
    await fetchSent();
  };

  return (
    <div className="px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl md:text-2xl font-bold text-[#0B3954]">Labor Communication</h1>
          <p className="text-gray-600 mt-2">Task updates, safety notices and announcements.</p>
        </div>
        {activeTab === 'messages' && (
          <div className="flex items-center gap-3">
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#0B3954] text-white font-semibold hover:bg-[#0a2f46] shadow"
            >
              <span className="text-lg">＋</span>
              <span>New Message</span>
            </button>
          </div>
        )}
      </div>

      {fetchError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{fetchError}</p>
        </div>
      )}

      <div className="mb-6 bg-white border border-gray-100 rounded-xl shadow-sm">
        {/* Main Tabs */}
        <div className="border-b border-gray-100">
          <div className="flex">
            <button
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'messages'
                  ? 'border-[#0B3954] text-[#0B3954]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('messages')}
            >
              Messages
            </button>
            <button
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'services'
                  ? 'border-[#0B3954] text-[#0B3954]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('services')}
            >
              Services
            </button>
          </div>
        </div>

        {activeTab === 'messages' && (
          <>
            {/* Messages Sub-tabs */}
            <div className="border-b border-gray-100">
              <div className="flex items-center gap-3 px-6 py-3">
                <div className="inline-flex rounded-md bg-gray-50 p-1">
                  <button
                    onClick={() => setMessagesTab('my')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${messagesTab === 'my' ? 'bg-white shadow text-[#0B3954]' : 'text-gray-600 hover:bg-gray-100'}`}
                    aria-pressed={messagesTab === 'my'}
                  >
                    My Messages
                  </button>
                  <button
                    onClick={() => setMessagesTab('sent')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${messagesTab === 'sent' ? 'bg-white shadow text-[#0B3954]' : 'text-gray-600 hover:bg-gray-100'}`}
                    aria-pressed={messagesTab === 'sent'}
                  >
                    Sent
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6 mt-4">
                <div className="flex items-center gap-3 px-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0B3954]"
                  />
                  <button onClick={() => { setSearchTerm(''); }} className="text-sm text-gray-500 hover:text-gray-700">Clear</button>
                </div>
              </div>

              {filteredMessages.length === 0 ? (
                <div className="py-10 text-center">
                  <svg width="84" height="84" viewBox="0 0 24 24" fill="none" className="mx-auto mb-4 opacity-60">
                    <path d="M3 8a4 4 0 014-4h10a4 4 0 014 4v6a4 4 0 01-4 4H7l-4 4V8z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 9h8M8 13h5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="text-gray-500 text-center">No messages found. Click <span className="font-medium text-[#0B3954]">New Message</span> to create one.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-3">
                    {filteredMessages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`border rounded-lg p-4 transition-shadow bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${!msg.isRead ? 'ring-1 ring-yellow-100' : ''}`}
                      >
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">{msg.subject}</h4>
                          <p className="text-sm text-gray-500">{messagesTab === 'my' ? `From: ${msg.sender}` : `To: ${msg.recipient}`}</p>
                          <p className="text-xs text-gray-400 mt-1">{msg.date ? new Date(msg.date).toLocaleString() : ''}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (isMobile) setPreview(msg);
                              else setSelected(msg);
                            }}
                            className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-sm hover:bg-blue-100"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openEdit(msg)}
                            className="px-3 py-1 rounded-md bg-gray-50 text-gray-700 text-sm hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteMessage(msg._id)}
                            className="px-3 py-1 rounded-md bg-red-50 text-red-700 text-sm hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right preview column */}
                  <div className="hidden md:block">
                    <div className="sticky top-6 space-y-3">
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <h5 className="text-sm font-semibold text-gray-700">Preview</h5>
                        {selected ? (
                          <div className="mt-3">
                            <h4 className="font-medium text-gray-900">{selected.subject}</h4>
                            <p className="text-xs text-gray-500">{selected.sender} • {selected.date ? new Date(selected.date).toLocaleString() : ''}</p>
                            <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{selected.message}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 mt-2">Select a message to see details here.</p>
                        )}
                      </div>
                      <div className="p-3 text-center">
                        <button onClick={() => setSelected(null)} className="text-sm text-gray-500 hover:underline">Clear Preview</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {activeTab === 'services' && <LaborServices />}

      {activeTab === 'messages' && (
        <MessageInsert
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
      )}

      <PreviewModal open={!!preview} onClose={() => setPreview(null)} message={preview} />
    </div>
  );
}

export default LaborCommunication;
