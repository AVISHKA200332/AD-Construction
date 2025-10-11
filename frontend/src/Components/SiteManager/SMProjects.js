import React, { useEffect, useMemo, useState } from 'react';
import { projectService } from '../../services/projectService';
import userService from '../../services/userService';
import { roleOpsService } from '../../services/roleOpsService';

// Reusable input component
const Field = ({ label, children }) => (
  <label className="block text-sm mb-3">
    <span className="text-gray-600 font-medium">{label}</span>
    <div className="mt-1">{children}</div>
  </label>
);

export default function SMProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    budget: '',
    status: 'Planning',
    priority: 'Medium',
    completion: 0,
    description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [supModal, setSupModal] = useState(false);
  const [supLoading, setSupLoading] = useState(false);
  const [supervisors, setSupervisors] = useState([]);
  const [assignProjectId, setAssignProjectId] = useState(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');

  // Load projects
  const load = async () => {
    setLoading(true); setError('');
    try {
      let list = [];
      try {
        const scoped = await roleOpsService.getSMProjects();
        list = Array.isArray(scoped?.projects) ? scoped.projects : [];
      } catch (_) {
        const data = await projectService.getAllProjects();
        list = Array.isArray(data?.projects) ? data.projects : [];
      }
      setProjects(list);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load projects');
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); }, []);

  const openAssignSupervisor = async (projectId) => {
    setAssignProjectId(projectId);
    setSupModal(true);
    setSupLoading(true);
    try {
      const ss1 = await userService.getAllUsers({ role: 'Site Supervisor', limit: 100 });
      const ss2 = await userService.getAllUsers({ role: 'Supervisor', limit: 100 });
      const arr = [...(ss1.users||[]), ...(ss2.users||[])];
      // unique by _id
      const map = new Map();
      arr.forEach(u => { if (!map.has(u._id)) map.set(u._id, u); });
      setSupervisors(Array.from(map.values()));
    } catch (_) { setSupervisors([]); }
    finally { setSupLoading(false); }
  };

  const assignSupervisor = async () => {
    if (!assignProjectId || !selectedSupervisor) return;
    try {
      await roleOpsService.addSupervisor(assignProjectId, selectedSupervisor);
      alert('Supervisor assigned');
      setSupModal(false);
      setAssignProjectId(null);
      setSelectedSupervisor('');
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Failed to assign');
    }
  };

  const filtered = useMemo(()=> {
    return projects
      .filter(p => statusFilter==='All' || p.status===statusFilter)
      .filter(p => priorityFilter==='All' || p.priority===priorityFilter)
      .filter(p => !search || (p.name?.toLowerCase().includes(search.toLowerCase()) || p.projectId?.toLowerCase().includes(search.toLowerCase())));
  }, [projects, statusFilter, priorityFilter, search]);

  const resetForm = () => {
    setForm({ name:'', startDate:'', endDate:'', budget:'', status:'Planning', priority:'Medium', completion:0, description:'' });
    setEditingId(null);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name || '',
      startDate: p.startDate ? new Date(p.startDate).toISOString().slice(0,10) : '',
      endDate: p.endDate ? new Date(p.endDate).toISOString().slice(0,10) : '',
      budget: p.budget != null ? String(p.budget) : '',
      status: p.status || 'Planning',
      priority: p.priority || 'Medium',
      completion: p.completion != null ? p.completion : 0,
      description: p.description || ''
    });
    setEditingId(p._id); setModalOpen(true);
  };

  // Helpers for input validation/sanitization
  const RESTRICTED_CHARS = /[!#$%]/g; // block ! # $ % for sanitization
  const RESTRICTED_CHARS_TEST = /[!#$%]/; // non-global for .test checks
  const sanitizeText = (val) => val.replace(RESTRICTED_CHARS, '');
  const digitsOnly = (val) => val.replace(/\D+/g, '');

  const todayStr = useMemo(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    // toISOString returns UTC; slice(0,10) is fine for min attribute
    return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'name' || name === 'description') {
      v = sanitizeText(v);
    }
    if (name === 'budget') {
      v = digitsOnly(v);
    }
    if (name === 'completion') {
      // Allow only 0-100 integers
      const n = String(v).replace(/[^0-9]/g, '');
      v = n;
    }
    setForm(prev => ({ ...prev, [name]: v }));
  };

  const validate = () => {
    const errors = [];
  if (!form.name.trim()) errors.push('Name required');
  if (RESTRICTED_CHARS_TEST.test(form.name)) errors.push('Name cannot include !, #, $, %');
    if (!form.startDate) errors.push('Start date required');
    if (!form.endDate) errors.push('End date required');
    // Date constraints: today onwards, and end after start
    if (form.startDate && form.startDate < todayStr) errors.push('Start date must be today or later');
    if (form.endDate && form.endDate < todayStr) errors.push('End date must be today or later');
    if (form.startDate && form.endDate && new Date(form.endDate) <= new Date(form.startDate)) errors.push('End date must be after start date');
    const budgetNum = Number(form.budget);
    if (!/^[0-9]+$/.test(form.budget)) errors.push('Budget must contain digits only');
    if (isNaN(budgetNum) || budgetNum < 100000 || budgetNum > 1000000000) errors.push('Budget must be 100,000 - 1,000,000,000');
    const completionNum = Number(form.completion);
    if (!/^[0-9]+$/.test(String(form.completion))) errors.push('Completion must be a whole number');
    if (isNaN(completionNum) || completionNum < 0 || completionNum > 100) errors.push('Completion must be 0 - 100');
  if (form.description && RESTRICTED_CHARS_TEST.test(form.description)) errors.push('Description cannot include !, #, $, %');
    if (errors.length) { setError(errors.join('\n')); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Site Managers are not allowed to create projects; only edit existing ones
    if (!editingId) { setError('Only Admin can create or delete projects.'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        name: form.name.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        budget: Number(form.budget),
        status: form.status,
        priority: form.priority,
        completion: Number(form.completion),
        description: form.description.trim()
      };
      await projectService.updateProject(editingId, payload);
      setModalOpen(false); resetForm(); await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="px-6 py-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Site Manager Projects</h1>
          <p className="text-gray-600 mt-1">Update and track your assigned projects with progress and priority.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2 bg-white rounded-lg shadow border p-1 text-sm">
            {['All','Planning','In Progress','On Hold','Completed','Cancelled'].map(s => (
              <button key={s} onClick={()=>setStatusFilter(s)} className={`px-3 py-1 rounded-md font-medium transition ${statusFilter===s ? 'bg-[#0B3954] text-white':'text-gray-600 hover:bg-gray-100'}`}>{s}</button>
            ))}
          </div>
          <select value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value)} className="px-3 py-2 text-sm rounded-lg border bg-white shadow">
            {['All','Low','Medium','High','Critical'].map(p => <option key={p}>{p}</option>)}
          </select>
          <div className="flex gap-1 bg-white rounded-lg shadow border p-1">
            {['grid','list'].map(v => (
              <button key={v} onClick={()=>setViewMode(v)} className={`px-3 py-1 rounded-md text-sm font-medium ${viewMode===v ? 'bg-[#0B3954] text-white':'text-gray-600 hover:bg-gray-100'}`}>{v==='grid'?'Grid':'List'}</button>
            ))}
          </div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="px-3 py-2 rounded-lg border bg-white shadow text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3954]" />
        </div>
      </div>
      {error && <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm whitespace-pre-line">{error}</div>}

      {/* Listing */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Projects ({filtered.length})</h2>
          <span className="text-xs text-gray-500">{loading ? 'Loading...' : 'Updated ' + new Date().toLocaleTimeString()}</span>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({length:6}).map((_,i)=>(<div key={i} className="h-28 bg-gray-100 animate-pulse rounded-xl" />))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-500 text-sm">No projects match filters.</div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(p => {
              const pct = Math.min(100, Math.max(0, Number(p.completion)||0));
              const barColor = pct===100?'bg-green-600':pct>60?'bg-blue-600':pct>30?'bg-amber-500':'bg-red-500';
              return (
                <div key={p._id} className="border rounded-xl p-4 bg-gray-50 hover:bg-white transition shadow-sm hover:shadow-md">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="font-semibold text-gray-800 line-clamp-1" title={p.name}>{p.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.status==='Completed'?'bg-green-100 text-green-700':p.status==='In Progress'?'bg-blue-100 text-blue-700':p.status==='On Hold'?'bg-amber-100 text-amber-700':p.status==='Planning'?'bg-purple-100 text-purple-700':p.status==='Cancelled'?'bg-red-100 text-red-700':'bg-gray-200 text-gray-700'}`}>{p.status}</span>
                  </div>
                  {/* Hide internal/random IDs from UI */}
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div className={`h-full ${barColor}`} style={{ width: pct+'%' }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-600">
                    <span>{pct}%</span>
                    <span>{p.priority || 'Normal'}</span>
                  </div>
                  <div className="mt-2 flex gap-2 justify-end">
                    <button onClick={()=>openEdit(p)} className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Edit</button>
                    <button onClick={()=>openAssignSupervisor(p._id)} className="text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700">Assign Supervisor</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="divide-y border rounded-xl bg-gray-50">
            {filtered.map(p => {
              const pct = Math.min(100, Math.max(0, Number(p.completion)||0));
              return (
                <div key={p._id} className="p-4 hover:bg-white transition flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="font-semibold text-gray-800 line-clamp-1">{p.name}</div>
                    <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500">
                      <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 font-medium">{p.status}</span>
                      {/* Hide internal/random IDs from UI */}
                      {p.priority && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">{p.priority}</span>}
                      <span>{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0B3954]" style={{ width: pct + '%' }} />
                  </div>
                  <div className="text-[10px] text-gray-500 flex justify-between">
                    <span>{new Date(p.updatedAt || p.createdAt).toLocaleString()}</span>
                    <span>{(p.description||'').slice(0,40)}{p.description && p.description.length>40?'…':''}</span>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button onClick={()=>openEdit(p)} className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Edit</button>
                    <button onClick={()=>openAssignSupervisor(p._id)} className="text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700">Assign Supervisor</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Edit Project</h2>
              <button onClick={()=>{setModalOpen(false); resetForm();}} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Project Name">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onKeyDown={(e)=>{ if(['!','#','$','%'].includes(e.key)) e.preventDefault(); }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B3954]"
                  placeholder="Enter project name (no ! # $ %)"
                />
              </Field>
              {/* Client Name removed */}
              <Field label="Start Date">
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  min={todayStr}
                />
              </Field>
              <Field label="End Date">
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  min={form.startDate || todayStr}
                />
              </Field>
              <Field label="Budget (Rs.)">
                <input
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onKeyDown={(e)=>{
                    const allowed = ['Backspace','Delete','Tab','ArrowLeft','ArrowRight','Home','End'];
                    if (allowed.includes(e.key)) return;
                    if (!/^[0-9]$/.test(e.key)) e.preventDefault();
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Eg: 500000 (digits only)"
                />
              </Field>
              <Field label="Status">
                <select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                  {['Planning','In Progress','On Hold','Completed','Cancelled'].map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Priority">
                <select name="priority" value={form.priority} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                  {['Low','Medium','High','Critical'].map(p => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Completion (%)">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  name="completion"
                  value={form.completion}
                  onChange={handleChange}
                  onKeyDown={(e)=>{ if(['e','E','+','-','.'].includes(e.key)) e.preventDefault(); }}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Description">
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    onKeyDown={(e)=>{ if(['!','#','$','%'].includes(e.key)) e.preventDefault(); }}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg resize-y"
                    placeholder="Project description (no ! # $ %)"
                  />
                </Field>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={()=>{setModalOpen(false); resetForm();}} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-[#0B3954] text-white rounded-lg disabled:opacity-60">{saving ? 'Saving...' : 'Update Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Supervisor Modal */}
      {supModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Assign Supervisor</h2>
              <button onClick={()=>{ setSupModal(false); setAssignProjectId(null); setSelectedSupervisor(''); }} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {supLoading ? (
                <div className="text-sm text-gray-500">Loading supervisors…</div>
              ) : supervisors.length === 0 ? (
                <div className="text-sm text-gray-500">No supervisors found.</div>
              ) : (
                <label className="block text-sm">
                  <span className="text-gray-600 font-medium">Supervisor</span>
                  <select value={selectedSupervisor} onChange={e=>setSelectedSupervisor(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg">
                    <option value="">Select a supervisor</option>
                    {supervisors.map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.gmail})</option>
                    ))}
                  </select>
                </label>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={()=>{ setSupModal(false); setAssignProjectId(null); setSelectedSupervisor(''); }} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button onClick={assignSupervisor} disabled={!selectedSupervisor} className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-60">Assign</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
