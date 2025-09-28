import React, { useEffect, useState, useCallback } from "react";
import searchIcon from "../../assets/icons/search.png";
import filterIcon from "../../assets/icons/filter.png";
import fileTextIcon from "../../assets/icons/file-text.png";
import plusIcon from "../../assets/icons/plus.png";
import AddProjectModal from "./AddProjectModel";
import projectService from "../../services/projectService";
import { downloadProjectReport } from "../../services/pdfService";
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getPriorityColor,
} from "../../utils/validation";

function Project({ initialProjects = [] }) {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [projectStats, setProjectStats] = useState(null);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [originalStartDate, setOriginalStartDate] = useState(null);

  const [projects, setProjects] = useState(initialProjects);

  // Memoized function to fetch projects from API with enhanced filtering
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
        sortBy,
        sortOrder,
      });

      const data = await projectService.getAllProjects(params);
      setProjects(data.projects);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError("Failed to fetch projects. Please try again.");
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, priorityFilter, sortBy, sortOrder]);

  // Fetch project statistics
  const fetchProjectStats = async () => {
    try {
      const data = await projectService.getProjectStats();
      setProjectStats(data);
    } catch (err) {
      console.error("Error fetching project stats:", err);
    }
  };

  // Fetch audit logs for a project
  const fetchAuditLogs = async (projectId) => {
    try {
      const data = await projectService.getProjectAuditLogs(projectId);
      setAuditLogs(data.auditLogs);
      setShowAuditLogs(true);
    } catch (err) {
      setError("Failed to fetch audit logs. Please try again.");
      console.error("Error fetching audit logs:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchProjectStats();
  }, [fetchProjects]);

  const [newProject, setNewProject] = useState({
    name: "",
    client: "",
    status: "Planning",
    priority: "Medium",
    startDate: "",
    endDate: "",
    budget: "",
    completion: 0,
    clientContact: {
      phone: "",
      email: "",
      bankAccount: "",
    },
    projectManager: {
      name: "",
      age: "",
      experience: "",
    },
    location: {
      address: "",
      city: "",
    },
    description: "",
  });

  // Handle input change with nested object support
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setNewProject((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]: value,
        },
      }));
    } else {
      setNewProject({ ...newProject, [name]: value });
    }
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
        status: "Planning",
        priority: "Medium",
        startDate: "",
        endDate: "",
        budget: "",
        completion: 0,
        clientContact: { phone: "", email: "", bankAccount: "" },
        projectManager: { name: "", age: "", experience: "" },
        location: { address: "", city: "" },
        description: "",
      });
      setShowModal(false);
    } catch (err) {
      console.error("Error saving project:", err);

      // Extract specific error message from response
      let errorMessage = isEditing
        ? "Failed to update project. Please try again."
        : "Failed to create project. Please try again.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        errorMessage = err.response.data.errors.join(", ");
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
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
      setError("Failed to delete project. Please try again.");
      console.error("Error deleting project:", err);
    } finally {
      setLoading(false);
    }
  };

  // Edit project
  const handleEdit = (index) => {
    const projectToEdit = projects[index];
    setNewProject({
      ...projectToEdit,
      startDate: projectToEdit.startDate
        ? projectToEdit.startDate.split("T")[0]
        : "",
      endDate: projectToEdit.endDate ? projectToEdit.endDate.split("T")[0] : "",
      clientContact: projectToEdit.clientContact || {
        phone: "",
        email: "",
        bankAccount: "",
      },
      projectManager: projectToEdit.projectManager || {
        name: "",
        age: "",
        experience: "",
      },
      location: projectToEdit.location || { address: "", city: "" },
      description: projectToEdit.description || "",
    });
    setOriginalStartDate(
      projectToEdit.startDate ? projectToEdit.startDate.split("T")[0] : null
    );
    setIsEditing(true);
    setEditIndex(index);
    setShowModal(true);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    if (filterType === "status") {
      setStatusFilter(value);
    } else if (filterType === "priority") {
      setPriorityFilter(value);
    }
    setCurrentPage(1);
  };

  // Handle sort changes
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Generate PDF report
  const handleGenerateReport = () => {
    if (projects.length === 0) {
      setError("No projects available to generate report.");
      return;
    }

    console.log("Generating report for projects:", projects);

    try {
      const reportGenerated = downloadProjectReport(projects);
      console.log("Report generation result:", reportGenerated);

      if (reportGenerated) {
        setSuccess("Report generated successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("Failed to generate report. Please try again.");
      }
    } catch (err) {
      setError("Failed to generate report. Please try again.");
      console.error("Error generating report:", err);
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
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            AD Construction Project Management
          </h1>
        </div>
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
              setOriginalStartDate(null);
              setNewProject({
                name: "",
                client: "",
                status: "Planning",
                priority: "Medium",
                startDate: "",
                endDate: "",
                budget: "",
                completion: 0,
                clientContact: { phone: "", email: "", bankAccount: "" },
                projectManager: { name: "", age: "", experience: "" },
                location: { address: "", city: "" },
                description: "",
              });
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm"
          >
            <img src={plusIcon} alt="Add" className="w-4 h-4" /> Add Project
          </button>
        </div>
      </div>

      {/* Project Statistics Dashboard */}
      {projectStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">
              Total Projects
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {projectStats.total}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
            <p className="text-2xl font-bold text-blue-600">
              {projectStats.distribution?.find(
                (d) => d.status === "In Progress"
              )?.count || 0}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Completed</h3>
            <p className="text-2xl font-bold text-green-600">
              {projectStats.distribution?.find(
                (d) => d.status === "Completed"
              )?.count || 0}
            </p>
          </div>
        </div>
      )}

      {/* Modal */}
      <AddProjectModal
        showModal={showModal}
        setShowModal={setShowModal}
        newProject={newProject}
        handleChange={handleChange}
        handleAddProject={handleSaveProject}
        isEditing={isEditing}
        loading={loading}
        originalStartDate={originalStartDate}
      />

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <img
              src={searchIcon}
              alt="Search"
              className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => handleFilterChange("priority", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => handleSortChange("createdAt")}
              className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
            >
              <img src={filterIcon} alt="Sort" className="w-4 h-4" />
              Sort: {sortBy === "createdAt" ? "Date" : "Name"}
              {sortBy === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Project ID</th>
                <th className="px-4 py-3 font-semibold">Project Name</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Start Date</th>
                <th className="px-4 py-3 font-semibold">End Date</th>
                <th className="px-4 py-3 font-semibold">Budget</th>
                <th className="px-4 py-3 font-semibold">Completion</th>
                <th className="px-4 py-3 font-semibold">Manager</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" className="text-center py-6 text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Loading projects...</span>
                    </div>
                  </td>
                </tr>
              ) : projects.length > 0 ? (
                projects.map((p, idx) => (
                  <tr
                    key={p._id || idx}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {p.projectId || p._id?.slice(-8)}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {p.name}
                        </div>
                        {p.description && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {p.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{p.client}</div>
                        {p.clientContact?.phone && (
                          <div className="text-xs text-gray-500">
                            {p.clientContact.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          p.status
                        )}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                          p.priority
                        )}`}
                      >
                        {p.priority || "Medium"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(p.startDate)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(p.endDate)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(p.budget)}
                    </td>
                    <td className="px-4 py-3 w-48">
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div
                          className={`h-2 rounded-full ${
                            p.completion >= 100
                              ? "bg-green-500"
                              : p.completion >= 75
                              ? "bg-blue-500"
                              : p.completion >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${p.completion}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {p.completion}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.projectManager?.name ? (
                        <div>
                          <div className="font-medium text-sm">
                            {p.projectManager.name}
                          </div>
                          {p.projectManager.experience && (
                            <div className="text-xs text-gray-500">
                              {p.projectManager.experience} years exp
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">
                          Not assigned
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(idx)}
                          disabled={loading}
                          className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded transition-colors"
                          title="Edit Project"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => fetchAuditLogs(p._id)}
                          disabled={loading}
                          className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded transition-colors"
                          title="View Audit Logs"
                        >
                          Logs
                        </button>
                        <button
                          onClick={() => handleDelete(idx)}
                          disabled={loading}
                          className="px-2 py-1 text-xs border border-red-300 text-red-700 rounded hover:bg-red-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
                          title="Delete Project"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="11"
                    className="text-center py-6 text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <div className="text-4xl mb-2">📋</div>
                      <div>No projects available</div>
                      <div className="text-sm text-gray-400 mt-1">
                        {searchTerm || statusFilter || priorityFilter
                          ? "Try adjusting your filters"
                          : "Create your first project to get started"}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    disabled={loading}
                    className={`px-3 py-1 text-sm border rounded ${
                      currentPage === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Audit Logs Modal */}
      {showAuditLogs && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Audit Logs</h3>
                <button
                  onClick={() => setShowAuditLogs(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <div className="space-y-2">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg p-3 bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">
                            {log.action} - {log.field}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {log.oldValue && <span>From: {log.oldValue}</span>}
                            {log.oldValue && log.newValue && (
                              <span> → </span>
                            )}
                            {log.newValue && <span>To: {log.newValue}</span>}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No audit logs available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Project;