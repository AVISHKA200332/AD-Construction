import React from 'react';

export default function SSReports(){
  return (
    <div className="px-6 py-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Site Supervisor Reports</h1>
      <p className="text-gray-600 mb-6">(Placeholder) Generate or view operational & safety reports.</p>
      <div className="p-6 bg-white rounded-2xl shadow border border-gray-100">
        <ul className="space-y-3 text-sm text-gray-600">
          <li>• Daily activity summaries</li>
          <li>• Safety incident rollups</li>
          <li>• Material request status list</li>
          <li>• Labor utilization snapshots</li>
        </ul>
      </div>
    </div>
  );
}
