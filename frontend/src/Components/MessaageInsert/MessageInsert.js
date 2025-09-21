import React from 'react';

const MessageInsert = ({ open, onClose, onSubmit, form, setForm, submitting, editingId }) => {
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-start justify-center">
			<div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
			<div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mt-10">
				<div className="flex items-center justify-between px-6 py-4 border-b">
					<h3 className="text-xl font-bold text-[#0B3954]">{editingId ? 'Edit Message' : 'New Message'}</h3>
					<button onClick={onClose} className="text-gray-500 text-xl">×</button>
				</div>
				<form onSubmit={onSubmit} className="p-6 space-y-4">
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
						<input value={form.subject} onChange={e=>setForm({...form, subject:e.target.value})} type="text" className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
					</div>
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-1">Sender</label>
						<input value={form.sender} onChange={e=>setForm({...form, sender:e.target.value})} type="text" className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
					</div>
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-1">Recipient</label>
						<input value={form.recipient} onChange={e=>setForm({...form, recipient:e.target.value})} type="text" className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
					</div>
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
						<input value={form.date} onChange={e=>setForm({...form, date:e.target.value})} type="date" className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
					</div>
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
						<select value={form.status} onChange={e=>setForm({...form, status:e.target.value})} className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400">
							<option value="Unread">Unread</option>
							<option value="Read">Read</option>
						</select>
					</div>
					<div className="flex justify-end gap-3 pt-2">
						<button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-100 text-[#0B3954] hover:bg-gray-200">Cancel</button>
						<button disabled={submitting} type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60">{submitting ? 'Saving...' : 'Save'}</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default MessageInsert;
