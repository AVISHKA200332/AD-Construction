import axios from "axios";

// Base URLs
const API_URL = "https://ad-construction-1.onrender.com/users";
const PROFILE_URL = "https://ad-construction-1.onrender.com/profile";

// Helper to attach Authorization header
function authHeaders() {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const getUserDirectory = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.role) queryParams.append("role", params.role);
    if (params.search) queryParams.append("search", params.search);
    const qs = queryParams.toString();
    const url = qs ? `${API_URL}/directory?${qs}` : `${API_URL}/directory`;
    const res = await axios.get(url, { headers: authHeaders() });
    return res.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

const getAllUsers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const url = queryParams.toString() ? `${API_URL}?${queryParams.toString()}` : API_URL;
  const res = await axios.get(url, { headers: authHeaders() });
    return res.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

const getUserById = async (id) => {
  try {
  const res = await axios.get(`${API_URL}/${id}`, { headers: authHeaders() });
    return res.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

const createUser = async (user) => {
  try {
  const res = await axios.post(API_URL, user, { headers: authHeaders() });
    return res.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

const updateUser = async (id, user) => {
  try {
  const res = await axios.put(`${API_URL}/${id}`, user, { headers: authHeaders() });
    return res.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

const deleteUser = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/${id}`, { headers: authHeaders() });
    return res.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Profile specific endpoints (authenticated)
const getMyProfile = async () => {
  const res = await axios.get(`${PROFILE_URL}/me`, { headers: authHeaders() });
  return res.data;
};

const updateMyProfile = async (data) => {
  const res = await axios.put(`${PROFILE_URL}/me`, data, { headers: authHeaders() });
  return res.data;
};

const uploadMyProfileImage = async (file) => {
  const form = new FormData();
  form.append('profileImage', file);
  const res = await axios.post(`${PROFILE_URL}/me/image`, form, { headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' } });
  return res.data;
};

const getMyActivity = async () => {
  const res = await axios.get(`${PROFILE_URL}/activity`, { headers: authHeaders() });
  return res.data;
};

const changeMyPassword = async (currentPassword, newPassword) => {
  const res = await axios.post(`${PROFILE_URL}/me/password`, { currentPassword, newPassword }, { headers: authHeaders() });
  return res.data;
};

const profileService = { getMyProfile, updateMyProfile, uploadMyProfileImage, getMyActivity, changeMyPassword };

const userService = { getUserDirectory, getAllUsers, getUserById, createUser, updateUser, deleteUser, profile: profileService };

export default userService;
export { userService };