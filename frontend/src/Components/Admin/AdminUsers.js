import React, { useEffect, useMemo, useState } from "react";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Site Manager",
    tempPassword: "",
  });

  const allowedRoles = useMemo(() => ["Site Manager", "Supervisor", "Labor"], []);

  // Load from localStorage on mount (demo persistence)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ad_admin_users");
      if (raw) setUsers(JSON.parse(raw));
    } catch {}
  }, []);

  // Persist to localStorage on changes (demo only)
  useEffect(() => {
    try {
      localStorage.setItem("ad_admin_users", JSON.stringify(users));
    } catch {}
  }, [users]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.name || form.name.trim().length < 2) {
      setStatus("Name must be at least 2 characters.");
      return false;
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setStatus("Enter a valid email address.");
      return false;
    }
    if (!allowedRoles.includes(form.role)) {
      setStatus("Select a valid role: Site Manager, Supervisor, or Labor.");
      return false;
    }
    if (!form.tempPassword || form.tempPassword.length < 6) {
      setStatus("Temporary password must be at least 6 characters.");
      return false;
    }
    setStatus("");
    return true;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const exists = users.some((u) => u.email.toLowerCase() === form.email.toLowerCase());
    if (exists) {
      setStatus("A user with this email already exists.");
      return;
    }
    const newUser = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      tempPassword: form.tempPassword,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);
    setForm({ name: "", email: "", role: "Site Manager", tempPassword: "" });
    setStatus("User added. Share credentials securely with the user.");
  };

  const handleRemove = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-[#0B3954]">Users Management</h1>
      <p className="text-gray-600 mt-2">Admins can add Site Managers, Supervisors, and Labor users here.</p>

      {/* Add User Form */}
      <div className="mt-6 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#0B3954] mb-4">Add User</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]"
            >
              {allowedRoles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
            <input
              type="text"
              name="tempPassword"
              value={form.tempPassword}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]"
              placeholder="Min 6 characters"
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              className="inline-flex justify-center items-center px-5 py-2 bg-[#F5CB5C] text-[#0B3954] font-semibold rounded-lg hover:bg-[#e5bb4f] transition"
            >
              Add User
            </button>
            {status && <span className="text-sm text-gray-600">{status}</span>}
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="mt-6 bg-white border border-gray-100 rounded-xl p-5 shadow-sm overflow-x-auto">
        <h2 className="text-lg font-semibold text-[#0B3954] mb-4">Users</h2>
        {users.length === 0 ? (
          <p className="text-gray-500">No users yet. Add a user above.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Temp Password</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-b-0">
                  <td className="py-2 pr-4 font-medium text-[#0B3954]">{u.name}</td>
                  <td className="py-2 pr-4">{u.email}</td>
                  <td className="py-2 pr-4">{u.role}</td>
                  <td className="py-2 pr-4 font-mono">{u.tempPassword}</td>
                  <td className="py-2 pr-4">{new Date(u.createdAt).toLocaleString()}</td>
                  <td className="py-2">
                    <button
                      onClick={() => handleRemove(u.id)}
                      className="px-3 py-1 text-sm rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;
