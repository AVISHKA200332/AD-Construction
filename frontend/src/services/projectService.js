import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/projects';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service functions
export const projectService = {
  // Get all projects
  getAllProjects: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  // Get project by ID
  getProjectById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  },

  // Create new project
  createProject: async (projectData) => {
    try {
      const response = await api.post('/', projectData);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Update project
  updateProject: async (id, projectData) => {
    try {
      const response = await api.put(`/${id}`, projectData);
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  // Delete project
  deleteProject: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },
};

export default projectService;
