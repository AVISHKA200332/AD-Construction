import React, { useState } from 'react';

const MessageInsert = ({ open, onClose, onSubmit, form, setForm, submitting, editingId }) => {
	const [errors, setErrors] = useState({});

	if (!open) return null;

	const validate = () => {
		const newErrors = {};
		if (!form.subject || form.subject.trim().length < 3) {
			newErrors.subject = 'Subject is required (min 3 characters).';
		}
		if (!form.recipient || form.recipient.trim().length < 3) {
			newErrors.recipient = 'Recipient is required (min 3 characters).';
		}
		if (!form.message || form.message.trim().length < 5) {
			newErrors.message = 'Message is required (min 5 characters).';
		}
		if (!form.date) {
			newErrors.date = 'Date is required.';
		}
		return newErrors;
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const validationErrors = validate();
		setErrors(validationErrors);
		if (Object.keys(validationErrors).length === 0) {
			onSubmit(e);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-start justify-center">
			<div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
			<div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mt-10">
				<div className="flex items-center justify-between px-6 py-4 border-b">
					<h3 className="text-xl font-bold text-[#0B3954]">{editingId ? 'Edit Message' : 'New Message'}</h3>
					<button onClick={onClose} className="text-gray-500 text-xl">×</button>
				</div>
				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
						<input value={form.subject} onChange={e=>setForm({...form, subject:e.target.value})} type="text" className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
						{errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
					</div>
					{/*<div>
						<label className="block text-sm font-semibold text-gray-700 mb-1">Sender</label>
						<input value={form.sender} onChange={e=>setForm({...form, sender:e.target.value})} type="text" className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400" required />
					</div>*/}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-1">Recipient</label>
						<input value={form.recipient} onChange={e=>setForm({...form, recipient:e.target.value})} type="text" className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
						{errors.recipient && <p className="text-red-500 text-xs mt-1">{errors.recipient}</p>}
					</div>
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
						<textarea value={form.message} onChange={e=>setForm({...form, message:e.target.value})} className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400" rows={3} />
						{errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
					</div>
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
						<input value={form.date} onChange={e=>setForm({...form, date:e.target.value})} type="date" className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
						{errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
					</div>
					{/*<div>
						<label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
						<select value={form.status} onChange={e=>setForm({...form, status:e.target.value})} className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400">
							<option value="Unread">Unread</option>
							<option value="Read">Read</option>
						</select>
					</div>*/}
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
