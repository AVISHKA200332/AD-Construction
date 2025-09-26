import axios from 'axios';
import logger from '../utils/logger';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/projects';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service functions
export const projectService = {
  // Get all projects with filtering and pagination
  getAllProjects: async (params = '') => {
    try {
      const url = params ? `/?${params}` : '/';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      logger.error('Error fetching projects:', error);
      throw error;
    }
  },

  // Get project by ID
  getProjectById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching project:', error);
      throw error;
    }
  },

  // Get project statistics
  getProjectStats: async () => {
    try {
      const response = await api.get('/stats');
      return response.data;
    } catch (error) {
      logger.error('Error fetching project stats:', error);
      throw error;
    }
  },

  // Get project audit logs
  getProjectAuditLogs: async (id) => {
    try {
      const response = await api.get(`/${id}/audit-logs`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching audit logs:', error);
      throw error;
    }
  },

  // Create new project
  createProject: async (projectData) => {
    try {
      const response = await api.post('/', projectData);
      return response.data;
    } catch (error) {
      logger.error('Error creating project:', error);
      throw error;
    }
  },

  // Update project
  updateProject: async (id, projectData) => {
    try {
      const response = await api.put(`/${id}`, projectData);
      return response.data;
    } catch (error) {
      logger.error('Error updating project:', error);
      throw error;
    }
  },

  // Delete project
  deleteProject: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      logger.error('Error deleting project:', error);
      throw error;
    }
  },
};

export default projectService;
