import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { roleOpsService } from '../../services/roleOpsService';
import axios from 'axios';

// Shared small components
function StatCard({ title, value, subtitle, icon, accent = '#0B3954' }) {
  return (
    <div className="relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">{title}</p>
          <p className="text-3xl font-extrabold mt-1" style={{ color: accent }}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: `${accent}10`, color: accent }}>{icon}</div>
      </div>
      <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none" aria-hidden>
        <div className="h-20 w-20 rounded-full" style={{ background: accent }} />
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [projectTotal, setProjectTotal] = useState(0);
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Fetch only this client's projects from role-scoped endpoint
        const scoped = await roleOpsService.clientProjects();
        const list = Array.isArray(scoped?.projects) ? scoped.projects : (Array.isArray(scoped) ? scoped : []);
        setProjects(list);
        setProjectTotal(list.length || 0);
        // Build distribution locally from subset
        const counts = list.reduce((acc, p) => {
          const s = p.status || 'Planning';
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {});
        const dist = Object.entries(counts).map(([status, count]) => ({ status, count }));
        setDistribution(dist);
        // derive fake milestones: choose top 3 mid-progress projects
        const mid = list.filter(p => (p.completion||0) > 10 && (p.completion||0) < 90)
          .sort((a,b)=> (b.completion||0)-(a.completion||0))
          .slice(0,3)
          .map(p => ({
            label: p.name,
            date: new Date(new Date(p.startDate).getTime() + ((p.completion||0)/100) * (new Date(p.endDate) - new Date(p.startDate) || 1)).toLocaleDateString(),
            color: '#0B3954'
          }));
        setMilestones(mid);
        // Recent messages (client inbox) if backend supports /messages/inbox with token
        try {
          const token = localStorage.getItem('authToken');
            if (token) {
            const res = await axios.get('http://localhost:5000/messages/inbox', { headers: { Authorization: `Bearer ${token}` }});
            const msgs = res.data?.messages || [];
            setMessages(msgs.slice(0,5));
          }
        } catch (_) { /* silent */ }
      } catch (e) {
        console.error('ClientDashboard load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Stats derived
  const stats = useMemo(() => {
    const active = projects.filter(p => ['Planning','In Progress'].includes(p.status));
    const avgCompletion = active.length ? Math.round(active.reduce((s,p)=> s+(p.completion||0),0)/active.length) : 0;
    const alerts = projects.filter(p => ['On Hold','Cancelled'].includes(p.status)).length;
    // Budget placeholder (no finance cross link yet) / Could aggregate later
    return [
      { title: 'Active Projects', value: active.length, subtitle: `${projects.length-active.length} non-active`, accent: '#0B3954', icon: <span>📁</span> },
      { title: 'Avg. Completion', value: avgCompletion + '%', subtitle: 'Across active', accent: '#16A34A', icon: <span>📊</span> },
      { title: 'Budget (Est.)', value: '—', subtitle: 'Awaiting finance link', accent: '#E67E22', icon: <span>💰</span> },
      { title: 'Alerts', value: alerts, subtitle: 'Hold / Cancelled', accent: '#DC2626', icon: <span>⚠️</span> }
    ];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects
      .filter(p => statusFilter === 'All' || p.status === statusFilter)
      .filter(p => !search || (p.name?.toLowerCase().includes(search.toLowerCase()) || p.projectId?.toLowerCase().includes(search.toLowerCase())))
      .slice(0,12);
  }, [projects, statusFilter, search]);

  const today = new Date();
  const niceDate = today.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'2-digit'});

  return (
    <div className="px-6 py-8 bg-gray-50 min-h-screen">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0B3954]">Client Dashboard</h1>
          <p className="text-gray-600 mt-1">Track project progress, finances and communications in one place.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex gap-2 bg-white rounded-lg shadow border p-1 text-sm">
            {['All','Planning','In Progress','On Hold','Completed','Cancelled'].map(s => (
              <button key={s} onClick={()=>setStatusFilter(s)} className={`px-3 py-1 rounded-md font-medium transition ${statusFilter===s ? 'bg-[#0B3954] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{s}</button>
            ))}
          </div>
          <div className="flex gap-1 bg-white rounded-lg shadow border p-1">
            {['grid','list'].map(v => (
              <button key={v} onClick={()=>setViewMode(v)} className={`px-3 py-1 rounded-md text-sm font-medium ${viewMode===v ? 'bg-[#0B3954] text-white':'text-gray-600 hover:bg-gray-100'}`}>{v==='grid'?'Grid':'List'}</button>
            ))}
          </div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search projects..." className="px-3 py-2 rounded-lg border bg-white shadow text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3954]" />
          <div className="text-sm text-gray-500 self-center">{niceDate}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {stats.map(s => <StatCard key={s.title} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Projects Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Project Overview</h2>
            <span className="text-xs text-gray-500">Showing {filteredProjects.length} / {projects.length}</span>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({length:4}).map((_,i)=>(<div key={i} className="h-28 bg-gray-100 animate-pulse rounded-xl" />))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-gray-500 text-sm">No projects match current filters.</div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map(p => {
                const pct = Math.min(100, Math.max(0, Number(p.completion)||0));
                const barColor = pct===100?'bg-green-600':pct>60?'bg-blue-600':pct>30?'bg-amber-500':'bg-red-500';
                return (
                  <div key={p._id} className="border rounded-xl p-4 bg-gray-50 hover:bg-white transition shadow-sm hover:shadow-md relative overflow-hidden">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-semibold text-gray-800 line-clamp-1 pr-2" title={p.name}>{p.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status==='Completed'?'bg-green-100 text-green-700':p.status==='In Progress'?'bg-blue-100 text-blue-700':p.status==='On Hold'?'bg-amber-100 text-amber-700':p.status==='Planning'?'bg-purple-100 text-purple-700':p.status==='Cancelled'?'bg-red-100 text-red-700':'bg-gray-200 text-gray-700'}`}>{p.status}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mb-2">ID: {p.projectId}</div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div className={`h-full ${barColor}`} style={{ width: pct+'%' }} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-600">
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

        {/* Side panels */}
        <div className="flex flex-col gap-6">
          {/* Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Project Distribution</h2>
            {distribution.length ? (
              <div className="space-y-3">
                {distribution.map(d => {
                  const pct = projectTotal ? Math.round((d.count / projectTotal) * 100) : Math.round(d.percentage || 0);
                  const color = d.status==='Completed'?'bg-green-600':d.status==='In Progress'?'bg-blue-600':d.status==='On Hold'?'bg-amber-600':d.status==='Cancelled'?'bg-red-600':'bg-purple-600';
                  return (
                    <div key={d.status} className="flex items-center gap-3">
                      <div className="w-28 text-xs font-medium text-gray-600">{d.status}</div>
                      <div className="flex-1 bg-gray-100 rounded h-2"><div className={`h-2 rounded ${color}`} style={{ width: pct + '%' }} /></div>
                      <div className="w-10 text-right text-[11px] text-gray-600">{pct}%</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-400 text-sm">No distribution data.</div>
            )}
          </div>

          {/* Recent Communications */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-800">Recent Communications</h2>
              <Link to="/client/communication" className="text-sm text-[#0B3954] hover:underline">Inbox</Link>
            </div>
            {messages.length === 0 ? (
              <div className="text-gray-400 text-sm">No recent messages.</div>
            ) : (
              <ul className="divide-y">
                {messages.map(m => (
                  <li key={m._id} className="py-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{m.subject}</p>
                      <p className="text-[11px] text-gray-500">From: {m.sender}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{m.date ? new Date(m.date).toLocaleDateString() : ''}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Upcoming Milestones */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Milestones</h2>
            {milestones.length === 0 ? (
              <div className="text-gray-400 text-sm">No milestones derived.</div>
            ) : (
              <div className="space-y-3">
                {milestones.map((mil,i)=>(
                  <div key={i} className="flex items-center justify-between border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: mil.color }} />
                      <p className="text-sm text-gray-800 line-clamp-1" title={mil.label}>{mil.label}</p>
                    </div>
                    <span className="text-xs text-gray-500">{mil.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Financial & Health (placeholder until integrated) */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Snapshot (Placeholder)</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'Budget Used', progress: 0, color: 'bg-gray-400' },
              { title: 'Invoices Paid', progress: 0, color: 'bg-gray-400' },
              { title: 'Pending Payments', progress: 0, color: 'bg-gray-400' }
            ].map(item => (
              <div key={item.title} className="border rounded-lg p-4 bg-gray-50">
                <div className="font-medium text-gray-800 mb-2 text-sm">{item.title}</div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div className={`h-full ${item.color}`} style={{ width: item.progress + '%' }} />
                </div>
                <div className="text-xs text-gray-500">Integrate finance data</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Notes & Guidance</h2>
          <ul className="text-sm text-gray-600 space-y-3">
            <li className="flex items-start gap-3"><span className="text-blue-500 mt-0.5">•</span><div>Use filters above to focus on specific project states.</div></li>
            <li className="flex items-start gap-3"><span className="text-green-500 mt-0.5">•</span><div>Upcoming milestones are approximations based on progress.</div></li>
            <li className="flex items-start gap-3"><span className="text-amber-500 mt-0.5">•</span><div>Finance integration will populate snapshot automatically.</div></li>
            <li className="flex items-start gap-3"><span className="text-purple-500 mt-0.5">•</span><div>Click into Projects for detailed timelines & documents.</div></li>
          </ul>
          <div className="mt-4 text-xs text-gray-500">Future: personalized portfolio KPIs & variance analytics.</div>
        </div>
      </div>
    </div>
  );
}
