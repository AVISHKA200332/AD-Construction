import axios from "axios";
import logger from '../utils/logger';

const API_URL = "http://localhost:5000/api/users";

const getAllUsers = async () => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (error) {
    logger.error("API Error:", error);
    throw error;
  }
};

const createUser = async (user) => {
  try {
    const res = await axios.post(API_URL, user);
    return res.data;
  } catch (error) {
    logger.error("API Error:", error);
    throw error;
  }
};

const updateUser = async (id, user) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, user);
    return res.data;
  } catch (error) {
    logger.error("API Error:", error);
    throw error;
  }
};

const deleteUser = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    logger.error("API Error:", error);
    throw error;
  }
};

const userService = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};

export default userService;