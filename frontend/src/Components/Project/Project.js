import React, { useEffect, useState } from "react";
import searchIcon from "../../assets/icons/search.png";
import filterIcon from "../../assets/icons/filter.png";
import fileTextIcon from "../../assets/icons/file-text.png";
import plusIcon from "../../assets/icons/plus.png";
import AddProjectModal from "./AddProjectModel";
import projectService from "../../services/projectService";
import { downloadProjectReport } from "../../services/pdfService";

function Project({ initialProjects = [] }) {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [projects, setProjects] = useState(initialProjects);

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getAllProjects();
      setProjects(data.projects);
    } catch (err) {
      setError('Failed to fetch projects. Please try again.');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
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
  const handleSaveProject = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isEditing && editIndex !== null) {
        // Update existing project
        const projectToUpdate = projects[editIndex];
        await projectService.updateProject(projectToUpdate._id, newProject);
        await fetchProjects(); // Refresh the list
        setIsEditing(false);
        setEditIndex(null);
      } else {
        // Create new project
        await projectService.createProject(newProject);
        await fetchProjects(); // Refresh the list
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
    } catch (err) {
      setError(isEditing ? 'Failed to update project. Please try again.' : 'Failed to create project. Please try again.');
      console.error('Error saving project:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete project
  const handleDelete = async (index) => {
    try {
      setLoading(true);
      setError(null);
      const projectToDelete = projects[index];
      await projectService.deleteProject(projectToDelete._id);
      await fetchProjects(); // Refresh the list
    } catch (err) {
      setError('Failed to delete project. Please try again.');
      console.error('Error deleting project:', err);
    } finally {
      setLoading(false);
    }
  };

  // Edit project
  const handleEdit = (index) => {
    const projectToEdit = projects[index];
    setNewProject({
      ...projectToEdit,
      startDate: projectToEdit.startDate ? projectToEdit.startDate.split('T')[0] : '',
      endDate: projectToEdit.endDate ? projectToEdit.endDate.split('T')[0] : '',
    });
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

  // Generate PDF report
  const handleGenerateReport = () => {
    if (projects.length === 0) {
      setError('No projects available to generate report.');
      return;
    }

    console.log('Generating report for projects:', projects);
    
    try {
      const reportGenerated = downloadProjectReport(projects);
      console.log('Report generation result:', reportGenerated);
      
      if (reportGenerated) {
        setSuccess('Report generated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to generate report. Please try again.');
      }
    } catch (err) {
      setError('Failed to generate report. Please try again.');
      console.error('Error generating report:', err);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
          <button 
            onClick={() => setSuccess(null)}
            className="ml-2 text-green-500 hover:text-green-700 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Project Management</h1>
        <div className="flex gap-2">
          <button 
            onClick={handleGenerateReport}
            disabled={loading || projects.length === 0}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
          >
            <img src={fileTextIcon} alt="Report" className="w-4 h-4" /> 
            Generate Report
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
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm"
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
        loading={loading}
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
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading projects...</span>
                  </div>
                </td>
              </tr>
            ) : projects.length > 0 ? (
              projects.map((p, idx) => (
                <tr key={p._id || idx} className="border-b last:border-0">
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
                      disabled={loading}
                      className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(idx)}
                      disabled={loading}
                      className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400"
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
