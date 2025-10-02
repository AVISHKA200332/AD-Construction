import React from 'react';
import { Link } from 'react-router-dom';

export default function PMDashboard() {
  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Project Manager Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          { title: 'Manage Projects', desc: 'Create, update, and monitor projects', to: '/pm/projects' },
          { title: 'Assign Supervisors', desc: 'Assign site supervisors to active projects', to: '/pm/assign' },
          { title: 'Progress Tracking', desc: 'Log milestones and update completion', to: '/pm/progress' },
          { title: 'Reports', desc: 'Generate project performance reports', to: '/pm/reports' },
          { title: 'Team Communication', desc: 'Message supervisors and clients', to: '/messages' },
          { title: 'Documents', desc: 'Upload and manage project documents', to: '/pm/documents' }
        ].map(card => (
          <Link key={card.title} to={card.to} className="block bg-white rounded-xl shadow hover:shadow-md transition p-5 border border-gray-100">
            <h2 className="text-xl font-semibold text-[#0B3954] mb-2">{card.title}</h2>
            <p className="text-sm text-gray-600">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
