import axios from "axios";

// Use full URL for development
const API_URL = "http://localhost:5000/users";

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
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

const getUserById = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

const createUser = async (user) => {
  try {
    const res = await axios.post(API_URL, user);
    return res.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

const updateUser = async (id, user) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, user);
    return res.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

const deleteUser = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

const userService = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

export default userService;
export { userService };