import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [role] = useState("Admin");

  const [tasks, setTasks] = useState({
    todo: ["Inspect site A", "Order cement"],
    inProgress: ["Foundation work"],
    completed: ["Design approval"],
  });

  const onDragStart = (e, task, from) => {
    if (!["Admin", "Manager"].includes(role)) return;
    e.dataTransfer.setData("task", task);
    e.dataTransfer.setData("from", from);
  };

  const onDrop = (e, to) => {
    if (!["Admin", "Manager"].includes(role)) return;
    const task = e.dataTransfer.getData("task");
    const from = e.dataTransfer.getData("from");
    if (from === to) return;

    setTasks((prev) => {
      const newTasks = { ...prev };
      newTasks[from] = newTasks[from].filter((t) => t !== task);
      newTasks[to] = [...newTasks[to], task];
      return newTasks;
    });
  };

  return (
    <div className="flex h-screen bg-gray-300 text-[#0B3954]">
      <main className="flex-1 p-6 flex flex-col bg-white rounded-xl m-6 shadow-xl">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <input
            type="text"
            placeholder="Search projects..."
            className="px-4 py-2 w-72 rounded-full border-2 border-[#0B3954] font-semibold text-[#0B3954] bg-blue-100 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
          />
          <button
            className="px-4 py-2 ml-3 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700"
            onClick={() => navigate("/add-project")}
          >
            + Add Project
          </button>
        </header>

        {/* Summary Cards */}
        <section className="flex gap-6 mb-10 flex-wrap">
          {[
            {
              title: "Active Projects",
              value: "8 projects",
              progress: 65,
              label: "65% complete",
              onClick: () => navigate("/project-list"),
            },
            { title: "Tasks Pending", value: "5 tasks" },
            { title: "Materials Low", value: "3 items" },
            { title: "Budget Used", value: "72%", progress: 72 },
          ].map(({ title, value, progress, label, onClick }) => (
            <div
              key={title}
              className="bg-blue-100 p-6 rounded-xl shadow-md flex-1 min-w-[200px] font-bold text-[#0B3954] cursor-pointer hover:translate-y-[-4px] hover:shadow-lg transition"
              onClick={onClick || undefined}
              style={{ cursor: onClick ? "pointer" : "default" }}
            >
              <h3 className="text-lg font-extrabold mb-2">{title}</h3>
              <p className="text-xl">{value}</p>
              {progress !== undefined && (
                <>
                  <progress
                    value={progress}
                    max="100"
                    className="w-full mt-3 h-2 rounded-full"
                  />
                  {label && <small className="block">{label}</small>}
                </>
              )}
            </div>
          ))}
        </section>

        {/* Task Board */}
        <section className="flex-1 bg-white p-6 rounded-xl shadow-lg flex flex-col text-[#0B3954]">
          <h2 className="text-xl font-extrabold mb-6 tracking-wide">
            Task Board
          </h2>
          <div className="flex gap-6 h-full">
            {["todo", "inProgress", "completed"].map((status) => (
              <div
                key={status}
                onDrop={(e) => onDrop(e, status)}
                onDragOver={(e) => e.preventDefault()}
                className="flex-1 bg-blue-100 rounded-xl p-4 flex flex-col max-h-[450px] overflow-y-auto shadow-inner hover:bg-yellow-400 transition"
              >
                <h3 className="text-center mb-4 font-semibold uppercase tracking-wide">
                  {status === "todo"
                    ? "To Do"
                    : status === "inProgress"
                    ? "In Progress"
                    : "Completed"}
                </h3>
                {tasks[status].map((task) => (
                  <div
                    key={task}
                    draggable
                    onDragStart={(e) => onDragStart(e, task, status)}
                    className="bg-white px-3 py-2 mb-3 rounded-lg shadow-md cursor-grab font-medium select-none hover:bg-yellow-300 active:cursor-grabbing active:bg-yellow-400 transition"
                  >
                    {task}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
