import React from "react";
import { Link } from "react-router-dom";

function StatCard({ title, value, subtitle, accent = "#0B3954", icon }) {
  return (
    <div className="relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">{title}</p>
          <p className="text-3xl font-extrabold mt-1" style={{ color: accent }}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className="h-10 w-10 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}10`, color: accent }}
        >
          {icon}
        </div>
      </div>
      <div className="absolute -right-6 -bottom-6 opacity-10" aria-hidden>
        <div className="h-20 w-20 rounded-full" style={{ background: accent }}></div>
      </div>
    </div>
  );
}

function ProgressBar({ value, color = "#0B3954" }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, background: color }}
      ></div>
    </div>
  );
}

function LaborDashBoard() {
  const tasks = [
    { id: 1, title: "Rebar tying - Block A", due: "Today 4:00 PM", pct: 60, color: "#0B3954" },
    { id: 2, title: "Formwork check - Stairwell", due: "Tomorrow 9:00 AM", pct: 30, color: "#E67E22" },
    { id: 3, title: "Area cleanup - Level 2", due: "Fri 2:00 PM", pct: 85, color: "#16A34A" },
  ];

  const shifts = [
    { day: "Today", slot: "07:00 - 15:00", team: "Team A" },
    { day: "Tomorrow", slot: "08:00 - 16:00", team: "Team B" },
    { day: "Fri", slot: "07:00 - 15:00", team: "Team A" },
  ];

  const alerts = [
    { type: "Safety", text: "PPE check mandatory near crane zone.", color: "#DC2626" },
    { type: "Notice", text: "Concrete pour scheduled 10:30 AM.", color: "#0B3954" },
  ];

  const messages = [
    { from: "Supervisor", text: "Toolbox talk at 06:45 near gate.", time: "10m" },
    { from: "Site Manager", text: "Delivery delay by 30 mins.", time: "1h" },
  ];

  return (
    <div className="px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0B3954]">Labor Dashboard</h1>
          <p className="text-gray-600 mt-1">Your shifts, tasks, safety notices and messages in one place.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/labor/projects" className="px-4 py-2 bg-[#0B3954] text-white rounded-lg text-sm hover:opacity-90">Projects</Link>
          <Link to="/labor/reports" className="px-4 py-2 bg-[#F5CB5C] text-[#0B3954] rounded-lg text-sm hover:opacity-90">Reports</Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard
          title="Active Tasks"
          value="6"
          subtitle="2 due today"
          accent="#0B3954"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M9 11l3 3L22 4l-1.5-1.5L12 13 10.5 11.5 9 13l-4-4L3 10l6 6 2-2z" />
            </svg>
          }
        />
        <StatCard
          title="Hours This Week"
          value="32h"
          subtitle="8h overtime"
          accent="#16A34A"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M12 1a11 11 0 1 0 11 11A11.012 11.012 0 0 0 12 1zm1 11H7V10h5V5h2z" />
            </svg>
          }
        />
        <StatCard
          title="Incidents"
          value="0"
          subtitle="Last 30 days"
          accent="#0EA5E9"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M12 2 1 21h22L12 2zm0 14v2h-2v-2h2zm0-8v6h-2V8h2z" />
            </svg>
          }
        />
        <StatCard
          title="Alerts"
          value="2"
          subtitle="Action needed"
          accent="#DC2626"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v2h2v-2zm0-6h-2v4h2v-4z" />
            </svg>
          }
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left: My Tasks */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#0B3954]">My Tasks</h2>
            <Link to="/labor/projects" className="text-sm text-[#0B3954] hover:underline">View all</Link>
          </div>
          <div className="mt-4 space-y-4">
            {tasks.map((t) => (
              <div key={t.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-800">{t.title}</p>
                    <p className="text-xs text-gray-500">Due: {t.due}</p>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: t.color }}>
                    {t.pct}%
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={t.pct} color={t.color} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Sidebar cards */}
        <div className="space-y-6">
          {/* Shift Schedule */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0B3954]">Shift Schedule</h2>
              <Link to="/labor/settings" className="text-sm text-[#0B3954] hover:underline">Details</Link>
            </div>
            <ul className="mt-3 divide-y divide-gray-100">
              {shifts.map((s, i) => (
                <li key={i} className="py-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#0B3954]"></span>
                    <p className="text-gray-800">{s.day}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-700 font-medium">{s.slot}</p>
                    <p className="text-gray-400">{s.team}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Safety & Notices */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0B3954]">Safety & Notices</h2>
            <div className="mt-3 space-y-3">
              {alerts.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span
                    className="mt-1 h-2.5 w-2.5 rounded-full"
                    style={{ background: a.color }}
                  ></span>
                  <div>
                    <p className="text-sm text-gray-800">
                      <span className="font-medium" style={{ color: a.color }}>
                        {a.type}:
                      </span>{" "}
                      {a.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0B3954]">Messages</h2>
              <Link to="/labor/communication" className="text-sm text-[#0B3954] hover:underline">Open inbox</Link>
            </div>
            <ul className="mt-3 divide-y divide-gray-100">
              {messages.map((m, i) => (
                <li key={i} className="py-3 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{m.text}</p>
                    <p className="text-xs text-gray-500">From: {m.from}</p>
                  </div>
                  <span className="text-xs text-gray-400">{m.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mt-6">
        <h2 className="text-lg font-semibold text-[#0B3954]">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/labor/projects" className="group">
            <div className="w-full h-24 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all flex items-center justify-center">
              <span className="text-[#0B3954] font-medium">My Tasks</span>
            </div>
          </Link>
          <Link to="/labor/reports" className="group">
            <div className="w-full h-24 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all flex items-center justify-center">
              <span className="text-[#0B3954] font-medium">Submit Report</span>
            </div>
          </Link>
          <Link to="/labor/communication" className="group">
            <div className="w-full h-24 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all flex items-center justify-center">
              <span className="text-[#0B3954] font-medium">Messages</span>
            </div>
          </Link>
          <Link to="/labor/settings" className="group">
            <div className="w-full h-24 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all flex items-center justify-center">
              <span className="text-[#0B3954] font-medium">Profile</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LaborDashBoard;
