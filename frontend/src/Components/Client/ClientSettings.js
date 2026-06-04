import React, { useEffect, useState } from "react";
import userService from "../../services/userService";

function ClientSettings() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ 
    name: "", 
    gmail: "", 
    phone: "", 
    age: "", 
    address: "", 
    profileImage: "" 
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        const raw = localStorage.getItem("userData");
        const parsed = raw ? JSON.parse(raw) : null;
        if (!parsed?._id) return;
        const data = await userService.getUserById(parsed._id);
        setUser(data.user);
        setForm({
          name: data.user.name || "",
          gmail: data.user.gmail || "",
          phone: data.user.phone || "",
          age: data.user.age || "",
          address: data.user.address || "",
          profileImage: data.user.profileImage || ""
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []); // ✅ runs once on mount

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await userService.updateUser(user._id, form);
      setSuccess("Profile updated!");
      setEditMode(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) return <div className="px-6 py-8">Loading...</div>;

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-[#0B3954]">Settings</h1>
      <p className="text-gray-600 mt-2">
        Manage your profile, notifications, and preferences.
      </p>

      <div className="mt-6 bg-white border border-gray-100 rounded-xl p-5 shadow-sm max-w-xl">
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {success && <div className="mb-4 text-green-700">{success}</div>}

        {!editMode ? (
          <>
            <div className="flex items-center gap-4 mb-4">
              {user?.profileImage && (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div>
                <div className="font-bold text-lg">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.gmail}</div>
              </div>
            </div>
            <div className="mb-2">
              Phone: <span className="text-gray-700">{user?.phone}</span>
            </div>
            <div className="mb-2">
              Age: <span className="text-gray-700">{user?.age}</span>
            </div>
            <div className="mb-2">
              Address: <span className="text-gray-700">{user?.address}</span>
            </div>
            <button
              className="mt-4 px-4 py-2 rounded bg-[#0B3954] text-white hover:bg-[#082032]"
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded border px-2 py-1"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Gmail</label>
              <input
                type="email"
                name="gmail"
                value={form.gmail}
                onChange={handleChange}
                className="w-full rounded border px-2 py-1"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Phone</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded border px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Age</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                className="w-full rounded border px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Address</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full rounded border px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">
                Profile Image
              </label>
              <input
                type="file"
                name="profileImage"
                accept="image/*"
                onChange={handleChange}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded bg-[#0B3954] text-white hover:bg-[#082032]"
                disabled={loading}
              >
                Save
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-200 text-gray-700"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ClientSettings;
