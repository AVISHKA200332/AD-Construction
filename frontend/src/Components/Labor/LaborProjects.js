import React, { useEffect, useMemo, useState } from 'react';

// Labor-centric Projects / Tasks view
// A laborer typically: sees assigned tasks, starts/completes them, records hours, adds notes, flags safety issues.
// No create/delete of projects. Tasks are local (placeholder until backend endpoints) and can be imported from supervisor assignments.

export default function LaborProjects(){
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('today');
  const [selected, setSelected] = useState(null); // task details
  const [noteDraft, setNoteDraft] = useState('');
  const [importing, setImporting] = useState(false);
  // removed unused progressDraft state
  const [showSummary, setShowSummary] = useState(false);

  // Identify current user for scoping local tasks
  const userData = (()=>{ try { return JSON.parse(localStorage.getItem('userData')||'null'); } catch { return null; } })();
  const userKey = userData?._id || userData?.id || userData?.gmail || 'default';
  const storageKey = `labor_tasks_${userKey}`;

  const persist = (next) => { setTasks(next); localStorage.setItem(storageKey, JSON.stringify(next)); };

  useEffect(()=>{
    // Load tasks
    try { const stored = JSON.parse(localStorage.getItem(storageKey)||'[]'); setTasks(Array.isArray(stored)? stored: []);} catch {}
    // Load minimal project list for context (optional)
    // No remote fetch required for labor local tasks; mark loading complete
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived metrics
  const todayStr = new Date().toISOString().slice(0,10);
  const filtered = useMemo(()=>{
    return tasks
      .filter(t => statusFilter==='All' || t.status===statusFilter)
      .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()) || (t.project||'').toLowerCase().includes(search.toLowerCase()))
      .filter(t => {
        if(dateFilter==='all') return true;
        if(dateFilter==='today') return (t.date || '').startsWith(todayStr);
        if(dateFilter==='past') return (t.date || '') < todayStr;
        if(dateFilter==='upcoming') return (t.date || '') > todayStr;
        return true;
      })
      .sort((a,b)=> (b.date||'').localeCompare(a.date||''));
  }, [tasks, statusFilter, search, dateFilter, todayStr]);

  const metrics = useMemo(()=>{
    const todayTasks = tasks.filter(t => (t.date||'').startsWith(todayStr));
    const totalToday = todayTasks.length;
    const inProgress = todayTasks.filter(t=>t.status==='In Progress').length;
    const completed = todayTasks.filter(t=>t.status==='Completed').length;
    const flagged = todayTasks.filter(t=>t.safetyFlag).length;
    const hours = todayTasks.reduce((acc,t)=> acc + (Number(t.hours)||0),0);
    return { totalToday, inProgress, completed, flagged, hours };
  }, [tasks, todayStr]);

  // Actions
  const startTask = (task) => {
    if(task.status!=='Pending') return;
    persist(tasks.map(t => t.id===task.id ? { ...t, status:'In Progress', startTime:new Date().toISOString() } : t));
  };
  const completeTask = (task) => {
    if(task.status==='Completed') return;
    const end = new Date();
    let start = task.startTime? new Date(task.startTime) : end;
    const hours = Math.max(0, ((end - start)/ (1000*60*60)).toFixed(2));
    persist(tasks.map(t => t.id===task.id ? { ...t, status:'Completed', endTime:end.toISOString(), hours, progress:100 } : t));
  };
  const toggleSafety = (task) => {
    persist(tasks.map(t => t.id===task.id ? { ...t, safetyFlag: !t.safetyFlag } : t));
  };
  const saveNote = () => {
    if(!selected) return;
    persist(tasks.map(t => t.id===selected.id ? { ...t, notes: noteDraft } : t));
    setSelected(prev => prev ? { ...prev, notes: noteDraft } : prev);
  };
  const updateProgress = (task, value) => {
    persist(tasks.map(t => t.id===task.id ? { ...t, progress:value, status: value===100?'Completed': (t.status==='Pending' && value>0 ? 'In Progress': t.status) } : t));
  };

  const importFromAssignments = () => {
    setImporting(true);
    try {
      const assignments = JSON.parse(localStorage.getItem('ss_labor_assignments')||'[]')||[];
      if(assignments.length===0){ alert('No supervisor assignments to import.'); setImporting(false); return; }
      const existingIds = new Set(tasks.map(t=>t.sourceId));
      const newOnes = assignments.filter(a=> !existingIds.has(a.id)).map(a => ({
        id: crypto.randomUUID(),
        sourceId: a.id,
        title: a.task,
        project: a.crew || 'General',
        date: todayStr,
        status: 'Pending',
        progress: 0,
        notes: '',
        safetyFlag:false,
        createdAt: new Date().toISOString()
      }));
      if(newOnes.length===0){ alert('All assignments already imported.'); }
      else { persist([...newOnes, ...tasks]); }
    } catch(e){ alert('Import failed: '+ (e.message||'Unknown')); }
    setImporting(false);
  };

  const openTask = (task) => { setSelected(task); setNoteDraft(task.notes||''); };
  const closeTask = () => { setSelected(null); };

  // Minimal create (laborer can log personal task if needed)
  const [quickTitle, setQuickTitle] = useState('');
  const addPersonalTask = () => {
    if(!quickTitle.trim()) return;
    const newT = {
      id: crypto.randomUUID(),
      title: quickTitle.trim(),
      project: 'Personal',
      date: todayStr,
      status:'Pending',
      progress:0,
      safetyFlag:false,
      notes:'',
      createdAt: new Date().toISOString()
    };
    persist([newT, ...tasks]);
    setQuickTitle('');
  };

  return (
    <div className='px-6 py-8 bg-gray-50 min-h-screen'>
      <div className='flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800'>My Tasks & Site Work</h1>
          <p className='text-gray-600 mt-1 text-sm'>Track progress, log hours, flag safety issues. ({metrics.totalToday} tasks today)</p>
          <button onClick={()=>setShowSummary(s=>!s)} className='mt-2 text-[11px] text-[#0B3954] hover:underline'>Toggle Daily Summary</button>
        </div>
        <div className='flex flex-wrap gap-2 items-center'>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search tasks...' className='px-3 py-2 rounded-lg border bg-white text-sm' />
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className='px-3 py-2 rounded-lg border bg-white text-sm'>
            {['All','Pending','In Progress','Completed'].map(s=> <option key={s}>{s}</option>)}
          </select>
          <select value={dateFilter} onChange={e=>setDateFilter(e.target.value)} className='px-3 py-2 rounded-lg border bg-white text-sm'>
            <option value='today'>Today</option>
            <option value='past'>Past</option>
            <option value='upcoming'>Upcoming</option>
            <option value='all'>All Dates</option>
          </select>
          <button disabled={importing} onClick={importFromAssignments} className='px-4 py-2 rounded-lg bg-[#0B3954] text-white text-sm font-semibold shadow hover:bg-[#092c40] disabled:opacity-50'>Import Assignments</button>
        </div>
      </div>

      {/* Metrics */}
      <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-8'>
        {[{label:'Today', value:metrics.totalToday, icon:'📋', color:'bg-blue-600'},
          {label:'In Progress', value:metrics.inProgress, icon:'⚙️', color:'bg-amber-600'},
          {label:'Completed', value:metrics.completed, icon:'✅', color:'bg-green-600'},
          {label:'Hours', value:metrics.hours, icon:'⏱️', color:'bg-purple-600'},
          {label:'Safety Flags', value:metrics.flagged, icon:'⚠️', color:'bg-red-600'}]
          .map(s => (
            <div key={s.label} className={`rounded-xl shadow p-4 text-white flex items-center gap-3 ${s.color}`}>
              <div className='text-3xl'>{s.icon}</div>
              <div className='flex flex-col'>
                <span className='text-lg font-bold'>{s.value}</span>
                <span className='text-xs text-white/80'>{s.label}</span>
              </div>
            </div>
          ))}
      </div>

      {showSummary && (
        <div className='mb-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-sm text-gray-700'>
          <h2 className='font-semibold text-gray-800 mb-2'>Daily Summary ({todayStr})</h2>
          <ul className='list-disc ml-5 space-y-1 text-xs'>
            <li>{metrics.completed} / {metrics.totalToday} tasks completed ({metrics.inProgress} still in progress).</li>
            <li>{metrics.hours} total recorded hours.</li>
            <li>{metrics.flagged} safety flagged tasks awaiting review.</li>
          </ul>
        </div>
      )}

      {/* Quick Add Personal Task */}
      <div className='mb-6 flex items-center gap-2'>
        <input value={quickTitle} onChange={e=>setQuickTitle(e.target.value)} placeholder='Personal note / micro-task...' className='flex-1 px-3 py-2 rounded-lg border bg-white text-sm' />
        <button onClick={addPersonalTask} className='px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-semibold hover:bg-gray-700'>Add</button>
      </div>

      {/* Task List */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold text-gray-800'>Tasks ({filtered.length})</h2>
          <span className='text-xs text-gray-500'>Updated {new Date().toLocaleTimeString()}</span>
        </div>
        {loading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
            {Array.from({length:6}).map((_,i)=>(<div key={i} className='h-28 rounded-xl bg-gray-100 animate-pulse' />))}
          </div>
        ) : filtered.length===0 ? (
          <div className='text-sm text-gray-500'>No tasks match filters.</div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
            {filtered.map(t => {
              const pct = t.progress || (t.status==='Completed'?100: (t.status==='In Progress'?50:0));
              return (
                <button key={t.id} onClick={()=>openTask(t)} className='text-left border rounded-xl p-4 bg-gray-50 hover:bg-white transition shadow-sm hover:shadow-md relative group'>
                  <div className='flex items-start justify-between gap-3 mb-1'>
                    <h3 className='font-semibold text-gray-800 line-clamp-1 pr-2'>{t.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${t.status==='Completed'?'bg-green-100 text-green-700':t.status==='In Progress'?'bg-blue-100 text-blue-700':'bg-gray-200 text-gray-700'}`}>{t.status}</span>
                  </div>
                  <div className='text-[11px] text-gray-500 mb-2 flex justify-between'>
                    <span>{t.project||'General'}</span>
                    <span>{t.date}</span>
                  </div>
                  <div className='h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2'>
                    <div className={`h-full ${pct===100?'bg-green-600':pct>60?'bg-blue-600':pct>30?'bg-amber-500':'bg-red-500'}`} style={{width: pct+'%'}} />
                  </div>
                  <div className='flex items-center justify-between text-[10px] text-gray-500'>
                    <span>{pct}%</span>
                    {t.safetyFlag && <span className='text-red-600 font-semibold'>SAFETY</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Detail Drawer */}
      {selected && (
        <div className='fixed inset-0 z-50 flex items-start justify-end bg-black/40'>
          <div className='w-full max-w-xl h-full bg-white border-l border-gray-200 flex flex-col'>
            <div className='p-5 border-b flex items-center justify-between'>
              <div>
                <h2 className='text-lg font-semibold text-gray-800'>{selected.title}</h2>
                <p className='text-xs text-gray-500'>{selected.project||'General'} • {selected.date}</p>
              </div>
              <button onClick={closeTask} className='text-gray-500 hover:text-gray-700 text-sm'>Close ✕</button>
            </div>
            <div className='overflow-y-auto flex-1 p-6 space-y-8 text-sm'>
              <section>
                <h3 className='text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3'>Progress</h3>
                <div className='flex items-center gap-3 mb-2'>
                  <input type='range' min='0' max='100' value={selected.progress||0} onChange={e=>{ const val=Number(e.target.value); updateProgress(selected,val); setSelected(prev=> prev?{...prev,progress:val}:prev); }} className='flex-1' />
                  <span className='w-12 text-right font-semibold'>{selected.progress||0}%</span>
                </div>
                <div className='h-2 w-full bg-gray-200 rounded-full overflow-hidden'>
                  <div className='h-full bg-[#0B3954]' style={{width:(selected.progress||0)+'%'}} />
                </div>
                <div className='mt-3 flex gap-2 flex-wrap'>
                  {selected.status==='Pending' && <button onClick={()=>{startTask(selected); setSelected(prev=> prev?{...prev,status:'In Progress'}:prev);}} className='px-3 py-1.5 text-xs rounded bg-blue-600 text-white'>Start</button>}
                  {selected.status!=='Completed' && <button onClick={()=>{completeTask(selected); setSelected(prev=> prev?{...prev,status:'Completed',progress:100}:prev);}} className='px-3 py-1.5 text-xs rounded bg-green-600 text-white'>Complete</button>}
                  <button onClick={()=>{toggleSafety(selected); setSelected(prev=> prev?{...prev,safetyFlag:!prev.safetyFlag}:prev);}} className={`px-3 py-1.5 text-xs rounded ${selected.safetyFlag?'bg-red-600 text-white':'bg-red-100 text-red-700'}`}>{selected.safetyFlag?'Unflag Safety':'Flag Safety'}</button>
                </div>
                {selected.startTime && <p className='text-[11px] text-gray-500 mt-2'>Started: {new Date(selected.startTime).toLocaleTimeString()}</p>}
                {selected.endTime && <p className='text-[11px] text-gray-500'>Finished: {new Date(selected.endTime).toLocaleTimeString()} ({selected.hours} h)</p>}
              </section>

              <section>
                <h3 className='text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2'>Notes</h3>
                <textarea value={noteDraft} onChange={e=>setNoteDraft(e.target.value)} rows={4} className='w-full px-3 py-2 rounded-lg border resize-y text-sm' placeholder='Add work details, obstacles, safety context...' />
                <div className='flex justify-end mt-2'>
                  <button onClick={saveNote} className='px-4 py-2 rounded-lg bg-[#0B3954] text-white text-xs font-semibold'>Save Note</button>
                </div>
                {selected.notes && selected.notes!==noteDraft && <p className='mt-2 text-[10px] text-amber-600'>Unsaved changes present.</p>}
              </section>

              <section>
                <h3 className='text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2'>Task Metadata</h3>
                <div className='grid grid-cols-2 gap-4 text-[11px] text-gray-600'>
                  <div className='bg-gray-50 rounded-lg p-3'>Status: <span className='font-semibold text-gray-800'>{selected.status}</span></div>
                  <div className='bg-gray-50 rounded-lg p-3'>Progress: <span className='font-semibold text-gray-800'>{selected.progress||0}%</span></div>
                  <div className='bg-gray-50 rounded-lg p-3 col-span-2'>Safety: {selected.safetyFlag ? <span className='text-red-600 font-semibold'>Flagged</span> : <span className='text-gray-700'>Normal</span>}</div>
                  <div className='bg-gray-50 rounded-lg p-3 col-span-2'>Created: {new Date(selected.createdAt).toLocaleString()}</div>
                </div>
              </section>
            </div>
          </div>
          <button onClick={closeTask} className='flex-1 h-full' aria-label='Close drawer background' />
        </div>
      )}
    </div>
  );
}
