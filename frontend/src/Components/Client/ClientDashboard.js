import React from "react";
import { Link } from "react-router-dom";

function StatCard({ title, value, subtitle, icon, accent = "#0B3954" }) {
  return (
    <div className="relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">{title}</p>
          <p className="text-3xl font-extrabold mt-1" style={{ color: accent }}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: `${accent}10`, color: accent }}>
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
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }}></div>
    </div>
  );
}

function ClientDashboard() {
  const today = new Date();
  const niceDate = today.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  return (
    <div className="px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0B3954]">Client Dashboard</h1>
          <p className="text-gray-600 mt-1">A quick overview of your projects, finances, and communications.</p>
        </div>
        <div className="text-sm text-gray-500">{niceDate}</div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard
          title="Active Projects"
          value="3"
          subtitle="2 in construction, 1 in planning"
          accent="#0B3954"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M4 4h7v7H4V4zm0 9h7v7H4v-7zm9-9h7v7h-7V4zm0 9h7v7h-7v-7z" />
            </svg>
          }
        />
        <StatCard
          title="Total Budget"
          value="Rs. 25M"
          subtitle="Committed across all projects"
          accent="#E67E22"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zM7 11h10v2H7v-2z" />
            </svg>
          }
        />
        <StatCard
          title="Avg. Completion"
          value="62%"
          subtitle="Weighted by budget"
          accent="#16A34A"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M13 2.05v3.02a7 7 0 1 1-6.95 6.2H3.02A9 9 0 1 0 13 2.05z" />
            </svg>
          }
        />
        <StatCard
          title="Open Alerts"
          value="2"
          subtitle="Requires your attention"
          accent="#DC2626"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v2h2v-2zm0-6h-2v4h2v-4z" />
            </svg>
          }
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Quick Actions */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0B3954]">Quick Actions</h2>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Link to="/client/projects" className="group">
                <div className="w-full h-24 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all flex items-center justify-center gap-2">
                  <span className="text-[#0B3954] font-medium">Projects</span>
                </div>
              </Link>
              <Link to="/client/financial" className="group">
                <div className="w-full h-24 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all flex items-center justify-center gap-2">
                  <span className="text-[#0B3954] font-medium">Financial</span>
                </div>
              </Link>
              <Link to="/client/reports" className="group">
                <div className="w-full h-24 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all flex items-center justify-center gap-2">
                  <span className="text-[#0B3954] font-medium">Reports</span>
                </div>
              </Link>
              <Link to="/client/communication" className="group">
                <div className="w-full h-24 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all flex items-center justify-center gap-2">
                  <span className="text-[#0B3954] font-medium">Messages</span>
                </div>
              </Link>
              <Link to="/client/inventory" className="group">
                <div className="w-full h-24 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all flex items-center justify-center gap-2">
                  <span className="text-[#0B3954] font-medium">Inventory</span>
                </div>
              </Link>
              <Link to="/client/settings" className="group">
                <div className="w-full h-24 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all flex items-center justify-center gap-2">
                  <span className="text-[#0B3954] font-medium">Settings</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Project Progress */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0B3954]">Project Progress</h2>
              <Link to="/client/projects" className="text-sm text-[#0B3954] hover:underline">View all</Link>
            </div>
            <div className="mt-4 space-y-4">
              {[{
                name: "Residential Villa - Kandy",
                pct: 78,
                color: "#16A34A",
                eta: "Nov 12, 2025"
              }, {
                name: "Commercial Complex - Galle",
                pct: 46,
                color: "#E67E22",
                eta: "Feb 03, 2026"
              }, {
                name: "Renovation - Colombo 05",
                pct: 22,
                color: "#0B3954",
                eta: "May 18, 2026"
              }].map((p, idx) => (
                <div key={idx} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-500">ETA: {p.eta}</p>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: p.color }}>{p.pct}%</span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={p.pct} color={p.color} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Financial Overview */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0B3954]">Financial Overview</h2>
              <Link to="/client/financial" className="text-sm text-[#0B3954] hover:underline">Details</Link>
            </div>
            <div className="mt-4 space-y-4">
              {[{
                label: "Budget Used",
                value: 58,
                color: "#0B3954"
              }, {
                label: "Invoices Paid",
                value: 72,
                color: "#16A34A"
              }, {
                label: "Pending Payments",
                value: 28,
                color: "#DC2626"
              }].map((f, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-700">{f.label}</p>
                    <p className="text-sm font-semibold" style={{ color: f.color }}>{f.value}%</p>
                  </div>
                  <ProgressBar value={f.value} color={f.color} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Communications */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0B3954]">Recent Communications</h2>
              <Link to="/client/communication" className="text-sm text-[#0B3954] hover:underline">Open inbox</Link>
            </div>
            <ul className="mt-4 divide-y divide-gray-100">
              {[{
                from: "Site Manager",
                subject: "Concrete delivery rescheduled",
                time: "2h ago"
              }, {
                from: "Accounts",
                subject: "Invoice #INV-203 approved",
                time: "Yesterday"
              }, {
                from: "Architect",
                subject: "Updated floor plans uploaded",
                time: "Mon"
              }].map((m, i) => (
                <li key={i} className="py-3 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{m.subject}</p>
                    <p className="text-xs text-gray-500">From: {m.from}</p>
                  </div>
                  <span className="text-xs text-gray-400">{m.time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Upcoming Milestones */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0B3954]">Upcoming Milestones</h2>
            <div className="mt-4 space-y-3">
              {[{
                label: "Roof slab casting",
                date: "Oct 08, 2025",
                color: "#0B3954"
              }, {
                label: "MEP rough-ins",
                date: "Oct 22, 2025",
                color: "#16A34A"
              }, {
                label: "Client site walk",
                date: "Nov 02, 2025",
                color: "#E67E22"
              }].map((mil, i) => (
                <div key={i} className="flex items-center justify-between border border-gray-100 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: mil.color }}></span>
                    <p className="text-sm text-gray-800">{mil.label}</p>
                  </div>
                  <span className="text-xs text-gray-500">{mil.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientDashboard;
