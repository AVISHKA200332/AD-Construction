import React, { useEffect, useState } from 'react';

const empty = { date: new Date().toISOString().slice(0,10), weather:'', progress:0, laborCount:0, incidents:0, notes:'' };

export default function SSDailyUpdates(){
  const [updates, setUpdates] = useState([]);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(()=>{ try { setUpdates(JSON.parse(localStorage.getItem('ss_daily_updates')||'[]')); } catch {} }, []);
  const persist = (next) => { setUpdates(next); localStorage.setItem('ss_daily_updates', JSON.stringify(next)); };

  const filtered = updates.filter(u => !search || (u.notes||'').toLowerCase().includes(search.toLowerCase()));

  const submit = e => {
    e.preventDefault();
    if (editingId){
      persist(updates.map(u=>u.id===editingId ? { ...u, ...form } : u));
    } else {
      persist([...updates, { ...form, id:crypto.randomUUID() }]);
    }
    setForm({ ...empty, date: form.date });
    setEditingId(null);
  };
  const edit = (u) => { setEditingId(u.id); setForm({ ...u }); };
  const remove = (id) => { if(window.confirm('Delete log?')) persist(updates.filter(u=>u.id!==id)); };

  return (
    <div className='px-6 py-8 bg-gray-50 min-h-screen'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>Daily Updates</h1>
          <p className='text-gray-600 text-sm mt-1'>Record daily site progress, labor counts, incidents & notes.</p>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search notes...' className='px-3 py-2 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3954]' />
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
        <form onSubmit={submit} className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4'>
          <h2 className='text-lg font-semibold text-gray-800'>{editingId ? 'Edit Entry' : 'New Daily Entry'}</h2>
          <div className='grid grid-cols-2 gap-4'>
            <label className='text-sm'>
              <span className='text-gray-600 font-medium'>Date</span>
              <input type='date' value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} className='mt-1 w-full px-3 py-2 border rounded-lg' />
            </label>
            <label className='text-sm'>
              <span className='text-gray-600 font-medium'>Weather</span>
              <input value={form.weather} onChange={e=>setForm(f=>({...f,weather:e.target.value}))} className='mt-1 w-full px-3 py-2 border rounded-lg' />
            </label>
            <label className='text-sm'>
              <span className='text-gray-600 font-medium'>Progress %</span>
              <input type='number' min='0' max='100' value={form.progress} onChange={e=>setForm(f=>({...f,progress:Number(e.target.value)}))} className='mt-1 w-full px-3 py-2 border rounded-lg' />
            </label>
            <label className='text-sm'>
              <span className='text-gray-600 font-medium'>Labor Count</span>
              <input type='number' min='0' value={form.laborCount} onChange={e=>setForm(f=>({...f,laborCount:Number(e.target.value)}))} className='mt-1 w-full px-3 py-2 border rounded-lg' />
            </label>
            <label className='text-sm'>
              <span className='text-gray-600 font-medium'>Incidents</span>
              <input type='number' min='0' value={form.incidents} onChange={e=>setForm(f=>({...f,incidents:Number(e.target.value)}))} className='mt-1 w-full px-3 py-2 border rounded-lg' />
            </label>
          </div>
          <label className='text-sm block'>
            <span className='text-gray-600 font-medium'>Notes</span>
            <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={4} className='mt-1 w-full px-3 py-2 border rounded-lg resize-y' />
          </label>
          <div className='flex justify-end gap-3 pt-2'>
            {editingId && <button type='button' onClick={()=>{setEditingId(null); setForm(empty);}} className='px-4 py-2 border rounded-lg'>Cancel Edit</button>}
            <button type='submit' className='px-4 py-2 bg-[#0B3954] text-white rounded-lg'>{editingId? 'Update Entry':'Add Entry'}</button>
          </div>
        </form>
        <div className='xl:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>Recent Logs ({filtered.length})</h2>
          {filtered.length===0 ? <div className='text-sm text-gray-500'>No logs.</div> : (
            <div className='space-y-3 max-h-[70vh] overflow-y-auto pr-2'>
              {filtered.slice().sort((a,b)=> new Date(b.date) - new Date(a.date)).map(u => (
                <div key={u.id} className='p-3 rounded-xl border bg-gray-50 hover:bg-white transition flex flex-col gap-1'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium text-gray-800 text-sm'>{new Date(u.date).toLocaleDateString()}</span>
                    <span className='text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700'>{u.weather||'N/A'}</span>
                  </div>
                  <div className='flex flex-wrap gap-4 text-[11px] text-gray-500'>
                    <span>Progress {u.progress}%</span>
                    <span>Labor {u.laborCount}</span>
                    {u.incidents>0 && <span className='text-red-600 font-medium'>{u.incidents} incident(s)</span>}
                  </div>
                  {u.notes && <p className='text-[11px] text-gray-600'>{u.notes}</p>}
                  <div className='flex gap-2 justify-end pt-1'>
                    <button onClick={()=>edit(u)} className='text-[11px] px-2 py-1 rounded bg-gray-200 text-gray-700'>Edit</button>
                    <button onClick={()=>remove(u.id)} className='text-[11px] px-2 py-1 rounded bg-red-600 text-white'>Del</button>
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
