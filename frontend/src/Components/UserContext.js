import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

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
    }
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
