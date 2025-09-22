import React from "react";

function ClientProjects() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-[#0B3954]">My Projects</h1>
      <p className="text-gray-600 mt-2">View the list of your projects and their current status.</p>

      <div className="mt-6 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <p className="text-gray-500">No projects to display yet.</p>
      </div>
    </div>
  );
}

export default ClientProjects;
