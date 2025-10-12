import React, { useEffect, useState, useCallback } from "react";
import userService from "../../services/userService";
import userPdfService from "../../services/UserPdfServices";

function AdminUsers() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
  
 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [roleFilter, setRoleFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [exporting, setExporting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    gmail: "",
    phone: "",
    role: "Admin",
    age: "",
    address: "",
    password: ""
  });

  // Field-level errors for inline messages
  const [fieldErrors, setFieldErrors] = useState({});

  
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
        sortBy,
        sortOrder,
      };

      const response = await userService.getAllUsers(params);
      
      if (response && response.users) {
        setUsers(response.users);
        setTotalUsers(response.totalUsers);
        setTotalPages(response.totalPages);
      } else {
        setUsers([]);
        setTotalUsers(0);
        setTotalPages(1);
      }
    } catch (err) {
      setError("Failed to fetch users");
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, roleFilter, sortBy, sortOrder]);

 

  const handleDownloadPdf = async () => {
    try {
      setExporting(true);
      let allUsers = [];
      let page = 1;
      let totalPagesLocal = 1;
      do {
        const response = await userService.getAllUsers({
          page,
          limit: 100,
          ...(roleFilter && { role: roleFilter }),
          ...(searchTerm && { search: searchTerm }),
          sortBy,
          sortOrder,
        });
        if (response?.users?.length) {
          allUsers = allUsers.concat(response.users);
        }
        totalPagesLocal = response?.totalPages || 1;
        page += 1;
      } while (page <= totalPagesLocal);

      
      const finalUsers = roleFilter ? allUsers.filter(u => u.role === roleFilter) : allUsers;
      userPdfService.downloadUserReport(finalUsers, { role: roleFilter || "All", search: searchTerm || "" });
    } catch (e) {
      console.error("PDF export failed:", e);
      setError("Failed to export PDF: " + (e.response?.data?.message || e.message));
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); 
      fetchUsers();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, roleFilter, fetchUsers]);

  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);ffff
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

 
  const handleAddUser = () => {
    setModalType("add");
    setFormData({
      name: "",
      gmail: "",
      phone: "",
      role: "Admin",
      age: "",
      address: "",
      password: ""
    });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setModalType("edit");
    setSelectedUser(user);
    setFormData({
      name: user.name || "",
      gmail: user.gmail || "",
      phone: user.phone || "",
      role: user.role || "Admin",
      age: user.age || "",
      address: user.address || "",
      password: ""
    });
    setShowModal(true);
  };


  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setModalType("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Sanitize phone to digits only and limit to 10
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: digitsOnly }));
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setFieldErrors({});

      const errors = {};

      // Validate Name (required, min 2 chars)
      const nameVal = (formData.name || '').trim();
      if (!nameVal) {
        errors.name = 'Name is required';
      } else if (nameVal.length < 2) {
        errors.name = 'Name must be at least 2 characters';
      }

      // Validate Email (required, basic format)
      const emailVal = (formData.gmail || '').trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailVal) {
        errors.gmail = 'Email is required';
      } else if (!emailRegex.test(emailVal)) {
        errors.gmail = 'Please enter a valid email address';
      }

      // Validate Age (required, 18-100)
      if (formData.age === '' || formData.age === null || formData.age === undefined) {
        errors.age = 'Age is required';
      } else {
        const ageNum = parseInt(formData.age, 10);
        if (isNaN(ageNum)) {
          errors.age = 'Age must be a number';
        } else if (ageNum < 18 || ageNum > 100) {
          errors.age = 'Age must be between 18 and 100';
        }
      }

      // Validate Address (required, min 5 chars)
      const addressVal = (formData.address || '').trim();
      if (!addressVal) {
        errors.address = 'Address is required';
      } else if (addressVal.length < 5) {
        errors.address = 'Address must be at least 5 characters';
      }

      // Phone required and must be exactly 10 digits
      const phoneDigits = (formData.phone || '').replace(/\D/g, '');
      if (!phoneDigits) {
        errors.phone = 'Phone number is required';
      } else if (phoneDigits.length !== 10) {
        errors.phone = 'Phone number must be exactly 10 digits';
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setError('Please fill all required fields correctly');
        return;
      }

      let submitData = { ...formData };

      if (modalType === 'edit' && !submitData.password) {
        delete submitData.password;
      }

      if (modalType === 'add') {
        await userService.createUser(submitData);
      } else if (modalType === 'edit') {
        await userService.updateUser(selectedUser._id, submitData);
      }
      await fetchUsers();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving user:', error);
      setError('Failed to save user: ' + (error.response?.data?.message || error.message));
    }
  };

  
  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      try {
        await userService.deleteUser(userId);
        await fetchUsers(); 
      } catch (error) {
        console.error("Error deleting user:", error);
        setError("Failed to delete user: " + (error.response?.data?.message || error.message));
      }
    }
  };

  
  const roleList = ['Admin', 'Site Manager', 'Supervisor', 'Labor', 'Client'];
  const roleColorMap = {
    Admin: 'bg-red-500',
    'Site Manager': 'bg-green-500',
    Supervisor: 'bg-purple-500',
    Labor: 'bg-orange-500',
    Client: 'bg-blue-500'
  };
  const roleGradientMap = {
    Admin: 'from-red-400 to-red-600',
    'Site Manager': 'from-green-400 to-green-600',
    Supervisor: 'from-purple-400 to-purple-600',
    Labor: 'from-orange-400 to-orange-600',
    Client: 'from-blue-400 to-blue-600'
  };
  const roleCounts = roleList.map((r) => users.filter((u) => u.role === r).length);
  const totalOnPage = Math.max(1, users.length);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-full mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">User Management</h1>
        
        
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">User Management</h2>
              <p className="text-sm text-gray-600">Search users by name, email, or role.</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadPdf}
                disabled={exporting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-medium text-sm inline-flex items-center disabled:opacity-60"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {exporting ? 'Generating…' : 'Download PDF'}
              </button>
              <button 
                onClick={handleAddUser}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium text-sm inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add User
              </button>
            </div>
          </div>
          
          
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="text-xs text-gray-600">
                Total: {totalUsers}
              </div>
            </div>
            
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-medium text-gray-600">Role:</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className={`px-2 py-1 border rounded text-xs focus:ring-2 focus:ring-blue-500 ${
                      roleFilter ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Site Manager">Site Manager</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Labor">Labor</option>
                    <option value="Client">Client</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-medium text-gray-600">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="createdAt">Created Date</option>
                    <option value="name">Name</option>
                    <option value="gmail">Email</option>
                    <option value="role">Role</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
              
              
              {(roleFilter || searchTerm || sortBy !== 'createdAt' || sortOrder !== 'desc') && (
                <button
                  onClick={() => {
                    setRoleFilter('');
                    setSearchTerm('');
                    setSortBy('createdAt');
                    setSortOrder('desc');
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-300 rounded"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        
        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading users...</span>
            </div>
          </div>
        )}

        
        {error && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="text-red-600 bg-red-50 p-4 rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        
        {!loading && !error && (
          <>
            {users.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-medium mb-2">
                    {searchTerm ? 'No matching users found' : 'No users found'}
                  </h3>
                  <p>
                    {searchTerm 
                      ? `No users match your search for "${searchTerm}"` 
                      : 'There are no registered users in the system.'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <>

                <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">User Analytics</h3>
                  <div className="space-y-3">
                    {roleList.map((role, idx) => {
                      const count = roleCounts[idx];
                      const percent = Math.round((count / totalOnPage) * 100);
                      const colorClass = roleColorMap[role] || 'bg-gray-400';
                      const gradient = roleGradientMap[role] || 'from-gray-300 to-gray-500';
                      return (
                        <div key={role} className="flex items-center space-x-3">
                          <div className="w-32 text-xs text-gray-600">{role}</div>
                          <div className="relative flex-1 bg-gray-100 border border-gray-200 rounded h-3">
                            <div
                              className={`absolute left-0 top-0 h-3 rounded bg-gradient-to-r ${gradient} transition-all duration-700 ease-out`}
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                          <div className="w-24 text-xs text-gray-700 text-right">
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 border border-gray-200">
                              <span className={`w-2 h-2 rounded-full mr-1 ${colorClass}`}></span>
                              {count} ({percent}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="w-32 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="w-40 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gmail
                          </th>
                          <th className="w-24 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="w-20 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="w-12 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Age
                          </th>
                          <th className="w-32 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Address
                          </th>
                          <th className="w-24 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="w-24 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Updated
                          </th>
                          <th className="w-32 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user, index) => (
                          <tr key={user._id || index} className="hover:bg-gray-50">
                            <td className="px-3 py-2">
                              <div className="flex items-center">
                                {/* Role line bar */}
                                <span className={`w-1 h-8 rounded mr-2 ${
                                  user.role === 'Admin'
                                    ? 'bg-red-500'
                                    : user.role === 'Site Manager'
                                    ? 'bg-green-500'
                                    : user.role === 'Supervisor'
                                    ? 'bg-purple-500'
                                    : user.role === 'Labor'
                                    ? 'bg-orange-500'
                                    : 'bg-blue-500'
                                }`}></span>
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs mr-2">
                                  {user.name ? user.name.charAt(0).toUpperCase() : user.gmail.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-xs text-gray-900 truncate">
                                  <div className="font-medium">{user.name || 'No name provided'}</div>
                                  <div className="text-[10px] text-gray-500 break-all" title={user._id}>ID: {user._id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="text-xs text-gray-900 truncate" title={user.gmail}>{user.gmail}</div>
                            </td>
                            <td className="px-2 py-2">
                              <div className="text-xs text-gray-900">{user.phone || 'N/A'}</div>
                            </td>
                            <td className="px-2 py-2">
                            
                              <span className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded ${
                                user.role === 'Admin' 
                                  ? 'bg-red-100 text-red-800' 
                                  : user.role === 'Site Manager'
                                  ? 'bg-green-100 text-green-800'
                                  : user.role === 'Supervisor'
                                  ? 'bg-purple-100 text-purple-800'
                                  : user.role === 'Labor'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-blue-100 text-blue-800' 
                              }`}>
                                {user.role || 'Client'}
                              </span>
                            </td>
                            <td className="px-2 py-2">
                              <div className="text-xs text-gray-900">{user.age || 'N/A'}</div>
                            </td>
                            <td className="px-2 py-2">
                              <div className="text-xs text-gray-900 truncate" title={user.address}>{user.address || 'N/A'}</div>
                            </td>
                            <td className="px-2 py-2">
                              <div className="text-xs text-gray-500">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: '2-digit'
                                }) : 'N/A'}
                              </div>
                            </td>
                            <td className="px-2 py-2">
                              <div className="text-xs text-gray-500">
                                {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: '2-digit'
                                }) : 'N/A'}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-xs font-medium">
                              <div className="flex space-x-1">
                                <button 
                                  onClick={() => handleEditUser(user)}
                                  className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                                  title="Edit User"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(user._id, user.name || user.gmail)}
                                  className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                                  title="Delete User"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {totalPages > 1 && (
                  <div className="bg-white border-t px-4 py-3 flex items-center justify-between mt-4">
                    <div className="text-xs text-gray-500">
                      Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalUsers)} of {totalUsers} users
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {[...Array(Math.min(5, totalPages))].map((_, index) => {
                        const page = index + Math.max(1, currentPage - 2);
                        if (page <= totalPages) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-1 text-xs border rounded ${
                                currentPage === page
                                  ? 'bg-blue-500 text-white border-blue-500'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        }
                        return null;
                      })}
                      
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {modalType === "add" ? "Add New User" : "Edit User"}
              </h3>
              
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="gmail"
                    value={formData.gmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {fieldErrors.gmail && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.gmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={modalType === "add"}
                    placeholder={modalType === "edit" ? "Leave blank to keep current password" : "Enter password"}
                    minLength="6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    inputMode="numeric"
                    maxLength={10}
                    autoComplete="tel"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Enter exactly 10 digits (e.g., 0712345678).</p>
                  {fieldErrors.phone && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Client">Client</option>
                    <option value="Site Manager">Site Manager</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Labor">Labor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="18"
                    max="100"
                    required
                  />
                  {fieldErrors.age && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.age}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {fieldErrors.address && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.address}</p>
                  )}
                </div>

                {modalType === "edit" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        User ID
                      </label>
                      <input
                        type="text"
                        value={selectedUser?._id || ""}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Created
                        </label>
                        <input
                          type="text"
                          value={selectedUser?.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : ""}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Updated
                        </label>
                        <input
                          type="text"
                          value={selectedUser?.updatedAt ? new Date(selectedUser.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : ""}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {modalType === "add" ? "Add User" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
