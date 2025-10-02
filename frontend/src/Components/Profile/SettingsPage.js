import React, { useState } from 'react';
import userService from '../../services/userService';

function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notif, setNotif] = useState({ emailNotifications: true, smsNotifications: false, pushNotifications: true });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const updateNotif = (k) => setNotif(p => ({ ...p, [k]: !p[k] }));

  const changePass = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    try { setSaving(true); setError(''); setMessage(''); await userService.profile.changeMyPassword(currentPassword, newPassword); setMessage('Password updated successfully'); setCurrentPassword(''); setNewPassword(''); } catch (err) { setError(err?.response?.data?.message || err.message || 'Failed'); } finally { setSaving(false); }
  };

  const saveNotif = async () => {
    try { setSaving(true); setError(''); setMessage(''); await userService.profile.updateMyProfile({ notificationPreferences: notif }); setMessage('Preferences saved'); } catch (err) { setError(err?.response?.data?.message || err.message || 'Failed'); } finally { setSaving(false); }
  };

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-[#0B3954]">Settings</h1>
      <p className="text-gray-500 mt-1">Manage password & notification preferences.</p>
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={changePass} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Change Password</h2>
          {error && <div className="p-2 bg-red-100 border border-red-300 text-red-700 text-sm rounded">{error}</div>}
          {message && <div className="p-2 bg-green-100 border border-green-300 text-green-700 text-sm rounded">{message}</div>}
          <div>
            <label className="text-xs text-gray-500">Current Password</label>
            <input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3954]" />
          </div>
          <div>
            <label className="text-xs text-gray-500">New Password</label>
            <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3954]" />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-[#0B3954] text-white text-sm disabled:opacity-60">{saving? 'Updating...':'Update Password'}</button>
          </div>
        </form>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Notification Preferences</h2>
          <div className="space-y-3">
            {['emailNotifications','smsNotifications','pushNotifications'].map(key => (
              <label key={key} className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={notif[key]} onChange={()=>updateNotif(key)} className="w-4 h-4" />
                <span className="capitalize">{key.replace(/([A-Z])/g,' $1')}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={saveNotif} disabled={saving} className="px-4 py-2 rounded-lg bg-[#0B3954] text-white text-sm disabled:opacity-60">{saving? 'Saving...':'Save Preferences'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
