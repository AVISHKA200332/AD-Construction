import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/role-ops' });
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('authToken');
  if (token) cfg.headers['Authorization'] = `Bearer ${token}`;
  return cfg;
});

export const roleOpsService = {
  // Site Manager
  getSMProjects: () => api.get('/sm/projects').then(r=>r.data),
  addSupervisor: (projectId, supervisorId) => api.post('/sm/projects/add-supervisor', { projectId, supervisorId }).then(r=>r.data),

  // Site Supervisor
  getSSProjects: () => api.get('/ss/projects').then(r=>r.data),
  createTask: (payload = {}) => {
    // Backend expects: { projectId, title, description, dueDate, laborerIds[] }
    const { projectId, project, laborerIds, laborers, ...rest } = payload;
    const body = {
      projectId: projectId || project, // map 'project' -> 'projectId'
      laborerIds: Array.isArray(laborerIds) ? laborerIds : (Array.isArray(laborers) ? laborers : []),
      ...rest,
    };
    return api.post('/ss/tasks', body).then(r=>r.data);
  },
  myTasks: () => api.get('/ss/tasks').then(r=>r.data),
  updateTask: (id, payload = {}) => {
    // Allow flexible keys { laborers } -> { laborerIds }
    const { laborerIds, laborers, ...rest } = payload;
    const body = {
      laborerIds: Array.isArray(laborerIds) ? laborerIds : (Array.isArray(laborers) ? laborers : undefined),
      ...rest,
    };
    return api.put(`/ss/tasks/${id}`, body).then(r=>r.data);
  },
  clearTasks: ({ projectId, status } = {}) => {
    const params = new URLSearchParams();
    if (projectId) params.set('projectId', projectId);
    if (status) params.set('status', status);
    const suffix = params.toString() ? ('?' + params.toString()) : '';
    return api.delete('/ss/tasks' + suffix).then(r => r.data);
  },

  // Labor
  laborTasks: () => api.get('/labor/tasks').then(r=>r.data),
  completeTask: (id) => api.post(`/labor/tasks/${id}/complete`).then(r=>r.data),

  // Client
  clientProjects: () => api.get('/client/projects').then(r=>r.data),
};

export default roleOpsService;
