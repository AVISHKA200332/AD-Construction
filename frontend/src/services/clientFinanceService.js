import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/client-finance';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const multipartApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

export const clientFinanceService = {
  getProjects: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  createInvoice: async ({ projectId, description, bankSlip }) => {
    const formData = new FormData();
    formData.append('projectId', projectId);
    if (description) formData.append('description', description);
    if (bankSlip) formData.append('bankSlip', bankSlip);

    const response = await multipartApi.post('/invoice', formData);
    return response.data;
  }
};

export default clientFinanceService;
