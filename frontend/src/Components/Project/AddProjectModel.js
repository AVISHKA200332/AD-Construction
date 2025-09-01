import React from "react";

function AddProjectModal({ showModal, setShowModal, newProject, handleChange, handleAddProject, isEditing }) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-96 p-6 animate-slideIn relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold transition"
          onClick={() => setShowModal(false)}
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          {isEditing ? "Edit Project" : "Add New Project"}
        </h2>

        <form onSubmit={(e) => { e.preventDefault(); handleAddProject(); }} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            value={newProject.name}
            onChange={handleChange}
            required
            placeholder="Project Name"
            className="w-full border rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
          <input
            type="text"
            name="client"
            value={newProject.client}
            onChange={handleChange}
            required
            placeholder="Client"
            className="w-full border rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
          <select
            name="status"
            value={newProject.status}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option>Planning</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>On Hold</option>
          </select>
          <div className="flex gap-3">
            <input
              type="date"
              name="startDate"
              value={newProject.startDate}
              onChange={handleChange}
              className="flex-1 border rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
            <input
              type="date"
              name="endDate"
              value={newProject.endDate}
              onChange={handleChange}
              className="flex-1 border rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>
          <input
            type="number"
            name="budget"
            value={newProject.budget}
            onChange={handleChange}
            placeholder="Budget (Rs)"
            className="w-full border rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
          <input
            type="number"
            name="completion"
            value={newProject.completion}
            onChange={handleChange}
            min="0"
            max="100"
            placeholder="Completion (%)"
            className="w-full border rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {isEditing ? "Save Changes" : "Add Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProjectModal;
