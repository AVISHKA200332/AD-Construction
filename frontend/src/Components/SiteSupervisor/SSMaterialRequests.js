import React, { useEffect, useState } from 'react';

const empty = { item:'', quantity:1, unit:'pcs', priority:'Medium', neededBy:'', status:'Requested', notes:'' };

export default function SSMaterialRequests(){
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');

  useEffect(()=>{ try { setRequests(JSON.parse(localStorage.getItem('ss_material_requests')||'[]')); } catch {} }, []);
  const persist = (next)=>{ setRequests(next); localStorage.setItem('ss_material_requests', JSON.stringify(next)); };

  const filtered = requests.filter(r => (filterStatus==='All'||r.status===filterStatus) && (filterPriority==='All'||r.priority===filterPriority) && (!search || r.item.toLowerCase().includes(search.toLowerCase())));

  const submit = e => {
    e.preventDefault();
    if(!form.item.trim()) return;
    if(editingId){
      persist(requests.map(r=> r.id===editingId ? { ...r, ...form } : r));
    } else {
      persist([...requests, { ...form, id:crypto.randomUUID(), createdAt:new Date().toISOString() }]);
    }
    setForm(empty); setEditingId(null);
  };
  const edit = (r)=> { setForm({...r}); setEditingId(r.id); };
  const remove = (id)=> { if(window.confirm('Delete request?')) persist(requests.filter(r=>r.id!==id)); };
  const quick = (id,status)=> { persist(requests.map(r=> r.id===id ? { ...r, status } : r)); };

  return (
    <div className='px-6 py-8 bg-gray-50 min-h-screen'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>Material Requests</h1>
          <p className='text-gray-600 text-sm mt-1'>Track procurement needs and approval status.</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search items...' className='px-3 py-2 rounded-lg border bg-white text-sm' />
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className='px-3 py-2 rounded-lg border bg-white text-sm'>
            {['All','Requested','Pending','Approved','Rejected','Delivered','Cancelled'].map(s=> <option key={s}>{s}</option>)}
          </select>
          <select value={filterPriority} onChange={e=>setFilterPriority(e.target.value)} className='px-3 py-2 rounded-lg border bg-white text-sm'>
            {['All','Low','Medium','High','Critical'].map(s=> <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
        <form onSubmit={submit} className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4'>
          <h2 className='text-lg font-semibold text-gray-800'>{editingId? 'Edit Request':'New Request'}</h2>
          <div>
            <label className='block text-sm font-medium text-gray-600'>Item</label>
            <input value={form.item} onChange={e=>setForm(f=>({...f,item:e.target.value}))} className='mt-1 w-full px-3 py-2 border rounded-lg' />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <label className='text-sm'>
              <span className='text-gray-600 font-medium'>Quantity</span>
              <input type='number' min='1' value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:Number(e.target.value)}))} className='mt-1 w-full px-3 py-2 border rounded-lg' />
            </label>
            <label className='text-sm'>
              <span className='text-gray-600 font-medium'>Unit</span>
              <input value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} className='mt-1 w-full px-3 py-2 border rounded-lg' />
            </label>
            <label className='text-sm'>
              <span className='text-gray-600 font-medium'>Priority</span>
              <select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))} className='mt-1 w-full px-3 py-2 border rounded-lg'>
                {['Low','Medium','High','Critical'].map(p=> <option key={p}>{p}</option>)}
              </select>
            </label>
            <label className='text-sm'>
              <span className='text-gray-600 font-medium'>Needed By</span>
              <input type='date' value={form.neededBy} onChange={e=>setForm(f=>({...f,neededBy:e.target.value}))} className='mt-1 w-full px-3 py-2 border rounded-lg' />
            </label>
            <label className='text-sm col-span-2'>
              <span className='text-gray-600 font-medium'>Status</span>
              <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} className='mt-1 w-full px-3 py-2 border rounded-lg'>
                {['Requested','Pending','Approved','Rejected','Delivered','Cancelled'].map(s=> <option key={s}>{s}</option>)}
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
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>Requests ({filtered.length})</h2>
          {filtered.length===0 ? <div className='text-sm text-gray-500'>No requests.</div> : (
            <div className='space-y-3 max-h-[70vh] overflow-y-auto pr-2'>
              {filtered.slice().sort((a,b)=> a.status.localeCompare(b.status)).map(r => (
                <div key={r.id} className='p-3 rounded-xl border bg-gray-50 hover:bg-white transition flex flex-col gap-1'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium text-gray-800 text-sm line-clamp-1'>{r.item}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${r.status==='Approved'?'bg-green-100 text-green-700':r.status==='Rejected'?'bg-red-100 text-red-700':r.status==='Delivered'?'bg-blue-100 text-blue-700':r.status==='Cancelled'?'bg-gray-200 text-gray-700':'bg-amber-100 text-amber-700'}`}>{r.status}</span>
                  </div>
                  <div className='flex flex-wrap gap-4 text-[11px] text-gray-500'>
                    <span>Qty {r.quantity} {r.unit}</span>
                    {r.neededBy && <span>Need {r.neededBy}</span>}
                    <span>Priority {r.priority}</span>
                  </div>
                  {r.notes && <p className='text-[11px] text-gray-600 line-clamp-2'>{r.notes}</p>}
                  <div className='flex flex-wrap gap-2 justify-end pt-1'>
                    {r.status!=='Approved' && r.status!=='Rejected' && r.status!=='Delivered' && <button onClick={()=>quick(r.id,'Approved')} className='text-[11px] px-2 py-1 rounded bg-green-600 text-white'>Approve</button>}
                    {r.status!=='Rejected' && r.status!=='Delivered' && <button onClick={()=>quick(r.id,'Rejected')} className='text-[11px] px-2 py-1 rounded bg-red-600 text-white'>Reject</button>}
                    {r.status==='Approved' && <button onClick={()=>quick(r.id,'Delivered')} className='text-[11px] px-2 py-1 rounded bg-blue-600 text-white'>Deliver</button>}
                    <button onClick={()=>edit(r)} className='text-[11px] px-2 py-1 rounded bg-gray-200 text-gray-700'>Edit</button>
                    <button onClick={()=>remove(r.id)} className='text-[11px] px-2 py-1 rounded bg-red-600 text-white'>Del</button>
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
