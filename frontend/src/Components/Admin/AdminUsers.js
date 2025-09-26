import React, { useEffect, useState } from "react";
import userService from "../../services/userService";

function AdminUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  

  // New user state removed (unused)

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userService.getAllUsers();
      
      if (response.users) {
        setUsers(response.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // This file was renamed to AdminUsers.js

  return (
    <div>
      {/* User management UI here */}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && users.length === 0 && <div className="text-gray-500">No users found.</div>}
    </div>
  );
}

export default AdminUsers;
