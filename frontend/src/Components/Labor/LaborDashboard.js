import React from "react";

function LaborDashboard() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-[#0B3954]">Labor Dashboard</h1>
      <p className="text-gray-600 mt-2">
        Overview of your current assignments, attendance, and performance.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active Tasks</p>
          <p className="text-3xl font-extrabold text-[#0B3954] mt-1">0</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Hours Logged</p>
          <p className="text-3xl font-extrabold text-[#0B3954] mt-1">0</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Upcoming Shifts</p>
          <p className="text-3xl font-extrabold text-[#0B3954] mt-1">0</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Notifications</p>
          <p className="text-3xl font-extrabold text-[#0B3954] mt-1">0</p>
        </div>
      </div>
    </div>
  );
}

export default LaborDashboard;
