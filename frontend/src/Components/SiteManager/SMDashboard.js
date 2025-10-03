import React, { useEffect, useMemo, useState } from 'react';
import { projectService } from '../../services/projectService';

// Enhanced Site Manager Dashboard aligned with the richer style of Admin & Labor dashboards.
// Focuses on site oversight: active projects, issues (heuristic), inspections scheduling, materials tracking.
export default function SMDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Active');
  const [activity, setActivity] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await projectService.getAllProjects();
        const list = Array.isArray(data?.projects) ? data.projects : [];
        setProjects(list);
        const sorted = list.slice().sort((a,b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
        setActivity(sorted.slice(0,6));
      } catch (e) {
        console.error('SMDashboard load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Heuristic issue counts (simulate based on status & completion buckets)
  const stats = useMemo(() => {
    const active = projects.filter(p => ['Planning','In Progress'].includes(p.status));
    const inspectionsDue = active.filter(p => (p.completion||0) > 45 && (p.completion||0) < 55).length; // mid-phase checkpoint
    const materialFlags = active.filter(p => (p.priority === 'High' || p.priority === 'Critical') && (p.completion||0) < 40).length;
    const openIssues = active.filter(p => (p.status === 'On Hold') || ((p.completion||0) < 20 && p.priority === 'Critical')).length;
    return [
      { label: 'Active Sites', value: active.length, icon: '🏗️', color: 'bg-blue-600' },
      { label: 'Open Issues', value: openIssues, icon: '⚠️', color: 'bg-red-600' },
      { label: 'Inspections Due', value: inspectionsDue, icon: '🔍', color: 'bg-amber-600' },
      { label: 'Material Alerts', value: materialFlags, icon: '📦', color: 'bg-purple-600' },
    ];
  }, [projects]);

  const filtered = useMemo(() => {
    let list = projects;
    if (filter === 'Active') list = projects.filter(p => ['Planning','In Progress'].includes(p.status));
    if (filter === 'On Hold') list = projects.filter(p => p.status === 'On Hold');
    if (filter === 'Completed') list = projects.filter(p => p.status === 'Completed');
    return list.slice(0, 10);
  }, [projects, filter]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Site Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor site performance, issues, inspections and resource needs.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 text-sm bg-white rounded-lg shadow border p-1">
            {['Active','On Hold','Completed','All'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s === 'All' ? 'All' : s)}
                className={`px-3 py-1 rounded-md font-medium transition ${filter===s || (s==='All' && filter==='All') ? 'bg-[#0B3954] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >{s}</button>
            ))}
          </div>
          <div className="flex gap-1 bg-white rounded-lg shadow border p-1">
            {['grid','list'].map(v => (
              <button key={v} onClick={() => setViewMode(v)} className={`px-3 py-1 rounded-md text-sm font-medium ${viewMode===v ? 'bg-[#0B3954] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{v==='grid'?'Grid':'List'}</button>
            ))}
          </div>
          <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-[#0B3954] text-white text-sm font-semibold shadow hover:bg-[#092c40]">Refresh</button>
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
        {/* Site Cards */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Sites Overview</h2>
            <span className="text-xs text-gray-500">Showing {filtered.length} / {projects.length}</span>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({length:4}).map((_,i)=>(<div key={i} className="h-28 bg-gray-100 animate-pulse rounded-lg" />))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-gray-500 text-sm">No projects in this view.</div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(p => {
                const pct = Math.min(100, Math.max(0, Number(p.completion)||0));
                const barColor = pct === 100 ? 'bg-green-600' : pct > 60 ? 'bg-blue-600' : pct > 30 ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <div key={p._id} className="border rounded-xl p-4 bg-gray-50 hover:bg-white transition shadow-sm hover:shadow-md relative overflow-hidden">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-semibold text-gray-800 line-clamp-1 pr-2">{p.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status==='Completed'?'bg-green-100 text-green-700':p.status==='In Progress'?'bg-blue-100 text-blue-700':p.status==='On Hold'?'bg-amber-100 text-amber-700':p.status==='Planning'?'bg-purple-100 text-purple-700':'bg-gray-200 text-gray-700'}`}>{p.status}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">ID: {p.projectId}</div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div className={`h-full ${barColor} transition-all`} style={{ width: pct + '%' }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{pct}% Complete</span>
                      <span>{new Date(p.updatedAt || p.createdAt).toLocaleDateString()}</span>
                    </div>
                    {p.priority && <div className="mt-2 text-[10px] uppercase tracking-wide font-semibold text-gray-400">Priority: {p.priority}</div>}
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
                      <div className="flex items-center gap-2 text-xs text-gray-500">
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

        {/* Activity & Planning */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Site Activity</h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({length:5}).map((_,i)=>(<div key={i} className="h-10 bg-gray-100 animate-pulse rounded" />))}
            </div>
          ) : activity.length === 0 ? (
            <div className="text-gray-500 text-sm">No recent changes.</div>
          ) : (
            <ul className="space-y-3">
              {activity.map(p => (
                <li key={p._id} className="p-3 bg-gray-50 rounded-lg hover:bg-white border shadow-sm transition">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-gray-800 line-clamp-1">{p.name}</div>
                    <span className="text-xs text-gray-500">{new Date(p.updatedAt || p.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1.5 flex-1 bg-gray-200 rounded overflow-hidden">
                      <div className="h-full bg-[#0B3954]" style={{ width: (p.completion||0)+'%' }} />
                    </div>
                    <span className="text-[10px] text-gray-600 w-8 text-right">{p.completion||0}%</span>
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-wide font-semibold text-gray-400">{p.status}</div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 pt-4 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Next 7 Days (Planner)</h3>
            <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
              <li>Validate material deliveries for high priority sites.</li>
              <li>Schedule mid-phase inspections (45–55% completion).</li>
              <li>Resolve On Hold projects root causes.</li>
              <li>Prepare workforce allocation for upcoming phases.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Resource & Risk Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Resource Focus</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'Crew Allocation', progress: 75, color: 'bg-blue-600' },
              { title: 'Equipment Utilization', progress: 62, color: 'bg-green-600' },
              { title: 'Material Readiness', progress: 48, color: 'bg-amber-600' }
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
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Risk Signals</h2>
          <ul className="text-sm text-gray-600 space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-0.5">•</span>
              <div><span className="font-medium text-gray-800">On Hold</span> projects require escalation review.</div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-500 mt-0.5">•</span>
              <div>Mid-phase projects (45–55%) need inspection scheduling.</div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-500 mt-0.5">•</span>
              <div>High priority sites under 40% may face supply constraints.</div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500 mt-0.5">•</span>
              <div>Consider smoothing workload distribution across crews.</div>
            </li>
          </ul>
          <div className="mt-4 text-xs text-gray-500">Future enhancement: integrate real risk scoring & alerts feed.</div>
        </div>
      </div>
    </div>
  );
}
