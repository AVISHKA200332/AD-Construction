import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/project-assign';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

export const projectAssignService = {
  assignSiteManager: async (projectId, siteManagerId) => {
    const res = await api.post(`/${projectId}/assign-site-manager`, { siteManagerId });
    return res.data;
  },
  addClientToProject: async (projectId, clientId) => {
    const res = await api.post(`/${projectId}/add-client`, { clientId });
    return res.data;
  },
};

export default projectAssignService;
