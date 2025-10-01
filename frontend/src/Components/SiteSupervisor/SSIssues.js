import React, { useEffect, useState } from 'react';

const emptyIssue = { title:'', description:'', category:'General', severity:'Medium', status:'Open' };

export default function SSIssues(){
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyIssue);
  const [editingId, setEditingId] = useState(null);

  useEffect(()=>{
    try { setIssues(JSON.parse(localStorage.getItem('ss_issues')||'[]')); } catch {}
  }, []);
  const persist = (next) => { setIssues(next); localStorage.setItem('ss_issues', JSON.stringify(next)); };

  const filtered = issues.filter(i => (filterStatus==='All'||i.status===filterStatus) && (filterSeverity==='All'||i.severity===filterSeverity) && (!search || i.title.toLowerCase().includes(search.toLowerCase())));

  const openNew = () => { setForm(emptyIssue); setEditingId(null); setModalOpen(true); };
  const openEdit = (issue) => { setForm({...issue}); setEditingId(issue.id); setModalOpen(true); };

  const saveIssue = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editingId){
      const next = issues.map(i => i.id===editingId ? {...i, ...form, updatedAt:new Date().toISOString()} : i);
      persist(next);
    } else {
      const next = [...issues, { ...form, id:crypto.randomUUID(), createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() }];
      persist(next);
    }
    setModalOpen(false);
  };

  const quickStatus = (id, status) => {
    persist(issues.map(i=> i.id===id ? { ...i, status, updatedAt:new Date().toISOString() } : i));
  };
  const removeIssue = (id) => { if(window.confirm('Delete issue?')) persist(issues.filter(i=>i.id!==id)); };

  return (
    <div className='px-6 py-8 bg-gray-50 min-h-screen'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>Issue Tracking</h1>
          <p className='text-gray-600 text-sm mt-1'>Log and monitor site issues, safety events, and blockers.</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search issues...' className='px-3 py-2 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3954]' />
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className='px-3 py-2 rounded-lg border bg-white text-sm'>
            {['All','Open','In Progress','Closed'].map(s=> <option key={s}>{s}</option>)}
          </select>
          <select value={filterSeverity} onChange={e=>setFilterSeverity(e.target.value)} className='px-3 py-2 rounded-lg border bg-white text-sm'>
            {['All','Low','Medium','High','Critical'].map(s=> <option key={s}>{s}</option>)}
          </select>
          <button onClick={openNew} className='px-4 py-2 rounded-lg bg-[#0B3954] text-white text-sm font-semibold hover:bg-[#092c40]'>+ New</button>
        </div>
      </div>

      <div className='bg-white rounded-2xl shadow-lg border border-gray-100 divide-y'>
        <div className='px-6 py-3 flex text-xs font-semibold text-gray-500 uppercase tracking-wide'>
          <div className='w-4/12'>Title</div>
          <div className='w-2/12'>Severity</div>
            <div className='w-2/12'>Status</div>
          <div className='w-2/12'>Category</div>
          <div className='w-2/12 text-right'>Actions</div>
        </div>
        {filtered.length===0 ? <div className='p-6 text-sm text-gray-500'>No issues match filters.</div> : filtered.map(issue => (
          <div key={issue.id} className='px-6 py-4 flex items-center text-sm hover:bg-gray-50 transition'>
            <div className='w-4/12 pr-4'>
              <div className='font-medium text-gray-800 line-clamp-1'>{issue.title}</div>
              {issue.description && <div className='text-[11px] text-gray-500 line-clamp-1'>{issue.description}</div>}
            </div>
            <div className='w-2/12'>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${issue.severity==='Critical'?'bg-red-100 text-red-700':issue.severity==='High'?'bg-rose-100 text-rose-700':issue.severity==='Medium'?'bg-amber-100 text-amber-700':issue.severity==='Low'?'bg-blue-100 text-blue-700':'bg-gray-200 text-gray-600'}`}>{issue.severity}</span>
            </div>
            <div className='w-2/12'>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${issue.status==='Closed'?'bg-green-100 text-green-700':issue.status==='In Progress'?'bg-blue-100 text-blue-700':'bg-amber-100 text-amber-700'}`}>{issue.status}</span>
            </div>
            <div className='w-2/12 text-[11px] text-gray-600'>{issue.category||'General'}</div>
            <div className='w-2/12 flex justify-end gap-2'>
              {issue.status!=='Closed' && <button onClick={()=>quickStatus(issue.id,'In Progress')} className='text-[11px] px-2 py-1 rounded bg-blue-600 text-white'>Progress</button>}
              {issue.status!=='Closed' && <button onClick={()=>quickStatus(issue.id,'Closed')} className='text-[11px] px-2 py-1 rounded bg-green-600 text-white'>Close</button>}
              <button onClick={()=>openEdit(issue)} className='text-[11px] px-2 py-1 rounded bg-gray-200 text-gray-700'>Edit</button>
              <button onClick={()=>removeIssue(issue.id)} className='text-[11px] px-2 py-1 rounded bg-red-600 text-white'>Del</button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='bg-white w-full max-w-xl rounded-2xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto'>
            <div className='p-5 border-b flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-800'>{editingId? 'Edit Issue':'New Issue'}</h2>
              <button onClick={()=>setModalOpen(false)} className='text-gray-500 hover:text-gray-700'>✕</button>
            </div>
            <form onSubmit={saveIssue} className='p-6 space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-600'>Title</label>
                <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} className='mt-1 w-full px-3 py-2 border rounded-lg' />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-600'>Description</label>
                <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3} className='mt-1 w-full px-3 py-2 border rounded-lg resize-y' />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-600'>Category</label>
                  <input value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className='mt-1 w-full px-3 py-2 border rounded-lg' />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-600'>Severity</label>
                  <select value={form.severity} onChange={e=>setForm(f=>({...f,severity:e.target.value}))} className='mt-1 w-full px-3 py-2 border rounded-lg'>
                    {['Low','Medium','High','Critical'].map(s=> <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-600'>Status</label>
                  <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} className='mt-1 w-full px-3 py-2 border rounded-lg'>
                    {['Open','In Progress','Closed'].map(s=> <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className='flex justify-end gap-3 pt-2'>
                <button type='button' onClick={()=>setModalOpen(false)} className='px-4 py-2 border rounded-lg'>Cancel</button>
                <button type='submit' className='px-4 py-2 bg-[#0B3954] text-white rounded-lg'>{editingId? 'Update':'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
