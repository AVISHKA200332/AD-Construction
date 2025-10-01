import React from 'react';

export default function SSCommunication(){
  return (
    <div className="px-6 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Site Supervisor Communication</h1>
      <p className="text-gray-600 mb-6">(Placeholder) Integrate with global messaging component or filtered thread view.</p>
      <div className="p-6 bg-white rounded-2xl shadow border border-gray-100">
        <div className="h-10 bg-gray-100 rounded mb-4" />
        <div className="space-y-3">
          {Array.from({length:5}).map((_,i)=>(<div key={i} className="h-12 bg-gray-50 border border-gray-100 rounded-lg flex items-center px-4 text-gray-400 text-sm">Message thread {i+1}</div>))}
        </div>
      </div>
    </div>
  );
}
