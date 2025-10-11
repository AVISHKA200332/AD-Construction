import React, { useState, useEffect } from "react";
import { 
  validateProject, 
  validateSpecialCharacters, 
  validateBankAccount, 
  validatePhoneNumber, 
  validateEmail,
  validateAge,
  formatCurrency,
  sanitizeInput
} from "../../utils/validation";

function AddProjectModal({ showModal, setShowModal, newProject, handleChange, handleAddProject, isEditing, loading }) {
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});
  const [budgetFormatted, setBudgetFormatted] = useState('');

  // Reset errors when modal opens/closes
  useEffect(() => {
    if (showModal) {
      setErrors({});
      setWarnings({});
    }
  }, [showModal]);

  // Format budget display
  useEffect(() => {
    if (newProject.budget) {
      const budgetValidation = validateProject({ ...newProject, budget: newProject.budget });
      if (budgetValidation.budgetFormatted) {
        setBudgetFormatted(budgetValidation.budgetFormatted);
      }
    }
  }, [newProject.budget]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue = value;

    // Apply special character restrictions
    if (type === 'text' && name !== 'clientContact.bankAccount') {
      processedValue = sanitizeInput(value);
    }

    // Bank account - numbers only
    if (name === 'clientContact.bankAccount') {
      processedValue = value.replace(/[^\d]/g, '');
    }

    // Phone number - only allow digits, spaces, hyphens, plus signs, and parentheses
    if (name === 'clientContact.phone') {
      processedValue = value.replace(/[^\d\s\-\+\(\)]/g, '');
    }

    // Age - only allow numbers
    if (name === 'projectManager.age') {
      processedValue = value.replace(/[^\d]/g, '');
    }

    // Experience - only allow numbers
    if (name === 'projectManager.experience') {
      processedValue = value.replace(/[^\d]/g, '');
    }

    // Budget - allow numbers and commas for formatting
    if (name === 'budget') {
      processedValue = value.replace(/[^\d,]/g, '');
    }

    // Completion - only allow numbers 0-100
    if (name === 'completion') {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
        processedValue = value;
      } else if (value === '') {
        processedValue = '';
      } else {
        return; // Don't update if invalid
      }
    }

    // Set minimum date to today for start date
    if (name === 'startDate') {
      const today = new Date().toISOString().split('T')[0];
      if (value < today) {
        setErrors(prev => ({ ...prev, startDate: 'Start date must be from today onwards' }));
        return;
      }
    }

    // Clear related errors when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    handleChange({ target: { name, value: processedValue } });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate the project (default a client string since field is removed)
    const toValidate = {
      ...newProject,
      client: newProject.client && String(newProject.client).trim().length > 0 ? newProject.client : 'Unassigned Client',
    };
    const validation = validateProject(toValidate);
    
    if (!validation.isValid) {
      const errorObj = {};
      // Ignore client name validation since we no longer collect it in this form
      const filtered = validation.errors.filter(err => !String(err).includes('Client name'));
      filtered.forEach(error => {
        // Map validation errors to field names
        if (error.includes('Project name')) errorObj.name = error;
        else if (error.includes('Budget')) errorObj.budget = error;
        else if (error.includes('Start date')) errorObj.startDate = error;
        else if (error.includes('End date')) errorObj.endDate = error;
        else if (error.includes('Completion')) errorObj.completion = error;
        else if (error.includes('Phone number')) errorObj['clientContact.phone'] = error;
        else if (error.includes('email')) errorObj['clientContact.email'] = error;
        else if (error.includes('Bank account')) errorObj['clientContact.bankAccount'] = error;
        else if (error.includes('Project manager')) errorObj['projectManager.name'] = error;
        else if (error.includes('Address')) errorObj['location.address'] = error;
        else if (error.includes('City')) errorObj['location.city'] = error;
        else if (error.includes('Description')) errorObj.description = error;
        else errorObj.general = error;
      });
      if (Object.keys(errorObj).length > 0) {
        setErrors(errorObj);
        return;
      }
      // If only client error existed, allow submit
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
                  value={newProject.name || ''}
                  onChange={handleInputChange}
                  placeholder="Enter project name"
                  className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Client Name removed: linking Client users happens elsewhere */}
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  name="status"
                  value={newProject.status || 'Planning'}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 transition"
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
                  value={newProject.priority || 'Medium'}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Completion (%) *
                </label>
                <input
                  type="number"
                  name="completion"
                  value={newProject.completion || ''}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  placeholder="0-100"
                  className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    errors.completion ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.completion && <p className="text-red-500 text-xs mt-1">{errors.completion}</p>}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={newProject.startDate || ''}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={newProject.endDate || ''}
                  onChange={handleInputChange}
                  min={newProject.startDate || new Date().toISOString().split('T')[0]}
                  className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget (Rs) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="budget"
                  value={newProject.budget || ''}
                  onChange={handleInputChange}
                  placeholder="Enter budget (e.g., 100,000)"
                  className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    errors.budget ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {budgetFormatted && (
                  <div className="absolute right-3 top-2 text-sm text-gray-500">
                    {budgetFormatted}
                  </div>
                )}
              </div>
              {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Budget must be between Rs. 100,000 and Rs. 1,000,000,000
              </p>
            </div>

            {/* Client Contact Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Client Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="clientContact.phone"
                    value={newProject.clientContact?.phone || ''}
                    onChange={handleInputChange}
                    placeholder="+94 77 123 4567"
                    className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors['clientContact.phone'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors['clientContact.phone'] && <p className="text-red-500 text-xs mt-1">{errors['clientContact.phone']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="clientContact.email"
                    value={newProject.clientContact?.email || ''}
                    onChange={handleInputChange}
                    placeholder="client@example.com"
                    className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors['clientContact.email'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors['clientContact.email'] && <p className="text-red-500 text-xs mt-1">{errors['clientContact.email']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Account
                  </label>
                  <input
                    type="text"
                    name="clientContact.bankAccount"
                    value={newProject.clientContact?.bankAccount || ''}
                    onChange={handleInputChange}
                    placeholder="1234567890"
                    className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors['clientContact.bankAccount'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors['clientContact.bankAccount'] && <p className="text-red-500 text-xs mt-1">{errors['clientContact.bankAccount']}</p>}
                </div>
              </div>
            </div>

            {/* Project Manager Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Manager Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manager Name
                  </label>
                  <input
                    type="text"
                    name="projectManager.name"
                    value={newProject.projectManager?.name || ''}
                    onChange={handleInputChange}
                    placeholder="Enter manager name"
                    className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors['projectManager.name'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors['projectManager.name'] && <p className="text-red-500 text-xs mt-1">{errors['projectManager.name']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    name="projectManager.age"
                    value={newProject.projectManager?.age || ''}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="25"
                    className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors['projectManager.age'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors['projectManager.age'] && <p className="text-red-500 text-xs mt-1">{errors['projectManager.age']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="projectManager.experience"
                    value={newProject.projectManager?.experience || ''}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="5"
                    className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors['projectManager.experience'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors['projectManager.experience'] && <p className="text-red-500 text-xs mt-1">{errors['projectManager.experience']}</p>}
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="location.address"
                    value={newProject.location?.address || ''}
                    onChange={handleInputChange}
                    placeholder="Enter project address"
                    className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors['location.address'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors['location.address'] && <p className="text-red-500 text-xs mt-1">{errors['location.address']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="location.city"
                    value={newProject.location?.city || ''}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors['location.city'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors['location.city'] && <p className="text-red-500 text-xs mt-1">{errors['location.city']}</p>}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Description
              </label>
              <textarea
                name="description"
                value={newProject.description || ''}
                onChange={handleInputChange}
                placeholder="Enter project description (max 1000 characters)"
                rows="3"
                maxLength="1000"
                className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              <p className="text-xs text-gray-500 mt-1">
                {(newProject.description || '').length}/1000 characters
              </p>
            </div>

            {/* General Errors */}
            {errors.general && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {errors.general}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition flex items-center gap-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isEditing ? "Save Changes" : "Add Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProjectModal;
