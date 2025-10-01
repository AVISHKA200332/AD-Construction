import React from 'react';

export default function SSInventory(){
  return (
    <div className="px-6 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Site Supervisor Inventory</h1>
      <p className="text-gray-600 mb-6">(Placeholder) Track on-site consumables and equipment status.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {['Concrete','Rebar','Timber','PPE Sets','Tools'].map(item => (
          <div key={item} className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm flex flex-col gap-2">
            <div className="font-semibold text-gray-800">{item}</div>
            <div className="h-2 w-full bg-gray-200 rounded overflow-hidden">
              <div className="h-full bg-[#0B3954]" style={{width: Math.round(Math.random()*70+20)+'%'}} />
            </div>
            <div className="text-[11px] text-gray-500">Level indicator (placeholder)</div>
          </div>
        ))}
      </div>
    </div>
  );
}
