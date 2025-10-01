import React, { useEffect, useMemo, useState } from 'react';
import { projectService } from '../../services/projectService';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/userService';

// Revamped Admin Dashboard consistent with enhanced role dashboards (Labor, Site Manager, Supervisor)
// Adds filters, project overview cards, activity details, and refined stats styling.
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [projectTotal, setProjectTotal] = useState(0);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');

  // Initial load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const projStats = await projectService.getProjectStats();
        setDistribution(projStats.distribution || []);
        setProjectTotal(projStats.total || 0);

        const allProjectsData = await projectService.getAllProjects();
        const list = Array.isArray(allProjectsData?.projects) ? allProjectsData.projects : [];
        setProjects(list);

        const userResponse = await userService.getAllUsers();
        setUsers(userResponse.users || []);

        const sorted = list.slice().sort((a,b)=> new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
        // For activity, fetch audit logs of most recently updated project (if any)
        if (sorted[0]?._id) {
          try {
            const logsData = await projectService.getProjectAuditLogs(sorted[0]._id);
            setActivity((logsData.auditLogs || []).slice(0,6));
          } catch (_) { setActivity([]); }
        }
      } catch (e) {
        console.error('AdminDashboard load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Derived stats
  const stats = useMemo(() => {
    const nonClients = users.filter(u => u.role && u.role !== 'Client');
    const pendingTasks = projects.filter(p => p.status !== 'Completed' && (p.completion||0) < 100).length;
    const completed = projects.filter(p => p.status === 'Completed').length;
    return [
      { label: 'Total Projects', value: projectTotal, icon: '📁', color: 'bg-blue-600' },
      { label: 'Active Users', value: nonClients.length, icon: '👷', color: 'bg-green-600' },
      { label: 'Pending Tasks', value: pendingTasks, icon: '🧰', color: 'bg-amber-600' },
      { label: 'Completed', value: completed, icon: '✅', color: 'bg-purple-600' }
    ];
  }, [users, projects, projectTotal]);

  // Filtered + searched projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter(p => filterStatus === 'All' || p.status === filterStatus)
      .filter(p => !search || (p.name?.toLowerCase().includes(search.toLowerCase()) || p.projectId?.toLowerCase().includes(search.toLowerCase())))
      .slice(0, 14);
  }, [projects, filterStatus, search]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header / Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Central oversight: users, projects, progress and recent changes.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex gap-2 bg-white rounded-lg shadow border p-1 text-sm">
            {['All','Planning','In Progress','On Hold','Completed','Cancelled'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1 rounded-md font-medium transition ${filterStatus===s ? 'bg-[#0B3954] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{s}</button>
            ))}
          </div>
          <div className="flex gap-1 bg-white rounded-lg shadow border p-1">
            {['grid','list'].map(v => (
              <button key={v} onClick={() => setViewMode(v)} className={`px-3 py-1 rounded-md text-sm font-medium ${viewMode===v ? 'bg-[#0B3954] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{v==='grid'?'Grid':'List'}</button>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className={`rounded-xl shadow-lg p-5 flex items-center ${stat.color} text-white relative overflow-hidden group`}>
            <div className="z-10">
              <div className="text-4xl leading-none mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-white/80">{stat.label}</div>
            </div>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 group-hover:scale-110 transition" />
          </div>
        ))}
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

        {/* Side Panels: Users + Progress + Activity */}
        <div className="flex flex-col gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Recent Users</h2>
              <button onClick={()=>navigate('/admin/users')} className="text-[#0B3954] hover:underline text-sm font-medium">View All</button>
            </div>
            {loading ? (
              <div className="text-gray-400 text-sm">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-gray-400 text-sm">No users found.</div>
            ) : (
              <ul className="space-y-3">
                {users.slice(0,5).map(u => (
                  <li key={u._id} onClick={()=>navigate('/admin/users')} className="flex items-center p-2 bg-gray-50 rounded hover:bg-white border cursor-pointer transition-colors">
                    <div className="w-8 h-8 bg-[#0B3954] rounded-full flex items-center justify-center text-white text-sm mr-3 font-medium">
                      {(u.name || u.gmail || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{u.name || 'No name'}</div>
                      <div className="text-xs text-gray-500">{u.gmail || 'No email'}</div>
                    </div>
                    <span className="ml-auto text-[10px] uppercase bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{u.role || 'N/A'}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Project Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Project Distribution</h2>
            {distribution.length > 0 ? (
              <div className="space-y-3">
                {distribution.map(d => {
                  const pct = projectTotal ? Math.round((d.count / projectTotal) * 100) : Math.round(d.percentage || 0);
                  const color = d.status === 'Completed' ? 'bg-green-600' : d.status === 'In Progress' ? 'bg-blue-600' : d.status === 'On Hold' ? 'bg-amber-600' : d.status === 'Cancelled' ? 'bg-red-600' : 'bg-purple-600';
                  return (
                    <div key={d.status} className="flex items-center gap-3">
                      <div className="w-28 text-xs font-medium text-gray-600">{d.status}</div>
                      <div className="flex-1 bg-gray-100 rounded h-2"><div className={`h-2 rounded ${color}`} style={{ width: pct + '%' }} /></div>
                      <div className="w-10 text-right text-xs text-gray-600">{pct}%</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-400 text-sm">No distribution data.</div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
            <ul className="space-y-3">
              {activity.length === 0 ? (
                <li className="text-gray-400 text-sm">No recent activity.</li>
              ) : (
                activity.map((log,i)=>(
                  <li key={i} className="text-xs text-gray-700 flex flex-col bg-gray-50 p-2 rounded border">
                    <span className="font-medium text-gray-800">{log.action} {log.field && `(${log.field})`}</span>
                    <span className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleString()} • {log.user || 'System'}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Strategic / Health Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Operational Focus</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'Resource Utilization', progress: 72, color: 'bg-blue-600' },
              { title: 'Budget Adherence', progress: 65, color: 'bg-green-600' },
              { title: 'Schedule Performance', progress: 78, color: 'bg-amber-600' }
            ].map(item => (
              <div key={item.title} className="border rounded-lg p-4 bg-gray-50">
                <div className="font-medium text-gray-800 mb-2 text-sm">{item.title}</div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div className={`h-full ${item.color}`} style={{ width: item.progress + '%' }} />
                </div>
                <div className="text-xs text-gray-500">{item.progress}%</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Risk & Alerts</h2>
          <ul className="text-sm text-gray-600 space-y-3">
            <li className="flex items-start gap-3"><span className="text-red-500 mt-0.5">•</span><div>Projects On Hold require escalation workflow.</div></li>
            <li className="flex items-start gap-3"><span className="text-amber-500 mt-0.5">•</span><div>High priority with low completion may suffer delays.</div></li>
            <li className="flex items-start gap-3"><span className="text-purple-500 mt-0.5">•</span><div>Budget adherence below 70%—review cost centers.</div></li>
            <li className="flex items-start gap-3"><span className="text-blue-500 mt-0.5">•</span><div>Distribute workload to avoid bottlenecks.</div></li>
          </ul>
          <div className="mt-4 text-xs text-gray-500">Future: integrate live KPI engine + anomaly detection.</div>
        </div>
      </div>
    </div>
  );
}
