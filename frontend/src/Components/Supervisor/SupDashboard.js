import React from "react";

function SupDashboard() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-[#0B3954]">Supervisor Dashboard</h1>
      <p className="text-gray-600 mt-2">Monitor team performance, safety checks, and daily logs.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Teams</p>
          <p className="text-3xl font-extrabold text-[#0B3954] mt-1">4</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Daily Logs</p>
          <p className="text-3xl font-extrabold text-[#0B3954] mt-1">12</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Incidents</p>
          <p className="text-3xl font-extrabold text-[#0B3954] mt-1">0</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Tasks</p>
          <p className="text-3xl font-extrabold text-[#0B3954] mt-1">34</p>
        </div>
      </div>
    </div>
  );
}

export default SupDashboard;
