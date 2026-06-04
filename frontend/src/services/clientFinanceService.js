import axios from 'axios';

const API_BASE_URL = 'https://ad-construction-1.onrender.com/client-finance';

const authHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    ...authHeaders()
  };
  return config;
});

const multipartApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

multipartApi.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    ...authHeaders()
  };
  return config;
});

export const clientFinanceService = {
  getProjects: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  submitInstallment: async ({ projectId, stage, description, bankSlip }) => {
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('stage', stage);
    if (description) formData.append('description', description);
    if (bankSlip) formData.append('bankSlip', bankSlip);

    const response = await multipartApi.post('/invoice', formData);
    return response.data;
  }
};

export default clientFinanceService;
