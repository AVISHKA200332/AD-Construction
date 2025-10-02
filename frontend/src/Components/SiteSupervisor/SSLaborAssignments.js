import React, { useEffect, useState } from 'react';

const empty = { task:'', crew:'', laborCount:0, startDate:'', endDate:'', status:'Planned', notes:'' };

export default function SSLaborAssignments(){
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(()=>{ try { setAssignments(JSON.parse(localStorage.getItem('ss_labor_assignments')||'[]')); } catch {} }, []);
  const persist = (next)=>{ setAssignments(next); localStorage.setItem('ss_labor_assignments', JSON.stringify(next)); };

  const filtered = assignments.filter(a => (filterStatus==='All'||a.status===filterStatus) && (!search || a.task.toLowerCase().includes(search.toLowerCase())));

  const submit = e => {
    e.preventDefault();
    if(!form.task.trim()) return;
    if(editingId){
      persist(assignments.map(a=> a.id===editingId ? { ...a, ...form } : a));
    } else {
      persist([...assignments, { ...form, id:crypto.randomUUID(), createdAt:new Date().toISOString() }]);
    }
    setForm(empty); setEditingId(null);
  };
  const edit = (a)=> { setForm({...a}); setEditingId(a.id); };
  const remove = (id)=> { if(window.confirm('Delete assignment?')) persist(assignments.filter(a=>a.id!==id)); };
  const quick = (id, status)=> { persist(assignments.map(a=> a.id===id ? { ...a, status } : a)); };

  return (
    <div className='px-6 py-8 bg-gray-50 min-h-screen'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>Labor Assignments</h1>
          <p className='text-gray-600 text-sm mt-1'>Allocate crews and track status for on-site tasks.</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search tasks...' className='px-3 py-2 rounded-lg border bg-white text-sm' />
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className='px-3 py-2 rounded-lg border bg-white text-sm'>
            {['All','Planned','Active','Completed','Paused','Cancelled'].map(s=> <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
        <form onSubmit={submit} className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4'>
          <h2 className='text-lg font-semibold text-gray-800'>{editingId? 'Edit Assignment':'New Assignment'}</h2>
          <div>
            <label className='block text-sm font-medium text-gray-600'>Task</label>
            <input value={form.task} onChange={e=>setForm(f=>({...f,task:e.target.value}))} className='mt-1 w-full px-3 py-2 border rounded-lg' />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <label className='text-sm'>
              <span className='text-gray-600 font-medium'>Crew</span>
              <input value={form.crew} onChange={e=>setForm(f=>({...f,crew:e.target.value}))} className='mt-1 w-full px-3 py-2 border rounded-lg' />
            </label>
            <label className='text-sm'>
              <span className='text-gray-600 font-medium'>Labor Count</span>
              <input type='number' min='0' value={form.laborCount} onChange={e=>setForm(f=>({...f,laborCount:Number(e.target.value)}))} className='mt-1 w-full px-3 py-2 border rounded-lg' />
            </label>
            <label className='text-sm'>
              <span className='text-gray-600 font-medium'>Start</span>
              <input type='date' value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))} className='mt-1 w-full px-3 py-2 border rounded-lg' />
            </label>
            <label className='text-sm'>
              <span className='text-gray-600 font-medium'>End</span>
              <input type='date' value={form.endDate} onChange={e=>setForm(f=>({...f,endDate:e.target.value}))} className='mt-1 w-full px-3 py-2 border rounded-lg' />
            </label>
            <label className='text-sm col-span-2'>
              <span className='text-gray-600 font-medium'>Status</span>
              <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} className='mt-1 w-full px-3 py-2 border rounded-lg'>
                {['Planned','Active','Completed','Paused','Cancelled'].map(s=> <option key={s}>{s}</option>)}
              </select>
            </label>
          </div>
          <label className='text-sm block'>
            <span className='text-gray-600 font-medium'>Notes</span>
            <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={3} className='mt-1 w-full px-3 py-2 border rounded-lg resize-y' />
          </label>
          <div className='flex justify-end gap-3 pt-2'>
            {editingId && <button type='button' onClick={()=>{setEditingId(null); setForm(empty);}} className='px-4 py-2 border rounded-lg'>Cancel</button>}
            <button type='submit' className='px-4 py-2 bg-[#0B3954] text-white rounded-lg'>{editingId? 'Update':'Add'}</button>
          </div>
        </form>
        <div className='xl:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>Assignments ({filtered.length})</h2>
          {filtered.length===0 ? <div className='text-sm text-gray-500'>No assignments.</div> : (
            <div className='space-y-3 max-h-[70vh] overflow-y-auto pr-2'>
              {filtered.slice().sort((a,b)=> a.status.localeCompare(b.status)).map(a => (
                <div key={a.id} className='p-3 rounded-xl border bg-gray-50 hover:bg-white transition flex flex-col gap-1'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium text-gray-800 text-sm line-clamp-1'>{a.task}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${a.status==='Completed'?'bg-green-100 text-green-700':a.status==='Active'?'bg-blue-100 text-blue-700':a.status==='Paused'?'bg-amber-100 text-amber-700':a.status==='Cancelled'?'bg-red-100 text-red-700':'bg-gray-200 text-gray-700'}`}>{a.status}</span>
                  </div>
                  <div className='flex flex-wrap gap-4 text-[11px] text-gray-500'>
                    <span>Crew {a.crew||'N/A'}</span>
                    <span>Labor {a.laborCount||0}</span>
                    {a.startDate && <span>{a.startDate} → {a.endDate||'?'}</span>}
                  </div>
                  {a.notes && <p className='text-[11px] text-gray-600 line-clamp-2'>{a.notes}</p>}
                  <div className='flex flex-wrap gap-2 justify-end pt-1'>
                    {a.status!=='Completed' && <button onClick={()=>quick(a.id,'Active')} className='text-[11px] px-2 py-1 rounded bg-blue-600 text-white'>Start</button>}
                    {a.status!=='Completed' && <button onClick={()=>quick(a.id,'Completed')} className='text-[11px] px-2 py-1 rounded bg-green-600 text-white'>Done</button>}
                    <button onClick={()=>edit(a)} className='text-[11px] px-2 py-1 rounded bg-gray-200 text-gray-700'>Edit</button>
                    <button onClick={()=>remove(a.id)} className='text-[11px] px-2 py-1 rounded bg-red-600 text-white'>Del</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
