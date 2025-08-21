import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AddProjectModal({ showModal, setShowModal }) {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    name: "",
    client: "",
    status: "Planning",
    startDate: "",
    endDate: "",
    budget: "",
    completion: "",
  });

  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/projects", {
        name: String(inputs.name),
        client: String(inputs.client),
        status: String(inputs.status),
        startDate: inputs.startDate,
        endDate: inputs.endDate,
        budget: Number(inputs.budget),
        completion: Number(inputs.completion),
      });

      setInputs({
        name: "",
        client: "",
        status: "Planning",
        startDate: "",
        endDate: "",
        budget: "",
        completion: "",
      });

      setSuccessMsg("🎉 Project added successfully!");

      setTimeout(() => {
        setSuccessMsg("");
        setShowModal(false);
        navigate("/projects");
      }, 3000);
    } catch (err) {
      console.error("Error adding project:", err);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-96 p-6 animate-slideIn relative">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold transition"
          onClick={() => setShowModal(false)}
        >
          ×
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Add New Project
        </h2>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-center animate-bounce">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            value={inputs.name}
            onChange={handleChange}
            required
            placeholder="Project Name"
            className="w-full border rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />

          <input
            type="text"
            name="client"
            value={inputs.client}
            onChange={handleChange}
            required
            placeholder="Client"
            className="w-full border rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />

          <select
            name="status"
            value={inputs.status}
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
              value={inputs.startDate}
              onChange={handleChange}
              className="flex-1 border rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
            <input
              type="date"
              name="endDate"
              value={inputs.endDate}
              onChange={handleChange}
              className="flex-1 border rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          <input
            type="number"
            name="budget"
            value={inputs.budget}
            onChange={handleChange}
            placeholder="Budget (Rs)"
            className="w-full border rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />

          <input
            type="number"
            name="completion"
            value={inputs.completion}
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
              Add Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProjectModal;
