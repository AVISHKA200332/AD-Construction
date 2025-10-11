import React, { useEffect, useMemo, useState } from 'react';
import { projectService } from '../../services/projectService';
import { roleOpsService } from '../../services/roleOpsService';
import userService from '../../services/userService';

// Site Supervisor Project Management (limited CRUD)
// - View & filter projects
// - Update allowed fields: status (subset), completion progress
// - Add per-project site logs (local CRUD) with crew count, weather, notes, issues raised
// - No project creation/deletion (supervisor typically lacks that authority)

export default function SSProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [selected, setSelected] = useState(null); // selected project object
  const [saving, setSaving] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAudit, setShowAudit] = useState(false);
  const [logs, setLogs] = useState({}); // { projectId: [log,...] }
  const [logForm, setLogForm] = useState({ id:null, date:'', crewCount:'', weather:'', progressSnapshot:'', issuesRaised:'', note:'' });
  const [logModal, setLogModal] = useState(false);
  const [logEditing, setLogEditing] = useState(false);

  // Tasks/Labor assignment
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState('');
  const [myTasks, setMyTasks] = useState([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [laborLoading, setLaborLoading] = useState(false);
  const [laborError, setLaborError] = useState('');
  const [labors, setLabors] = useState([]);
  const [taskForm, setTaskForm] = useState({ title:'', description:'', dueDate:'', laborIds:[] });

  // Load projects & logs
  const load = async () => {
    setLoading(true); setError('');
    try {
      const scoped = await roleOpsService.getSSProjects();
      const list = Array.isArray(scoped?.projects) ? scoped.projects : [];
      setProjects(list);
    } catch (e) {
      setProjects([]);
      setError(e.response?.data?.message || e.message || 'Failed to load projects. Please ensure you are logged in as a Site Supervisor and assigned to projects by a Site Manager.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(()=>{ load(); }, []);

  // Load logs from localStorage once
  useEffect(()=>{
    try { const stored = JSON.parse(localStorage.getItem('ss_project_logs')||'{}'); setLogs(stored); } catch { /* ignore */ }
  }, []);

  const persistLogs = (next) => {
    setLogs(next);
    localStorage.setItem('ss_project_logs', JSON.stringify(next));
  };

  const filtered = useMemo(()=>{
    return projects
      .filter(p => statusFilter==='All' || p.status===statusFilter)
      .filter(p => priorityFilter==='All' || p.priority===priorityFilter)
      .filter(p => !search || (p.name?.toLowerCase().includes(search.toLowerCase()) || p.projectId?.toLowerCase().includes(search.toLowerCase())));
  }, [projects, statusFilter, priorityFilter, search]);

  // Select project
  const openProject = async (p) => {
    setSelected(p);
    setAuditLogs([]);
    setAuditError('');
    setShowAudit(false);
    setAuditLoading(true);
    // Load my tasks
    setTasksLoading(true); setTasksError('');
    try {
      const data = await projectService.getProjectAuditLogs(p._id);
      setAuditLogs(data.auditLogs || []);
    } catch (e) {
      setAuditError(e.response?.data?.message || e.message || 'Failed to load audit logs');
    } finally { setAuditLoading(false); }
    try {
      const list = await roleOpsService.myTasks();
      setMyTasks(Array.isArray(list?.tasks)? list.tasks : []);
    } catch (e) {
      setTasksError(e.response?.data?.message || e.message || 'Failed to load tasks');
    } finally { setTasksLoading(false); }
  };

  const allowedStatus = ['In Progress','On Hold','Completed']; // Supervisor can toggle only these

  const updateProgress = async (project, newCompletion) => {
    setSaving(true);
    try {
      await projectService.updateProject(project._id, { completion: newCompletion });
      setProjects(prev => prev.map(p => p._id===project._id ? { ...p, completion: newCompletion, updatedAt:new Date().toISOString() } : p));
      setSelected(prev => prev && prev._id===project._id ? { ...prev, completion:newCompletion } : prev);
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Failed to update progress');
    } finally { setSaving(false); }
  };

  const updateStatus = async (project, newStatus) => {
    setSaving(true);
    try {
      await projectService.updateProject(project._id, { status:newStatus });
      setProjects(prev => prev.map(p => p._id===project._id ? { ...p, status:newStatus, updatedAt:new Date().toISOString() } : p));
      setSelected(prev => prev && prev._id===project._id ? { ...prev, status:newStatus } : prev);
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Failed to update status');
    } finally { setSaving(false); }
  };

  // Site log CRUD
  const openNewLog = () => {
    setLogForm({ id:null, date:new Date().toISOString().slice(0,10), crewCount:'', weather:'', progressSnapshot: selected?.completion || '', issuesRaised:'', note:'' });
    setLogEditing(false); setLogModal(true);
  };
  const editLog = (log) => {
    setLogForm({ ...log }); setLogEditing(true); setLogModal(true);
  };
  const deleteLog = (id) => {
    if(!selected) return;
    if(!window.confirm('Delete this log entry?')) return;
    const projectLogs = logs[selected._id] || [];
    const next = { ...logs, [selected._id]: projectLogs.filter(l=>l.id!==id) };
    persistLogs(next);
  };
  const saveLog = (e) => {
    e.preventDefault(); if(!selected) return;
    const projectLogs = logs[selected._id] || [];
    if (logEditing) {
      const nextLogs = projectLogs.map(l => l.id===logForm.id ? { ...l, ...logForm } : l);
      persistLogs({ ...logs, [selected._id]: nextLogs });
    } else {
      const newEntry = { ...logForm, id:crypto.randomUUID(), createdAt:new Date().toISOString() };
      persistLogs({ ...logs, [selected._id]: [ newEntry, ...projectLogs ] });
    }
    setLogModal(false);
  };

  const selectedLogs = useMemo(()=> selected ? (logs[selected._id]||[]).slice().sort((a,b)=> new Date(b.date||b.createdAt) - new Date(a.date||a.createdAt)) : [], [logs, selected]);

  const projectTasks = useMemo(() => {
    if (!selected) return [];
    const selId = String(selected._id);
    return (myTasks || []).filter(t => {
      const pid = t?.project && typeof t.project === 'object' ? (t.project._id || t.project.id) : t.project;
      return String(pid) === selId;
    });
  }, [myTasks, selected]);

  const openAssignLabor = async () => {
    setAssignOpen(true);
    setLaborLoading(true); setLaborError('');
    setTaskForm({ title:'', description:'', dueDate:'', laborIds:[] });
    try {
      const res = await userService.getAllUsers({ role: 'Labor', limit: 200 });
      const list = Array.isArray(res?.users) ? res.users : [];
      setLabors(list);
    } catch (e) {
      setLaborError(e.response?.data?.message || e.message || 'Failed to load labors');
      setLabors([]);
    } finally { setLaborLoading(false); }
  };

  const toggleLabor = (id) => {
    setTaskForm(f => ({ ...f, laborIds: f.laborIds.includes(id) ? f.laborIds.filter(x=>x!==id) : [...f.laborIds, id] }));
  };

  const createAssignment = async (e) => {
    e.preventDefault(); if (!selected) return;
    if (!taskForm.title.trim() || taskForm.laborIds.length===0) { alert('Provide a task title and select at least one labor.'); return; }
    try {
      await roleOpsService.createTask({
        project: selected._id,
        title: taskForm.title.trim(),
        description: taskForm.description?.trim() || '',
        dueDate: taskForm.dueDate || undefined,
        status: 'Planned',
        laborers: taskForm.laborIds,
        progress: 0,
      });
      // refresh tasks and keep drawer open with updated list
      setTasksLoading(true);
      const list = await roleOpsService.myTasks();
      setMyTasks(Array.isArray(list?.tasks)? list.tasks : []);
      setTasksLoading(false);
      setAssignOpen(false);
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Failed to create assignment');
    }
  };

  return (
    <div className="px-6 py-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Site Supervisor Projects</h1>
          <p className="text-gray-600 mt-1">Track onsite progress, update status, and log field activity.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
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

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Projects ({filtered.length})</h2>
          <span className="text-xs text-gray-500">{loading? 'Loading...' : 'Updated ' + new Date().toLocaleTimeString()}</span>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({length:6}).map((_,i)=>(<div key={i} className="h-28 bg-gray-100 animate-pulse rounded-xl" />))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-500 text-sm">No projects match filters.</div>
        ) : viewMode==='grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(p => {
              const pct = Math.min(100, Math.max(0, Number(p.completion)||0));
              const barColor = pct===100?'bg-green-600':pct>60?'bg-blue-600':pct>30?'bg-amber-500':'bg-red-500';
              return (
                <button key={p._id} onClick={()=>openProject(p)} className="text-left border rounded-xl p-4 bg-gray-50 hover:bg-white transition shadow-sm hover:shadow-md">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="font-semibold text-gray-800 line-clamp-1" title={p.name}>{p.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.status==='Completed'?'bg-green-100 text-green-700':p.status==='In Progress'?'bg-blue-100 text-blue-700':p.status==='On Hold'?'bg-amber-100 text-amber-700':p.status==='Planning'?'bg-purple-100 text-purple-700':p.status==='Cancelled'?'bg-red-100 text-red-700':'bg-gray-200 text-gray-700'}`}>{p.status}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mb-1">ID: {p.projectId}</div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div className={`h-full ${barColor}`} style={{ width: pct+'%' }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-600">
                    <span>{pct}%</span>
                    <span>{p.priority || 'Normal'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="divide-y border rounded-xl bg-gray-50">
            {filtered.map(p => {
              const pct = Math.min(100, Math.max(0, Number(p.completion)||0));
              return (
                <button key={p._id} onClick={()=>openProject(p)} className="p-4 hover:bg-white transition flex flex-col gap-2 text-left">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="font-semibold text-gray-800 line-clamp-1">{p.name}</div>
                    <div className="flex items-center flex-wrap gap-2 text-[11px] text-gray-500">
                      <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 font-medium">{p.status}</span>
                      <span>#{p.projectId}</span>
                      {p.priority && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">{p.priority}</span>}
                      <span>{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0B3954]" style={{ width: pct + '%' }} />
                  </div>
                  <div className="text-[10px] text-gray-500 flex justify-between">
                    <span>{new Date(p.updatedAt || p.createdAt).toLocaleDateString()}</span>
                    <span>{(p.description||'').slice(0,40)}{p.description && p.description.length>40?'…':''}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Project Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40">
          <div className="w-full max-w-3xl h-full bg-white border-l border-gray-200 flex flex-col">
            <div className="p-5 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{selected.name}</h2>
                <p className="text-xs text-gray-500">ID: {selected.projectId}</p>
              </div>
              <button onClick={()=>setSelected(null)} className="text-gray-500 hover:text-gray-700 text-sm">Close ✕</button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-8">
              {/* Overview */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Overview</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500 text-[11px] uppercase">Status</div>
                    <div className="mt-1 flex items-center gap-2">
                      <select disabled={saving} value={selected.status} onChange={(e)=>updateStatus(selected, e.target.value)} className="px-2 py-1 text-sm rounded border bg-white">
                        {[selected.status, ...allowedStatus.filter(s=>s!==selected.status)].map(s => <option key={s}>{s}</option>)}
                      </select>
                      {!allowedStatus.includes(selected.status) && <span className="text-[10px] text-amber-600">Restricted</span>}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500 text-[11px] uppercase">Priority</div>
                    <div className="mt-1 text-gray-800 font-medium text-sm">{selected.priority || 'Normal'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-gray-500 text-[11px] uppercase">Completion</div>
                      <div className="text-xs text-gray-500">{Number(selected.completion||0)}%</div>
                    </div>
                    <input type="range" min="0" max="100" value={Number(selected.completion||0)} disabled={saving} onChange={e=>updateProgress(selected, Number(e.target.value))} className="w-full" />
                    <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0B3954]" style={{width: (selected.completion||0)+'%'}} />
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 md:col-span-2">
                    <div className="text-gray-500 text-[11px] uppercase mb-1">Description</div>
                    <p className="text-xs text-gray-600 whitespace-pre-line">{selected.description || 'No description provided.'}</p>
                  </div>
                </div>
              </section>

              {/* Labor assignments */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Labor Assignments</h3>
                  <button onClick={openAssignLabor} className="px-3 py-1.5 text-xs rounded bg-emerald-600 text-white font-medium hover:bg-emerald-700">+ Assign Labor</button>
                </div>
                {tasksLoading ? (
                  <div className="text-xs text-gray-500">Loading tasks…</div>
                ) : tasksError ? (
                  <div className="text-xs text-red-600">{tasksError}</div>
                ) : projectTasks.length===0 ? (
                  <div className="text-xs text-gray-500">No assignments yet.</div>
                ) : (
                  <div className="space-y-2">
                    {projectTasks.map(t => (
                      <div key={t._id} className="p-3 rounded-lg border bg-gray-50 hover:bg-white transition text-xs">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-gray-800">{t.title}</div>
                          <select
                            className="text-[10px] px-2 py-0.5 rounded border bg-white"
                            value={t.status || 'Assigned'}
                            onChange={async (e) => {
                              const next = e.target.value;
                              try {
                                await roleOpsService.updateTask(t._id, { status: next });
                                setMyTasks(prev => prev.map(x => x._id === t._id ? { ...x, status: next } : x));
                              } catch (err) {
                                alert(err?.response?.data?.message || err.message || 'Failed to update status');
                              }
                            }}
                          >
                            {['Assigned','In Progress','Completed'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="text-[11px] text-gray-500 flex flex-wrap gap-3 mt-2 items-center">
                          {t.dueDate && <span>Due {new Date(t.dueDate).toLocaleDateString()}</span>}
                          <span>Laborers {(t.laborers||[]).length}</span>
                          <div className="flex items-center gap-2">
                            <span>Progress</span>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={Number(t.progress||0)}
                              onChange={async (e) => {
                                const val = Number(e.target.value);
                                try {
                                  await roleOpsService.updateTask(t._id, { progress: val });
                                  setMyTasks(prev => prev.map(x => x._id === t._id ? { ...x, progress: val } : x));
                                } catch (err) {
                                  alert(err?.response?.data?.message || err.message || 'Failed to update progress');
                                }
                              }}
                            />
                            <span className="w-8 text-right">{Number(t.progress||0)}%</span>
                          </div>
                        </div>
                        {t.description && <p className="text-[11px] text-gray-600 mt-1">{t.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Site Logs */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Site Logs ({selectedLogs.length})</h3>
                  <button onClick={openNewLog} className="px-3 py-1.5 text-xs rounded bg-[#0B3954] text-white font-medium hover:bg-[#092c40]">+ Add Log</button>
                </div>
                {selectedLogs.length === 0 ? (
                  <div className="text-xs text-gray-500">No logs yet. Add the first site update.</div>
                ) : (
                  <div className="space-y-2">
                    {selectedLogs.map(l => (
                      <div key={l.id} className="p-3 rounded-lg border bg-gray-50 hover:bg-white transition text-xs flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800">{l.date}</span>
                          <div className="flex gap-1">
                            <button onClick={()=>editLog(l)} className="px-2 py-0.5 rounded bg-gray-200 text-gray-700">Edit</button>
                            <button onClick={()=>deleteLog(l.id)} className="px-2 py-0.5 rounded bg-red-600 text-white">Del</button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 text-[10px] text-gray-500">
                          {l.progressSnapshot!=='' && <span>Prog {l.progressSnapshot}%</span>}
                          {l.crewCount && <span>Crew {l.crewCount}</span>}
                          {l.weather && <span>{l.weather}</span>}
                          {l.issuesRaised && <span className="text-red-600">Issues {l.issuesRaised}</span>}
                        </div>
                        {l.note && <p className="text-[11px] text-gray-600 whitespace-pre-line">{l.note}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Materials Summary */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Materials Quick Summary</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {['Requested','Pending','Delivered'].map(st => {
                    const count = (JSON.parse(localStorage.getItem('ss_material_requests')||'[]')||[]).filter(m=>m.status===st).length;
                    return (
                      <div key={st} className="p-3 rounded-lg bg-gray-50 border">
                        <div className="text-xs font-semibold text-gray-600">{st}</div>
                        <div className="text-lg font-bold text-gray-800">{count}</div>
                      </div>
                    );
                  })}
                </div>
                <a href="#/site-supervisor/material" className="inline-block mt-3 text-[11px] text-[#0B3954] hover:underline">Open Material Requests</a>
              </section>

              {/* Issues Quick */}
              <section>
              {/* Audit Logs */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Audit Trail</h3>
                  <button onClick={()=>setShowAudit(s=>!s)} className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700">{showAudit? 'Hide':'Show'}</button>
                </div>
                {showAudit && (
                  <div className="border rounded-lg divide-y max-h-72 overflow-y-auto bg-gray-50">
                    {auditLoading && <div className="p-3 text-xs text-gray-500">Loading audit logs...</div>}
                    {auditError && <div className="p-3 text-xs text-red-600">{auditError}</div>}
                    {!auditLoading && !auditError && auditLogs.length===0 && <div className="p-3 text-xs text-gray-500">No audit entries.</div>}
                    {auditLogs.map(l => (
                      <div key={l._id || l.timestamp+Math.random()} className="p-3 text-[11px] flex flex-col gap-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800">{l.action}</span>
                          <span className="text-[10px] text-gray-500">{new Date(l.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="text-gray-600">{l.field} {l.oldValue!==undefined && l.oldValue!==null ? (<>
                          <span className="text-gray-500">{String(l.oldValue).slice(0,40)}</span>
                          <span className="mx-1 text-gray-400">→</span>
                          <span className="text-gray-800">{String(l.newValue).slice(0,60)}</span>
                        </>) : l.newValue}</div>
                        <div className="text-[10px] text-gray-500">By {l.user || 'System'} • {l.ipAddress || 'N/A'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Issues Snapshot</h3>
                <div className="grid grid-cols-4 gap-3">
                  {['Open','In Progress','Closed','Critical'].map(cat => {
                    const issueList = JSON.parse(localStorage.getItem('ss_issues')||'[]')||[];
                    const count = cat==='Critical' ? issueList.filter(i=>i.severity==='Critical' && i.status!=='Closed').length : issueList.filter(i=>i.status===cat).length;
                    return (
                      <div key={cat} className="p-3 rounded-lg bg-gray-50 border text-center">
                        <div className="text-[10px] font-medium text-gray-600">{cat}</div>
                        <div className="text-lg font-bold text-gray-800">{count}</div>
                      </div>
                    );
                  })}
                </div>
                <a href="#/site-supervisor/issues" className="inline-block mt-3 text-[11px] text-[#0B3954] hover:underline">Manage Issues</a>
              </section>
            </div>
          </div>
          {/* Click outside to close */}
          <button onClick={()=>setSelected(null)} className="flex-1 h-full" aria-label="Close drawer background" />
        </div>
      )}

      {/* Assign Labor Modal */}
      {assignOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Assign Labor to {selected.name}</h2>
              <button onClick={()=>setAssignOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={createAssignment} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <label className="block">
                <span className="text-gray-600 font-medium">Task Title</span>
                <input value={taskForm.title} onChange={e=>setTaskForm(f=>({...f,title:e.target.value}))} className="mt-1 w-full px-3 py-2 border rounded-lg" required />
              </label>
              <label className="block">
                <span className="text-gray-600 font-medium">Due Date</span>
                <input type="date" value={taskForm.dueDate} onChange={e=>setTaskForm(f=>({...f,dueDate:e.target.value}))} className="mt-1 w-full px-3 py-2 border rounded-lg" />
              </label>
              <div className="md:col-span-2">
                <label className="block">
                  <span className="text-gray-600 font-medium">Description</span>
                  <textarea value={taskForm.description} onChange={e=>setTaskForm(f=>({...f,description:e.target.value}))} rows={3} className="mt-1 w-full px-3 py-2 border rounded-lg resize-y" />
                </label>
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 font-medium">Select Laborers</span>
                  {laborLoading && <span className="text-[11px] text-gray-500">Loading…</span>}
                  {laborError && <span className="text-[11px] text-red-600">{laborError}</span>}
                </div>
                <div className="max-h-56 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                  {labors.length===0 && !laborLoading ? (
                    <div className="text-[12px] text-gray-500">No labor users found.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {labors.map(l => (
                        <label key={l._id} className="flex items-center gap-2 text-[13px] bg-white border rounded p-2">
                          <input type="checkbox" checked={taskForm.laborIds.includes(l._id)} onChange={()=>toggleLabor(l._id)} />
                          <span className="text-gray-800">{l.name}</span>
                          <span className="text-gray-500 text-[11px]">{l.gmail || l.email}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={()=>setAssignOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Create Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Modal */}
      {logModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">{logEditing? 'Edit Log':'New Site Log'}</h2>
              <button onClick={()=>setLogModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={saveLog} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <label className="block text-xs font-semibold text-gray-600">Date<input type="date" value={logForm.date} onChange={e=>setLogForm(f=>({...f,date:e.target.value}))} className="mt-1 w-full px-3 py-2 border rounded-lg" required /></label>
                <label className="block text-xs font-semibold text-gray-600">Crew Count<input type="number" min="0" value={logForm.crewCount} onChange={e=>setLogForm(f=>({...f,crewCount:e.target.value}))} className="mt-1 w-full px-3 py-2 border rounded-lg" /></label>
                <label className="block text-xs font-semibold text-gray-600">Weather<input value={logForm.weather} onChange={e=>setLogForm(f=>({...f,weather:e.target.value}))} className="mt-1 w-full px-3 py-2 border rounded-lg" /></label>
                <label className="block text-xs font-semibold text-gray-600">Progress Snapshot (%)<input type="number" min="0" max="100" value={logForm.progressSnapshot} onChange={e=>setLogForm(f=>({...f,progressSnapshot:e.target.value}))} className="mt-1 w-full px-3 py-2 border rounded-lg" /></label>
                <label className="block text-xs font-semibold text-gray-600 col-span-2">Issues Raised<input value={logForm.issuesRaised} onChange={e=>setLogForm(f=>({...f,issuesRaised:e.target.value}))} placeholder="e.g. 2 safety, 1 delay" className="mt-1 w-full px-3 py-2 border rounded-lg" /></label>
              </div>
              <label className="block text-xs font-semibold text-gray-600">Notes<textarea value={logForm.note} onChange={e=>setLogForm(f=>({...f,note:e.target.value}))} rows={4} className="mt-1 w-full px-3 py-2 border rounded-lg resize-y" /></label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={()=>setLogModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#0B3954] text-white rounded-lg">{logEditing? 'Update Log':'Add Log'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
