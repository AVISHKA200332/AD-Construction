import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import MessageInsert from '../MessaageInsert/MessageInsert';
import ClientServices from './ClientServices';

export default function ClientCommunication() {
  const [activeTab, setActiveTab] = useState('messages');
  const [messageTab, setMessageTab] = useState('inbox');
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [preview, setPreview] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ subject: '', message: '', recipientId: '' });
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const BASE = 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const fetchInbox = useCallback(async () => {
    try { const res = await axios.get(`${BASE}/messages/inbox`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }); setInbox(res.data.messages || []); } catch (_) { setInbox([]); }
  }, [BASE, token]);
  const fetchSent = useCallback(async () => {
    try { const res = await axios.get(`${BASE}/messages/sent`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }); setSent(res.data.messages || []); } catch (_) { setSent([]); }
  }, [BASE, token]);

  useEffect(() => { fetchInbox(); fetchSent(); (async ()=>{ try{ const token = localStorage.getItem('authToken'); const r = await axios.get(`${BASE}/users/directory`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }); setUsers(r.data.users||[]); }catch{} })(); }, [fetchInbox, fetchSent]);

  // refresh lists when another part of the app notifies a message was read
  useEffect(() => {
    const onMessageRead = () => { fetchInbox(); fetchSent(); };
    window.addEventListener('messageRead', onMessageRead);
    return () => window.removeEventListener('messageRead', onMessageRead);
  }, [fetchInbox, fetchSent]);

  const list = messageTab === 'inbox' ? inbox : sent;

  const openMessage = async (m) => {
    try {
      // Fetch the message so the server can auto-mark it read when recipient requests it
      const res = await axios.get(`${BASE}/messages/${m._id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const msg = res.data.message || res.data;
      setPreview(msg);
      // refresh lists to reflect read status
      await fetchInbox(); await fetchSent();
      // notify other parts of the app (e.g., Nav) that a message was read so UI like unread count can update immediately
      try { window.dispatchEvent(new CustomEvent('messageRead', { detail: { messageId: msg._id } })); } catch (e) { /* ignore in older browsers */ }
    } catch (err) {
      // fallback: show passed message
      setPreview(m);
      if (messageTab==='inbox' && !m.isRead) axios.patch(`${BASE}/messages/${m._id}/read`, {}, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).catch(()=>{});
    }
  };

  const submitMessage = async (e) => {
    e?.preventDefault(); setSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`${BASE}/messages/${editingId}`, { subject: form.subject, message: form.message, recipientId: form.recipientId }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      } else {
        await axios.post(`${BASE}/messages`, { subject: form.subject, message: form.message, recipientId: form.recipientId }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      }
      setComposeOpen(false); setForm({ subject:'', message:'', recipientId:'' }); setEditingId(null);
      await fetchInbox(); await fetchSent();
    } catch (err) { alert(err.response?.data?.error || err.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const openEdit = (m) => {
    setEditingId(m._id);
    setForm({ subject: m.subject || '', message: m.message || '', recipientId: m.recipientId || '' });
    setComposeOpen(true);
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await axios.delete(`${BASE}/messages/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      await fetchInbox(); await fetchSent();
    } catch (err) { alert(err.response?.data?.error || err.message || 'Delete failed'); }
  };

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3954]">Communication</h1>
          <p className="text-gray-600 mt-1">Messages and service requests.</p>
        </div>
        <div className="flex gap-2">
          <button className={`px-3 py-2 rounded ${activeTab==='messages' ? 'bg-[#0B3954] text-white' : 'border'}`} onClick={()=>setActiveTab('messages')}>Messages</button>
          <button className={`px-3 py-2 rounded ${activeTab==='services' ? 'bg-[#0B3954] text-white' : 'border'}`} onClick={()=>setActiveTab('services')}>Services</button>
        </div>
      </div>

      {activeTab==='messages' ? (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2">
              <button className={`px-2 py-1 rounded ${messageTab==='inbox' ? 'bg-gray-100' : ''}`} onClick={()=>setMessageTab('inbox')}>Inbox</button>
              <button className={`px-2 py-1 rounded ${messageTab==='sent' ? 'bg-gray-100' : ''}`} onClick={()=>setMessageTab('sent')}>Sent</button>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>setComposeOpen(true)} className="px-3 py-1 rounded bg-green-600 text-white">+ New</button>
            </div>
          </div>

          <div>
            {list.length===0 ? <div className="text-gray-500 p-6">No messages.</div> : list.map(m=> (
              <div key={m._id} className={`border-b p-3 ${!m.isRead && messageTab==='inbox' ? 'bg-yellow-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="cursor-pointer" onClick={()=>openMessage(m)}>
                    <div className="font-medium text-[#0B3954]">{m.subject}</div>
                    <div className="text-sm text-gray-600 line-clamp-1">{m.message}</div>
                    <div className="text-xs text-gray-400 mt-1">{messageTab==='inbox' ? `From: ${m.sender}` : `To: ${m.recipient}`}</div>
                    {messageTab==='sent' && (
                      <div className="text-xs mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs ${m.isRead ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{m.isRead ? 'Read' : 'Unread'}</span>
                        {m.readAt && m.isRead && <span className="ml-2 text-gray-400 text-xs">Read: {new Date(m.readAt).toLocaleString()}</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={()=>openMessage(m)} className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-sm hover:bg-blue-100">View</button>
                    <button onClick={()=>openEdit(m)} className="px-3 py-1 rounded-md bg-gray-50 text-gray-700 text-sm hover:bg-gray-100">Edit</button>
                    <button onClick={()=>deleteMessage(m._id)} className="px-3 py-1 rounded-md bg-red-50 text-red-700 text-sm hover:bg-red-100">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <ClientServices />
      )}

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={()=>setPreview(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl p-6 z-10">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold">{preview.subject}</h3>
                <div className="text-sm text-gray-500">From: {preview.sender}</div>
              </div>
              <button onClick={()=>setPreview(null)} className="text-gray-500">✕</button>
            </div>
            <div className="whitespace-pre-wrap text-gray-800">{preview.message}</div>
          </div>
        </div>
      )}

      <MessageInsert open={composeOpen} onClose={()=>setComposeOpen(false)} onSubmit={submitMessage} form={form} setForm={setForm} submitting={submitting} users={users} />
    </div>
  );
}

