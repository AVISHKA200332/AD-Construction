import axios from 'axios';

const API_BASE = 'http://localhost:5000';

// Helper to build query string
function buildQuery(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, v);
  });
  return qs.toString() ? `?${qs.toString()}` : '';
}

const inventoryService = {
  async getAllItems(params) {
    const res = await axios.get(`${API_BASE}/inventory${buildQuery(params)}`);
    return res.data?.items || res.data || [];
  },
  async getInventoryStats() {
    const res = await axios.get(`${API_BASE}/inventory/stats/summary`);
    return res.data || {};
  },
  async getAllBuyerItems() {
    const res = await axios.get(`${API_BASE}/buyer-inventory`);
    return res.data?.items || res.data || [];
  },
  async createItem(payload) {
    const res = await axios.post(`${API_BASE}/inventory`, payload);
    return res.data;
  },
  async updateItem(id, payload) {
    const res = await axios.put(`${API_BASE}/inventory/${id}`, payload);
    return res.data;
  },
  async deleteItem(id) {
    const res = await axios.delete(`${API_BASE}/inventory/${id}`);
    return res.data;
  },
  async restockItem(id, amount) {
    const res = await axios.patch(`${API_BASE}/inventory/${id}/restock`, { amount });
    return res.data;
  },
  async orderItem(id, amount) {
    const res = await axios.patch(`${API_BASE}/inventory/${id}/order`, { amount });
    return res.data;
  }
};

export default inventoryService;
