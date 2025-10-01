import React from 'react';

export default function SSSettings(){
  return (
    <div className="px-6 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Site Supervisor Settings</h1>
      <p className="text-gray-600 mb-6">(Placeholder) Profile preferences, notification toggles, and role-specific defaults.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-2xl shadow border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-3">Notifications</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><input type="checkbox" defaultChecked className="mr-2"/> Daily summary email</li>
            <li><input type="checkbox" className="mr-2"/> Critical issue SMS</li>
            <li><input type="checkbox" defaultChecked className="mr-2"/> Material request updates</li>
          </ul>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-3">Defaults</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div>Default site zone: <span className="font-medium text-gray-800">East Yard</span></div>
              <div>Shift pattern: <span className="font-medium text-gray-800">Day Shift</span></div>
              <div>Auto-subscribe to new issues <span className="text-green-600 font-medium">ENABLED</span></div>
            </div>
        </div>
      </div>
    </div>
  );
}
