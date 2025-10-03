import React, { useEffect, useMemo, useState } from 'react';
import { projectService } from '../../services/projectService';

// A creative Labor Dashboard mirroring the visual language of AdminDashboard
// while focusing on what a laborer would care about: assignments, progress,
// hours, availability, upcoming tasks, and quick actions.
export default function LaborDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState([]);
  const [availability, setAvailability] = useState(
    () => localStorage.getItem('labor_availability') || 'Available'
  );
  const [filterStatus, setFilterStatus] = useState('Active');

  const userData = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('userData')) || {}; } catch { return {}; }
  }, []);

  // Fetch all projects (placeholder until labor-specific assignment exists)
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await projectService.getAllProjects();
        const list = Array.isArray(data?.projects) ? data.projects : [];
        setProjects(list);
        // Simulated recent activity: pick latest updated projects
        const sorted = list.slice().sort((a,b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
        setActivity(sorted.slice(0,5).map(p => ({
          id: p._id,
            name: p.name,
            status: p.status,
            completion: p.completion,
            timestamp: p.updatedAt || p.createdAt
        })));
      } catch (e) {
        console.error('Labor dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleAvailability = () => {
    const next = availability === 'Available' ? 'On Break' : availability === 'On Break' ? 'Unavailable' : 'Available';
    setAvailability(next);
    localStorage.setItem('labor_availability', next);
  };

  // Derive stats (heuristics until real assignment model exists)
  const stats = useMemo(() => {
    const inProgress = projects.filter(p => p.status === 'In Progress');
    const completed = projects.filter(p => p.status === 'Completed');
    const pendingTasks = projects.filter(p => p.status !== 'Completed' && (p.completion ?? 0) < 100).length;
    // Placeholder hours: completion * 1.5 factor
    const totalHours = inProgress.reduce((sum, p) => sum + Math.round((p.completion || 0) * 1.5), 0);
    return [
      { label: 'In Progress', value: inProgress.length, icon: '🚧', color: 'bg-blue-600' },
      { label: 'Completed', value: completed.length, icon: '✅', color: 'bg-green-600' },
      { label: 'Est. Hours', value: totalHours, icon: '⏱️', color: 'bg-amber-600' },
      { label: 'Pending Tasks', value: pendingTasks, icon: '🧰', color: 'bg-purple-600' }
    ];
  }, [projects]);

  // Filtered assignments (simulate: active = not completed)
  const assignments = useMemo(() => {
    let list = projects.filter(p => p.status !== 'Completed');
    if (filterStatus === 'Completed') list = projects.filter(p => p.status === 'Completed');
    if (filterStatus === 'All') list = projects;
    return list.slice(0, 8);
  }, [projects, filterStatus]);

  const availabilityColor = availability === 'Available' ? 'bg-green-100 text-green-700 border-green-300' : availability === 'On Break' ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-red-100 text-red-700 border-red-300';

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Labor Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome{userData?.name ? `, ${userData.name}` : ''}. Track your work, progress, and availability.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAvailability}
            className={`px-4 py-2 rounded-lg border text-sm font-semibold shadow-sm transition ${availabilityColor}`}
            title="Toggle availability"
          >
            {availability}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-[#0B3954] text-white text-sm font-semibold shadow hover:bg-[#092c40]"
          >Refresh</button>
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
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 group-hover:scale-110 transition"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignments */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Assignments</h2>
            <div className="flex gap-2 text-sm">
              {['Active','Completed','All'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1 rounded-full border transition ${filterStatus===s ? 'bg-[#0B3954] text-white border-[#0B3954]' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >{s}</button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({length:4}).map((_,i)=>(
                <div key={i} className="h-28 animate-pulse bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-gray-500 text-sm">No assignments found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map(p => {
                const pct = Math.min(100, Math.max(0, Number(p.completion)||0));
                const barColor = pct === 100 ? 'bg-green-600' : pct > 60 ? 'bg-blue-600' : pct > 30 ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <div key={p._id} className="border rounded-xl p-4 bg-gray-50 hover:bg-white transition shadow-sm hover:shadow-md relative overflow-hidden">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-semibold text-gray-800 line-clamp-1 pr-2">{p.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status==='Completed'?'bg-green-100 text-green-700':p.status==='In Progress'?'bg-blue-100 text-blue-700':p.status==='On Hold'?'bg-amber-100 text-amber-700':'bg-gray-200 text-gray-700'}`}>{p.status}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">ID: {p.projectId}</div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div className={`h-full ${barColor} transition-all`} style={{ width: pct + '%' }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{pct}% Complete</span>
                      <span>{new Date(p.updatedAt || p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
            {loading ? (
              <div className="space-y-3">
                {Array.from({length:5}).map((_,i)=>(<div key={i} className="h-10 bg-gray-100 animate-pulse rounded" />))}
              </div>
            ) : activity.length === 0 ? (
              <div className="text-gray-500 text-sm">No recent updates.</div>
            ) : (
              <ul className="space-y-3">
                {activity.map(a => {
                  const pct = Math.min(100, Math.max(0, Number(a.completion)||0));
                  return (
                    <li key={a.id} className="p-3 bg-gray-50 rounded-lg hover:bg-white border shadow-sm transition">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium text-gray-800 line-clamp-1">{a.name}</div>
                        <span className="text-xs text-gray-500">{new Date(a.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 flex-1 bg-gray-200 rounded overflow-hidden">
                          <div className="h-full bg-[#0B3954]" style={{ width: pct + '%' }} />
                        </div>
                        <span className="text-[10px] text-gray-600 w-8 text-right">{pct}%</span>
                      </div>
                      <div className="mt-1 text-[10px] uppercase tracking-wide font-semibold text-gray-400">{a.status}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          <div className="mt-6 pt-4 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Quick Tips</h3>
            <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
              <li>Update your availability so supervisors know your status.</li>
              <li>Focus on tasks below 30% completion for biggest impact.</li>
              <li>Refresh to sync latest project progress.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Skill & Goal Section (placeholder) */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Weekly Focus</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'Safety Compliance', progress: 90, color: 'bg-green-600' },
              { title: 'Tool Readiness', progress: 70, color: 'bg-blue-600' },
              { title: 'Punctuality', progress: 95, color: 'bg-purple-600' }
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
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Availability Legend</h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li><span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2 align-middle"></span>Available – Ready for assignment</li>
            <li><span className="inline-block w-3 h-3 bg-amber-500 rounded-full mr-2 align-middle"></span>On Break – Short pause</li>
            <li><span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2 align-middle"></span>Unavailable – Not taking new tasks</li>
          </ul>
          <div className="mt-4 text-xs text-gray-500">Real-time integration can later connect to supervisor scheduling APIs.</div>
        </div>
      </div>
    </div>
  );
}
