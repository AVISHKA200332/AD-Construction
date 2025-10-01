import React, { useEffect, useMemo, useState } from 'react';
import { projectService } from '../../services/projectService';

// Reusable stat card matching Admin style
const Stat = ({ icon, label, value, color }) => (
  <div className={`rounded-xl shadow-lg p-5 flex items-center ${color} text-white relative overflow-hidden group`}>
    <div className="z-10">
      <div className="text-4xl leading-none mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-white/80">{label}</div>
    </div>
    <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 group-hover:scale-110 transition" />
  </div>
);

export default function SSDashboard() {
  // Backend data
  const [projects, setProjects] = useState([]);
  const [projectTotal, setProjectTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Local site-supervisor operational data (placeholder until backend endpoints)
  const [issues, setIssues] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [dailyUpdates, setDailyUpdates] = useState([]);

  // UI state
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [now, setNow] = useState(Date.now());

  // Load data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
  const projStats = await projectService.getProjectStats();
  setProjectTotal(projStats.total || 0);

        const allProjectsData = await projectService.getAllProjects();
        const list = Array.isArray(allProjectsData?.projects) ? allProjectsData.projects : [];
        setProjects(list);
      } catch (e) { /* silent */ }
      try {
        setIssues(JSON.parse(localStorage.getItem('ss_issues') || '[]'));
        setMaterials(JSON.parse(localStorage.getItem('ss_material_requests') || '[]'));
        setAssignments(JSON.parse(localStorage.getItem('ss_labor_assignments') || '[]'));
        setDailyUpdates(JSON.parse(localStorage.getItem('ss_daily_updates') || '[]'));
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  // Derived stats (supervisor perspective)
  const stats = useMemo(() => {
    const activeProjects = projects.filter(p => p.status !== 'Completed' && p.status !== 'Cancelled').length;
  const openIssues = issues.filter(i => i.status !== 'Closed').length;
    const criticalIssues = issues.filter(i => i.severity === 'Critical' && i.status !== 'Closed').length;
    const activeAssignments = assignments.filter(a => a.status === 'Active').length;
    const avgProgress = projects.length ? Math.round(projects.reduce((acc,p)=>acc + (p.completion||0),0)/projects.length) : 0;
    return [
      { label: 'Total Projects', value: projectTotal, icon: '📁', color: 'bg-blue-600' },
      { label: 'Active Projects', value: activeProjects, icon: '🚧', color: 'bg-amber-600' },
      { label: 'Open Issues', value: openIssues, icon: '❗', color: 'bg-red-600' },
      { label: 'Critical Issues', value: criticalIssues, icon: '⚠️', color: 'bg-rose-600' },
      { label: 'Active Crews', value: activeAssignments, icon: '👷‍♂️', color: 'bg-green-600' },
      { label: 'Avg Progress', value: avgProgress + '%', icon: '📊', color: 'bg-purple-600' }
    ];
  }, [projects, projectTotal, issues, assignments]);

  // Filtered / searched projects slice
  const filteredProjects = useMemo(() => {
    return projects
      .filter(p => filterStatus === 'All' || p.status === filterStatus)
      .filter(p => !search || (p.name?.toLowerCase().includes(search.toLowerCase()) || p.projectId?.toLowerCase().includes(search.toLowerCase())))
      .slice(0, 14);
  }, [projects, filterStatus, search]);

  // Local recent activity context
  const recentIssues = useMemo(() => issues.slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5), [issues]);
  const recentUpdates = useMemo(() => dailyUpdates.slice().sort((a,b)=> new Date(b.date)-new Date(a.date)).slice(0,4), [dailyUpdates]);
  const materialSubset = useMemo(() => materials.filter(m=>['Pending','Requested'].includes(m.status)).slice(0,4), [materials]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header / Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Site Supervisor Dashboard</h1>
          <p className="text-gray-600 mt-1">Operational view: projects, issues, materials, crews & progress.</p>
          <p className="text-xs text-gray-400 mt-1">Updated {new Date(now).toLocaleTimeString()}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex gap-2 bg-white rounded-lg shadow border p-1 text-sm">
            {['All','Planning','In Progress','On Hold','Completed','Cancelled'].map(s => (
              <button key={s} onClick={()=>setFilterStatus(s)} className={`px-3 py-1 rounded-md font-medium transition ${filterStatus===s ? 'bg-[#0B3954] text-white':'text-gray-600 hover:bg-gray-100'}`}>{s}</button>
            ))}
          </div>
          <div className="flex gap-1 bg-white rounded-lg shadow border p-1">
            {['grid','list'].map(v => (
              <button key={v} onClick={()=>setViewMode(v)} className={`px-3 py-1 rounded-md text-sm font-medium ${viewMode===v ? 'bg-[#0B3954] text-white':'text-gray-600 hover:bg-gray-100'}`}>{v==='grid'?'Grid':'List'}</button>
            ))}
          </div>
          <input
            placeholder="Search projects..."
            value={search}
            onChange={e=>setSearch(e.target.value)}
            className="px-3 py-2 rounded-lg border bg-white shadow text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3954]"
          />
          <button onClick={()=>window.location.reload()} className="px-4 py-2 rounded-lg bg-[#0B3954] text-white text-sm font-semibold shadow hover:bg-[#092c40]">Refresh</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-6 mb-8">
        {stats.map(s => <Stat key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Projects Overview</h2>
            <span className="text-xs text-gray-500">Showing {filteredProjects.length} / {projects.length}</span>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({length:4}).map((_,i)=>(<div key={i} className="h-28 bg-gray-100 animate-pulse rounded-lg" />))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-gray-500 text-sm">No projects match current filters.</div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map(p => {
                const pct = Math.min(100, Math.max(0, Number(p.completion)||0));
                const barColor = pct === 100 ? 'bg-green-600' : pct > 60 ? 'bg-blue-600' : pct > 30 ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <div key={p._id} className="border rounded-xl p-4 bg-gray-50 hover:bg-white transition shadow-sm hover:shadow-md relative overflow-hidden">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-semibold text-gray-800 line-clamp-1 pr-2">{p.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status==='Completed'?'bg-green-100 text-green-700':p.status==='In Progress'?'bg-blue-100 text-blue-700':p.status==='On Hold'?'bg-amber-100 text-amber-700':p.status==='Planning'?'bg-purple-100 text-purple-700':p.status==='Cancelled'?'bg-red-100 text-red-700':'bg-gray-200 text-gray-700'}`}>{p.status}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">ID: {p.projectId}</div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div className={`h-full ${barColor} transition-all`} style={{ width: pct + '%' }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{pct}% Complete</span>
                      <span>{p.priority || 'Normal'}</span>
                    </div>
                    <div className="mt-1 text-[10px] text-gray-500 flex justify-between">
                      <span>{new Date(p.updatedAt || p.createdAt).toLocaleDateString()}</span>
                      <span>{(p.description||'').slice(0,30)}{p.description && p.description.length>30?'…':''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="divide-y border rounded-xl bg-gray-50">
              {filteredProjects.map(p => {
                const pct = Math.min(100, Math.max(0, Number(p.completion)||0));
                return (
                  <div key={p._id} className="p-4 hover:bg-white transition flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="font-semibold text-gray-800 line-clamp-1">{p.name}</div>
                      <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500">
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
                      <span>Updated {new Date(p.updatedAt || p.createdAt).toLocaleDateString()}</span>
                      <span>{p.description ? p.description.slice(0,40) + (p.description.length>40?'…':'') : 'No description'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Side Panels: Issues + Materials + Daily Logs */}
        <div className="flex flex-col gap-6">
          {/* Issues */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Recent Issues</h2>
              <a href="#/site-supervisor/issues" className="text-[#0B3954] hover:underline text-sm font-medium">All</a>
            </div>
            {recentIssues.length === 0 ? (
              <div className="text-gray-400 text-sm">No issues logged.</div>
            ) : (
              <ul className="space-y-3">
                {recentIssues.map(i => (
                  <li key={i.id} className="flex flex-col p-2 bg-gray-50 rounded border hover:bg-white transition">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800 text-sm line-clamp-1">{i.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${i.status==='Closed'?'bg-green-100 text-green-700':i.status==='In Progress'?'bg-blue-100 text-blue-700':'bg-amber-100 text-amber-700'}`}>{i.status}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                      <span className={`px-2 py-0.5 rounded-full font-medium ${i.severity==='Critical'?'bg-red-100 text-red-700':i.severity==='High'?'bg-rose-100 text-rose-700':i.severity==='Medium'?'bg-amber-100 text-amber-700':'bg-gray-200 text-gray-600'}`}>{i.severity}</span>
                      <span>{i.category||'General'}</span>
                      <span>{new Date(i.createdAt).toLocaleDateString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

            {/* Materials */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Materials</h2>
                <a href="#/site-supervisor/material" className="text-[#0B3954] hover:underline text-sm font-medium">Manage</a>
              </div>
              {materialSubset.length === 0 ? (
                <div className="text-gray-400 text-sm">No pending requests.</div>
              ) : (
                <ul className="space-y-3">
                  {materialSubset.map(m => (
                    <li key={m.id} className="p-2 bg-gray-50 rounded border text-xs flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800 line-clamp-1">{m.item}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${m.status==='Approved'?'bg-green-100 text-green-700':m.status==='Rejected'?'bg-red-100 text-red-700':'bg-blue-100 text-blue-700'}`}>{m.status}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 flex justify-between">
                        <span>Qty {m.quantity}</span>
                        {m.neededBy && <span>{new Date(m.neededBy).toLocaleDateString()}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Daily Logs */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Daily Logs</h2>
                <a href="#/site-supervisor/daily" className="text-[#0B3954] hover:underline text-sm font-medium">Log</a>
              </div>
              {recentUpdates.length === 0 ? (
                <div className="text-gray-400 text-sm">No logs yet.</div>
              ) : (
                <ul className="space-y-3">
                  {recentUpdates.map(u => (
                    <li key={u.id} className="p-2 bg-gray-50 rounded border text-xs flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800">{new Date(u.date).toLocaleDateString()}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700">{u.weather||'N/A'}</span>
                      </div>
                      <div className="flex gap-3 text-[10px] text-gray-500">
                        <span>Prog {u.progress||0}%</span>
                        <span>Labor {u.laborCount||0}</span>
                        {u.incidents>0 && <span className="text-red-600 font-medium">{u.incidents} inc</span>}
                      </div>
                      {u.notes && <span className="text-[10px] text-gray-600 line-clamp-1">{u.notes}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
        </div>
      </div>

      {/* Operational Focus & Risk (mirroring Admin style) */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Operational Focus</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'Crew Utilization', progress: assignments.length ? Math.min(100, assignments.filter(a=>a.status==='Active').length / assignments.length * 100) : 48, color: 'bg-blue-600' },
              { title: 'Material Fulfillment', progress: materials.length ? Math.round((materials.filter(m=>m.status==='Delivered').length / materials.length) * 100) : 32, color: 'bg-green-600' },
              { title: 'Issue Resolution', progress: issues.length ? Math.round((issues.filter(i=>i.status==='Closed').length / issues.length) * 100) : 0, color: 'bg-amber-600' }
            ].map(item => (
              <div key={item.title} className="border rounded-lg p-4 bg-gray-50">
                <div className="font-medium text-gray-800 mb-2 text-sm">{item.title}</div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div className={`h-full ${item.color}`} style={{ width: item.progress + '%' }} />
                </div>
                <div className="text-xs text-gray-500">{Math.round(item.progress)}%</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Risk & Alerts</h2>
          <ul className="text-sm text-gray-600 space-y-3">
            <li className="flex items-start gap-3"><span className="text-red-500 mt-0.5">•</span><div>{issues.filter(i=>i.severity==='Critical' && i.status!=='Closed').length} critical issues require attention.</div></li>
            <li className="flex items-start gap-3"><span className="text-amber-500 mt-0.5">•</span><div>{materials.filter(m=>['Pending','Requested'].includes(m.status)).length} material requests pending.</div></li>
            <li className="flex items-start gap-3"><span className="text-blue-500 mt-0.5">•</span><div>Average progress across projects {stats.find(s=>s.label==='Avg Progress')?.value}.</div></li>
            <li className="flex items-start gap-3"><span className="text-purple-500 mt-0.5">•</span><div>Balance crew workload to raise utilization.</div></li>
          </ul>
          <div className="mt-4 text-xs text-gray-500">Future: integrate live site telemetry, safety sensors & predictive risk scoring.</div>
        </div>
      </div>
    </div>
  );
}
