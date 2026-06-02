import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/finances';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const financeService = {
  getAll: (params) => api.get('/', { params }).then((r) => r.data),
  getById: (id) => api.get(`/${id}`).then((r) => r.data),
  create: (formData) =>
    api.post('/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  update: (id, formData) =>
    api.put(`/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  remove: (id) => api.delete(`/${id}`).then((r) => r.data),
};

export default financeService;
