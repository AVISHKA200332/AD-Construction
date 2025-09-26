import React from "react";

function ClientDashboard() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-[#0B3954]">Client Dashboard</h1>
      <p className="text-gray-600 mt-2">Welcome to your project overview. Track progress, budgets, and timelines.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active Projects</p>
          <p className="text-3xl font-extrabold text-[#0B3954] mt-1">3</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Budget</p>
          <p className="text-3xl font-extrabold text-[#0B3954] mt-1">Rs. 25M</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Avg. Completion</p>
          <p className="text-3xl font-extrabold text-[#0B3954] mt-1">62%</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Alerts</p>
          <p className="text-3xl font-extrabold text-[#0B3954] mt-1">2</p>
        </div>
      </div>
    </div>
  );
}

export default ClientDashboard;
