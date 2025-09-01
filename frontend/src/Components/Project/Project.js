import React, { useEffect, useState } from "react";
import searchIcon from "../../assets/icons/search.png";
import filterIcon from "../../assets/icons/filter.png";
import fileTextIcon from "../../assets/icons/file-text.png";
import plusIcon from "../../assets/icons/plus.png";
import AddProjectModal from "./AddProjectModel";
import axios from "axios";

const URL = "http://localhost:5000/projects";

// fetch projects
const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function Project({ initialProjects = [] }) {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [projects, setProjects] = useState(initialProjects);

  useEffect(() => {
    fetchHandler().then((data) => setProjects(data.projects));
  }, []);

  const [newProject, setNewProject] = useState({
    name: "",
    client: "",
    status: "In Progress",
    startDate: "",
    endDate: "",
    budget: "",
    completion: 0,
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  // Add or Edit project
  const handleSaveProject = () => {
    if (isEditing && editIndex !== null) {
      const updatedProjects = [...projects];
      updatedProjects[editIndex] = newProject;
      setProjects(updatedProjects);
      setIsEditing(false);
      setEditIndex(null);
    } else {
      setProjects([...projects, newProject]);
    }

    setNewProject({
      name: "",
      client: "",
      status: "In Progress",
      startDate: "",
      endDate: "",
      budget: "",
      completion: 0,
    });
    setShowModal(false);
  };

  // Delete project
  const handleDelete = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Edit project
  const handleEdit = (index) => {
    setNewProject(projects[index]);
    setIsEditing(true);
    setEditIndex(index);
    setShowModal(true);
  };

  // Format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Project Management</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm">
            <img src={fileTextIcon} alt="Report" className="w-4 h-4" /> Generate Report
          </button>
          <button
            onClick={() => {
              setShowModal(true);
              setIsEditing(false);
              setNewProject({
                name: "",
                client: "",
                status: "In Progress",
                startDate: "",
                endDate: "",
                budget: "",
                completion: 0,
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
          >
            <img src={plusIcon} alt="Add" className="w-4 h-4" /> Add Project
          </button>
        </div>
      </div>

      {/* Modal */}
      <AddProjectModal
        showModal={showModal}
        setShowModal={setShowModal}
        newProject={newProject}
        handleChange={handleChange}
        handleAddProject={handleSaveProject}
        isEditing={isEditing}
      />

      {/* Search & Filter */}
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

      {/* Projects Table */}
      <div className="bg-white shadow-sm rounded-lg p-4 mt-4">
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
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.length > 0 ? (
              projects.map((p, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">{p.client}</td>
                  <td className="px-4 py-3">{p.status}</td>
                  <td className="px-4 py-3">{formatDate(p.startDate)}</td>
                  <td className="px-4 py-3">{formatDate(p.endDate)}</td>
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
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(idx)}
                      className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(idx)}
                      className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  No projects available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Project;
