import React, { useEffect, useState } from "react";

function ClientProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const raw = localStorage.getItem("userData");
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed?._id) return;
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/users/${parsed._id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) return;
      const data = await res.json();
      setUser(data.user);
      setLoading(false);
    }
    fetchUser();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <div className="p-8 text-red-600">Profile not found.</div>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="relative mb-6">
          <img
            src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0B3954&color=fff`}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-[#0B3954] shadow"
          />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0B3954]">{user.name}</h2>
          <p className="text-gray-500 text-sm mt-1">{user.gmail}</p>
        </div>
        <div className="mt-6 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-400">Phone</div>
            <div className="text-base text-gray-800 font-medium">{user.phone || '-'}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-400">Age</div>
            <div className="text-base text-gray-800 font-medium">{user.age || '-'}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
            <div className="text-xs text-gray-400">Address</div>
            <div className="text-base text-gray-800 font-medium">{user.address || '-'}</div>
          </div>
        </div>
        <div className="mt-8 w-full flex justify-center">
          <a
            href="/client/settings"
            className="px-6 py-2 rounded-lg bg-[#0B3954] text-white font-semibold hover:bg-[#082032] transition"
          >
            Edit Profile
          </a>
        </div>
      </div>
    </div>
  );
}

export default ClientProfile;
