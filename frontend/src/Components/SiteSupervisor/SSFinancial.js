import React from 'react';

export default function SSFinancial(){
  return (
    <div className="px-6 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Site Supervisor Financial</h1>
      <p className="text-gray-600 mb-6">(Placeholder) Financial summaries for supervisor scope. Integrate limited budget tracking or expense requests.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["Active Budgets","Pending Costs","Approved Requests"].map(title => (
          <div key={title} className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</div>
            <div className="mt-3 h-6 w-24 bg-gray-200 rounded" />
            <div className="mt-4 h-2 w-full bg-gray-100 rounded" />
            <div className="mt-2 h-2 w-5/6 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
