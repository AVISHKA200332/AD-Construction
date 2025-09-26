import React from "react";

function SMDashboard() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-[#0B3954]">Site Manager Dashboard</h1>
      <p className="text-gray-600 mt-2">Overview of assigned sites, tasks, and issues.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active Sites</p>
          <p className="text-3xl font-extrabold text-[#0B3954] mt-1">2</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Open Issues</p>
          <p className="text-3xl font-extrabold text-[#0B3954] mt-1">5</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Inspections</p>
          <p className="text-3xl font-extrabold text-[#0B3954] mt-1">3</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Materials</p>
          <p className="text-3xl font-extrabold text-[#0B3954] mt-1">12</p>
        </div>
      </div>
    </div>
  );
}

export default SMDashboard;
