import React, { useEffect, useState } from 'react';
import userService from '../../services/userService';

// Small reusable badge
const Badge = ({ children, color = 'indigo' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${color}-100 text-${color}-800`}>{children}</span>
);

function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activity, setActivity] = useState([]);
  const [fileUploading, setFileUploading] = useState(false);

  const localUser = (() => { try { return JSON.parse(localStorage.getItem('userData')||'null'); } catch { return null; } })();
  const role = localUser?.role || 'Client';

  const [form, setForm] = useState({
    name: '',
    gmail: '',
    phone: '',
    age: '',
    address: '',
    profileImage: '',
    companyDetails: { companyName: '', companyAddress: '', companyPhone: '', contactPerson: '' },
    projectsManaged: [],
    assignedSites: [],
    skills: [],
    availability: { status: 'Available', availableFrom: '', notes: '' },
    notificationPreferences: { emailNotifications: true, smsNotifications: false, pushNotifications: true }
  });

  // Fetch profile
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await userService.profile.getMyProfile();
        const u = res.user || {};
        setForm(f => ({ ...f, ...u, age: u.age != null ? String(u.age) : '', availability: { ...(f.availability||{}), ...(u.availability||{}) } }));
      } catch (e) {
        setError(e?.response?.data?.message || e.message || 'Failed to load profile');
      } finally { setLoading(false); }
    };
    load();
  }, []);

  // Fetch activity
  useEffect(() => {
    const loadActivity = async () => {
      try { setActivityLoading(true); const res = await userService.profile.getMyActivity(); setActivity(res.logs||[]); } catch { /* ignore */ } finally { setActivityLoading(false); }
    };
    loadActivity();
  }, []);

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(''); setSuccess('');
  };

  const updateNested = (section, key, value) => {
    setForm(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  };

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { setFileUploading(true); const res = await userService.profile.uploadMyProfileImage(file); setForm(f => ({ ...f, ...res.user })); localStorage.setItem('userData', JSON.stringify({ ...(localUser||{}), ...res.user })); setSuccess('Image updated'); } catch (err) { setError(err?.response?.data?.message||err.message); } finally { setFileUploading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true); setError(''); setSuccess('');
      const payload = { name: form.name, phone: form.phone, age: form.age ? Number(form.age) : undefined, address: form.address, companyDetails: form.companyDetails, projectsManaged: form.projectsManaged, assignedSites: form.assignedSites, skills: form.skills, availability: form.availability, notificationPreferences: form.notificationPreferences };
      const res = await userService.profile.updateMyProfile(payload);
      setForm(f => ({ ...f, ...res.user, age: res.user.age != null ? String(res.user.age) : '' }));
      localStorage.setItem('userData', JSON.stringify({ ...(localUser||{}), ...res.user }));
      setSuccess('Profile saved');
    } catch (err) { setError(err?.response?.data?.message || err.message || 'Update failed'); } finally { setSaving(false); }
  };

  // Role-specific panels
  const rolePanels = {
    'Client': (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Company Details</h3>
        {['companyName','companyAddress','companyPhone','contactPerson'].map(field => (
          <div key={field}>
            <label className="text-xs text-gray-500 capitalize">{field.replace(/([A-Z])/g,' $1')}</label>
            <input value={form.companyDetails?.[field]||''} onChange={e=>updateNested('companyDetails', field, e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3954]" />
          </div>
        ))}
      </div>
    ),
    'Project Manager': (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Projects Managed (IDs)</h3>
        <textarea value={(form.projectsManaged||[]).join(',')} onChange={e=>setForm(p=>({...p, projectsManaged: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3954]" placeholder="Comma separated project IDs" />
      </div>
    ),
    'Site Supervisor': (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Assigned Sites</h3>
        <textarea value={(form.assignedSites||[]).join('\n')} onChange={e=>setForm(p=>({...p, assignedSites: e.target.value.split(/\n/).map(s=>s.trim()).filter(Boolean)}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3954]" placeholder="One site per line" />
      </div>
    ),
    'Labor': (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Skills</h3>
          <input value={(form.skills||[]).join(',')} onChange={e=>setForm(p=>({...p, skills: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}))} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3954]" placeholder="Comma separated skills" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Availability</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500">Status</label>
              <select value={form.availability?.status||'Available'} onChange={e=>updateNested('availability','status', e.target.value)} className="mt-1 w-full border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3954]">
                {['Available','Busy','Leave','Unavailable'].map(s=> <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Available From</label>
              <input type="date" value={form.availability?.availableFrom? form.availability.availableFrom.substring(0,10):''} onChange={e=>updateNested('availability','availableFrom', e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3954]" />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs text-gray-500">Notes</label>
              <textarea value={form.availability?.notes||''} onChange={e=>updateNested('availability','notes', e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3954]" />
            </div>
          </div>
        </div>
      </div>
    )
  };

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-[#0B3954]">Profile</h1>
      <p className="text-gray-500 mt-1">Role-based profile management.</p>
      {loading ? <div className="mt-6 bg-white p-6 rounded-xl shadow-sm">Loading...</div> : (
        <form onSubmit={handleSave} className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden">
                {form.profileImage ? <img src={form.profileImage} className="w-full h-full object-cover" alt="Profile" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>}
              </div>
              <label className="mt-3 text-xs text-[#0B3954] cursor-pointer font-medium">
                {fileUploading ? 'Uploading...' : 'Upload Image'}
                <input type="file" accept="image/*" onChange={handleImageFile} disabled={fileUploading} className="hidden" />
              </label>
              <div className="mt-4 text-center">
                <div className="text-sm font-semibold text-gray-800">{form.name}</div>
                <div className="text-xs text-gray-500">{form.gmail}</div>
                <div className="mt-2"><Badge>{role}</Badge></div>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h3>
              {activityLoading ? <div className="text-xs text-gray-400">Loading...</div> : (
                <ul className="space-y-2 max-h-64 overflow-auto text-xs">
                  {activity.length === 0 && <li className="text-gray-400">No activity</li>}
                  {activity.map(a => <li key={a.at + a.action} className="flex justify-between gap-2"><span className="font-medium text-gray-600">{a.action}</span><span className="text-gray-400">{new Date(a.at).toLocaleDateString()}</span></li>)}
                </ul>
              )}
            </div>
          </div>
          {/* Right panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              {error && <div className="mb-3 p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm">{error}</div>}
              {success && <div className="mb-3 p-3 bg-green-100 border border-green-300 text-green-700 rounded text-sm">{success}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Name</label>
                  <input name="name" value={form.name} onChange={updateField} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3954]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Gmail</label>
                  <input name="gmail" value={form.gmail} disabled className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Phone</label>
                  <input name="phone" value={form.phone||''} onChange={updateField} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3954]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Age</label>
                  <input type="number" name="age" min="0" value={form.age} onChange={updateField} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3954]" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500">Address</label>
                  <input name="address" value={form.address||''} onChange={updateField} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3954]" />
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              {rolePanels[role] || <div className="text-sm text-gray-500">No extra fields for this role.</div>}
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={()=>window.history.back()} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-[#0B3954] text-white text-sm disabled:opacity-60">{saving? 'Saving...':'Save Changes'}</button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default ProfilePage;
