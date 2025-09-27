import React, { useState, useEffect } from "react";
import {
  validateProject,
  sanitizeInput,
} from "../../utils/validation";

function AddProjectModal({
  showModal,
  setShowModal,
  newProject,
  handleChange,
  handleAddProject,
  isEditing,
  loading,
  originalStartDate,
}) {
  const [errors, setErrors] = useState({});
  const todayStr = new Date().toISOString().split("T")[0];

  // Reset errors when modal opens/closes
  useEffect(() => {
    if (showModal) {
      setErrors({});
    }
  }, [showModal]);

  // Format budget display
  useEffect(() => {
    if (newProject.budget) {
      // If you need to format budget, do it here, otherwise remove this effect
    }
  }, [newProject]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue = value;

    // Apply special character restrictions
    if (type === "text" && name !== "clientContact.bankAccount") {
      processedValue = sanitizeInput(value);
    }

    // Bank account - numbers only
    if (name === "clientContact.bankAccount") {
      processedValue = value.replace(/[^\d]/g, "");
    }

    // Phone number - only allow digits, spaces, hyphens, plus signs, and parentheses
    if (name === "clientContact.phone") {
      processedValue = value.replace(/[^\d\s\-+()]/g, "");
    }

    // Age - only allow numbers
    if (name === "projectManager.age") {
      processedValue = value.replace(/[^\d]/g, "");
    }

    // Experience - only allow numbers
    if (name === "projectManager.experience") {
      processedValue = value.replace(/[^\d]/g, "");
    }

    // Budget - allow numbers and commas for formatting
    if (name === "budget") {
      processedValue = value.replace(/[^\d,]/g, "");
    }

    // Completion - only allow numbers 0-100
    if (name === "completion") {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
        processedValue = value;
      } else if (value === "") {
        processedValue = "";
      } else {
        return; // Don't update if invalid
      }
    }

    // Set minimum date for start date (today for create, originalStartDate for edit)
    if (name === "startDate") {
      const today = new Date().toISOString().split("T")[0];
      const minDate = isEditing && originalStartDate ? originalStartDate : today;
      if (value < minDate) {
        setErrors((prev) => ({
          ...prev,
          startDate: isEditing
            ? "Start date cannot be earlier than the original start date"
            : "Start date must be from today onwards",
        }));
        return;
      }
    }

    // Set minimum date to today for end date
    if (name === "endDate") {
      const today = new Date().toISOString().split("T")[0];
      if (value < today) {
        setErrors((prev) => ({
          ...prev,
          endDate: "End date must be from today onwards",
        }));
        return;
      }
    }

    // Clear related errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    handleChange({ target: { name, value: processedValue } });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate the entire project
    const validation = validateProject(newProject, {
      mode: isEditing ? "edit" : "create",
      minStartDate: isEditing && originalStartDate ? originalStartDate : undefined,
    });

    if (!validation.isValid) {
      const errorObj = {};
      validation.errors.forEach((error) => {
        // Map validation errors to field names
        if (error.includes("Project name")) errorObj.name = error;
        else if (error.includes("Client name")) errorObj.client = error;
        else if (error.includes("Budget")) errorObj.budget = error;
        else if (error.includes("Start date")) errorObj.startDate = error;
        else if (error.includes("End date")) errorObj.endDate = error;
        else if (error.includes("Completion")) errorObj.completion = error;
        else if (error.includes("Phone number"))
          errorObj["clientContact.phone"] = error;
        else if (error.includes("email")) errorObj["clientContact.email"] = error;
        else if (error.includes("Bank account"))
          errorObj["clientContact.bankAccount"] = error;
        else if (error.includes("Project manager"))
          errorObj["projectManager.name"] = error;
        else if (error.includes("Address")) errorObj["location.address"] = error;
        else if (error.includes("City")) errorObj["location.city"] = error;
        else if (error.includes("Description")) errorObj.description = error;
        else errorObj.general = error;
      });
      setErrors(errorObj);
      return;
    }

    // Clear errors and submit
    setErrors({});
    handleAddProject();
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slideIn relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold transition z-10"
          onClick={() => setShowModal(false)}
        >
          ×
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
            {isEditing ? "Edit Project" : "Add New Project"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newProject.name || ""}
                  onChange={handleInputChange}
                  placeholder="Enter project name"
                  className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  name="client"
                  value={newProject.client || ""}
                  onChange={handleInputChange}
                  placeholder="Enter client name"
                  className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    errors.client ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.client && (
                  <p className="text-red-500 text-xs mt-1">{errors.client}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={newProject.status || "Planning"}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition border-gray-300"
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={newProject.priority || "Medium"}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition border-gray-300"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={newProject.startDate || ""}
                  onChange={handleInputChange}
                  min={isEditing && originalStartDate ? originalStartDate : todayStr}
                  className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    errors.startDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={newProject.endDate || ""}
                  onChange={handleInputChange}
                  min={todayStr}
                  className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    errors.endDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">
                    $
                  </span>
                  <input
                    type="text"
                    name="budget"
                    value={newProject.budget}
                    onChange={handleInputChange}
                    placeholder="Enter budget"
                    className={`w-full border rounded-lg pl-6 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors.budget ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.budget && (
                  <p className="text-red-500 text-xs mt-1">{errors.budget}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Completion (%) *
                </label>
                <input
                  type="number"
                  name="completion"
                  min="0"
                  max="100"
                  value={newProject.completion}
                  onChange={handleInputChange}
                  placeholder="0-100"
                  className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    errors.completion ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.completion && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.completion}
                  </p>
                )}
              </div>
            </div>

            {/* Client Contact Details */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Client Contact Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="clientContact.phone"
                    value={newProject.clientContact.phone || ""}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors["clientContact.phone"]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors["clientContact.phone"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["clientContact.phone"]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="clientContact.email"
                    value={newProject.clientContact.email || ""}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors["clientContact.email"]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors["clientContact.email"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["clientContact.email"]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Account
                  </label>
                  <input
                    type="text"
                    name="clientContact.bankAccount"
                    value={newProject.clientContact.bankAccount || ""}
                    onChange={handleInputChange}
                    placeholder="Enter bank account"
                    className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors["clientContact.bankAccount"]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors["clientContact.bankAccount"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["clientContact.bankAccount"]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Project Manager Details */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Project Manager Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manager Name
                  </label>
                  <input
                    type="text"
                    name="projectManager.name"
                    value={newProject.projectManager.name || ""}
                    onChange={handleInputChange}
                    placeholder="Enter manager name"
                    className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors["projectManager.name"]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors["projectManager.name"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["projectManager.name"]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    name="projectManager.age"
                    min="18"
                    value={newProject.projectManager.age || ""}
                    onChange={handleInputChange}
                    placeholder="Enter age"
                    className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors["projectManager.age"]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors["projectManager.age"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["projectManager.age"]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="projectManager.experience"
                    min="0"
                    value={newProject.projectManager.experience || ""}
                    onChange={handleInputChange}
                    placeholder="Enter years of experience"
                    className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors["projectManager.experience"]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors["projectManager.experience"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["projectManager.experience"]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Project Location */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Project Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="location.address"
                    value={newProject.location.address || ""}
                    onChange={handleInputChange}
                    placeholder="Enter project address"
                    className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors["location.address"]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors["location.address"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["location.address"]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="location.city"
                    value={newProject.location.city || ""}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors["location.city"]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors["location.city"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["location.city"]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={newProject.description || ""}
                onChange={handleInputChange}
                rows="3"
                placeholder="Describe the project in detail"
                className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
              ></textarea>
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {loading ? "Saving..." : isEditing ? "Save Changes" : "Add Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProjectModal;