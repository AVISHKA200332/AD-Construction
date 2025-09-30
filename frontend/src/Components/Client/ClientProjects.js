import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import projectService from "../../services/projectService";

function StatusBadge({ status }) {
  const map = {
    Planning: { bg: "#e0f2fe", color: "#0369a1" },
    "In Progress": { bg: "#ecfdf5", color: "#047857" },
    "On Hold": { bg: "#fff7ed", color: "#9a3412" },
    Completed: { bg: "#eef2ff", color: "#3730a3" },
  };
  const s = map[status] || { bg: "#f1f5f9", color: "#334155" };
  return (
    <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

function ProgressBar({ value, color = "#0B3954" }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }}></div>
    </div>
  );
}

function ClientProjects() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);

  // Load logged-in user from localStorage
  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem("userData");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // Fetch projects from backend and filter to this client
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError("");
        // Determine client identity keys
        const userName = currentUser?.name || currentUser?.fullName || currentUser?.username || "";
        const userEmail = currentUser?.email || "";
        const params = ["limit=1000"];
        if (userName) params.push(`clientName=${encodeURIComponent(userName)}`);
        if (userEmail) params.push(`clientEmail=${encodeURIComponent(userEmail)}`);
        const data = await projectService.getAllProjects(params.join('&'));
        const list = Array.isArray(data?.projects) ? data.projects : Array.isArray(data) ? data : [];
        const mapped = list.map((p) => ({
          _raw: p,
          id: p.projectId || p._id || p.id,
          name: p.name,
          location: p.location?.city || p.location || "",
          status: p.status || "Planning",
          progress: Number(p.completion ?? p.progress ?? 0),
          budget: Number(p.budget ?? 0) / 1000000 > 0 ? Number(p.budget) / 1000000 : Number(p.budget ?? 0),
          eta: p.endDate || p.eta || "",
          clientName: p.client || p.clientName || "",
          clientEmail: p.clientContact?.email || p.clientEmail || "",
        }));
        setProjects(mapped);
      } catch (e) {
        console.error(e);
        setError("Failed to load projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [currentUser]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = projects.filter((p) =>
      [p.name, p.location, p.id].some((v) => String(v).toLowerCase().includes(q))
    );
    if (status !== "All") list = list.filter((p) => p.status === status);
    switch (sortBy) {
      case "progress":
        list = list.slice().sort((a, b) => b.progress - a.progress);
        break;
      case "budget":
        list = list.slice().sort((a, b) => b.budget - a.budget);
        break;
      default:
        list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [projects, query, status, sortBy]);

  const counts = useMemo(() => {
    const all = projects.length;
    const byStatus = projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
    return { all, byStatus };
  }, [projects]);

  return (
    <div className="px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0B3954]">My Projects</h1>
          <p className="text-gray-600 mt-1">Search, filter, and track progress across all your projects.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="hidden sm:inline">Total:</span>
          <span className="font-semibold text-[#0B3954]">{counts.all}</span>
          <span className="hidden sm:inline">• In Progress:</span>
          <span className="font-semibold text-[#0B3954]">{counts.byStatus["In Progress"] || 0}</span>
          <span className="hidden sm:inline">• Planning:</span>
          <span className="font-semibold text-[#0B3954]">{counts.byStatus["Planning"] || 0}</span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mt-6 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs text-gray-500">Search</label>
            <div className="mt-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, ID, or location..."
                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B3954]"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">Status</label>
            <div className="mt-1">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3954]"
              >
                {["All", "Planning", "In Progress", "On Hold", "Completed"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">Sort by</label>
            <div className="mt-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3954]"
              >
                <option value="name">Name (A-Z)</option>
                <option value="progress">Progress (High-Low)</option>
                <option value="budget">Budget (High-Low)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-10 shadow-sm text-center text-gray-600">
          Loading projects...
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-10 shadow-sm text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: "#0B395410", color: "#0B3954" }}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M21 20.3l-3.5-3.5A7.9 7.9 0 1 0 4 10a8 8 0 0 0 13.8 5.3L21.3 19 21 20.3zM6 10a6 6 0 1 1 12 0A6 6 0 0 1 6 10z"/></svg>
          </div>
          <h3 className="mt-3 font-semibold text-gray-800">No projects found</h3>
          <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[#0B3954]">{p.name}</h3>
                  <p className="text-xs text-gray-500">ID: {p.id} • {p.location}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">Progress</span>
                  <span className="text-sm font-medium" style={{ color: p.progress === 100 ? "#16A34A" : "#0B3954" }}>{p.progress}%</span>
                </div>
                <ProgressBar value={p.progress} color={p.progress === 100 ? "#16A34A" : "#0B3954"} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="border border-gray-100 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Budget</p>
                  <p className="text-sm font-semibold text-gray-800">Rs. {p.budget.toFixed(1)}M</p>
                </div>
                <div className="border border-gray-100 rounded-xl p-3">
                  <p className="text-xs text-gray-500">ETA</p>
                  <p className="text-sm font-semibold text-gray-800">{new Date(p.eta).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" })}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Link to="#" className="text-sm text-[#0B3954] hover:underline">View details</Link>
                <div className="flex items-center gap-2">
                  <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">Documents</button>
                  <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">Messages</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer actions */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs text-gray-500">Showing {filtered.length} project(s)</p>
        <div className="flex items-center gap-2">
          <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">Previous</button>
          <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
}

export default ClientProjects;
