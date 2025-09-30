import React, { useEffect, useState } from "react";
import userService from "../../services/userService";

function ClientProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    gmail: "",
    phone: "",
    age: "",
    address: "",
    profileImage: "",
  });

  const userData = (() => {
    try {
      const raw = localStorage.getItem("userData");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const userId = userData?._id || userData?.id;

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError("No user session found");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await userService.getUserById(userId);
        const u = res.user || {};
        setForm({
          name: u.name || "",
          gmail: u.gmail || "",
          phone: u.phone || "",
          age: u.age != null ? String(u.age) : "",
          address: u.address || "",
          profileImage: u.profileImage || "",
        });
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, profileImage: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!userId) return;
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const payload = {
        name: form.name,
        phone: form.phone,
        age: form.age ? Number(form.age) : undefined,
        address: form.address,
        profileImage: form.profileImage,
      };
      const res = await userService.updateUser(userId, payload);
      const updated = res.user || {};
      // refresh local storage to keep UI in sync
      const merged = { ...(userData || {}), ...updated };
      localStorage.setItem("userData", JSON.stringify(merged));
      setSuccess("Profile updated successfully");
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-[#0B3954]">My Profile</h1>
      <p className="text-gray-600 mt-2">View and update your profile details.</p>

      {loading ? (
        <div className="mt-6 bg-white border border-gray-100 rounded-xl p-6 shadow-sm">Loading...</div>
      ) : (
        <form onSubmit={handleSave} className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col items-center">
            <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden">
              {form.profileImage ? (
                <img src={form.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
            </div>
            <label className="mt-3 text-sm text-[#0B3954] cursor-pointer font-medium">
              Upload Image
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            {error && (
              <div className="mb-3 p-3 bg-red-100 border border-red-300 text-red-700 rounded">{error}</div>
            )}
            {success && (
              <div className="mb-3 p-3 bg-green-100 border border-green-300 text-green-700 rounded">{success}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B3954]"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Gmail</label>
                <input
                  name="gmail"
                  value={form.gmail}
                  disabled
                  className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B3954]"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Age</label>
                <input
                  type="number"
                  min="0"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  className="w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B3954]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Address</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B3954]"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2 justify-end">
              <button type="button" onClick={() => window.history.back()} className="px-4 py-2 border rounded-lg">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-[#0B3954] text-white disabled:opacity-60">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default ClientProfile;
