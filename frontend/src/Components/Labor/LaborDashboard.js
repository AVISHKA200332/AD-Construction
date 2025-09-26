import React from "react";

function LaborDashboard() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-[#0B3954]">Labor Dashboard</h1>
      <p className="text-gray-600 mt-2">View your assigned tasks, attendance, and safety notices.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Today9;s Tasks</p>
          <p className="text-3xl font-extrabold text-[#0B3954] mt-1">6</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Attendance</p>
          <p className="text-3xl font-extrabold text-[#0B3954] mt-1">Present</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Incidents</p>
          <p className="text-3xl font-extrabold text-[#0B3954] mt-1">0</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Notices</p>
          <p className="text-3xl font-extrabold text-[#0B3954] mt-1">1</p>
        </div>
      </div>
    </div>
  );
}

export default LaborDashboard;
