import React from "react";
import searchIcon from "../../assets/icons/search.png";
import filterIcon from "../../assets/icons/filter.png";
import fileTextIcon from "../../assets/icons/file-text.png";
import plusIcon from "../../assets/icons/plus.jpg";

export default function ProjectManagement({ projects = [] }) {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Project Management</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm">
            <img src={fileTextIcon} alt="Report" className="w-4 h-4" /> Generate Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
            <img src={plusIcon} alt="Add" className="w-4 h-4" /> Add Project
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-1/3">
            <img
              src={searchIcon}
              alt="Search"
              className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm">
            <img src={filterIcon} alt="Filter" className="w-4 h-4" /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3">Project Name</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">End Date</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Completion</th>
              </tr>
            </thead>
            <tbody>
              {projects.length > 0 ? (
                projects.map((p, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3">{p.client}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${p.statusColor}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{p.start}</td>
                    <td className="px-4 py-3">{p.end}</td>
                    <td className="px-4 py-3">{p.budget}</td>
                    <td className="px-4 py-3 w-48">
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${p.completion}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{p.completion}%</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">
                    No projects available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
