import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/inventory-items';
const BUYER_API_URL = 'http://localhost:5000/buyer-items';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const buyerApi = axios.create({
  baseURL: BUYER_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service functions
export const inventoryService = {
  // Get all inventory items with filtering and pagination
  getAllItems: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `/?${queryParams}` : '/';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      throw error;
    }
  },

  // Get item by ID
  getItemById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching item:', error);
      throw error;
    }
  },

  // Create new item
  createItem: async (itemData) => {
    try {
      const response = await api.post('/', itemData);
      return response.data;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  },

  // Update item
  updateItem: async (id, itemData) => {
    try {
      const response = await api.put(`/${id}`, itemData);
      return response.data;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  },

  // Delete item
  deleteItem: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  },

  // Restock item
  restockItem: async (id, amount) => {
    try {
      const response = await api.patch(`/${id}/restock`, { amount });
      return response.data;
    } catch (error) {
      console.error('Error restocking item:', error);
      throw error;
    }
  },

  // Order item (reduce stock)
  orderItem: async (id, amount) => {
    try {
      const response = await api.patch(`/${id}/order`, { amount });
      return response.data;
    } catch (error) {
      console.error('Error ordering item:', error);
      throw error;
    }
  },

  // Get inventory statistics
  getInventoryStats: async () => {
    try {
      const items = await inventoryService.getAllItems();
      const totalItems = items.length;
      const totalValue = items.reduce((sum, item) => sum + (item.amount * item.unitPrice), 0);
      const outOfStock = items.filter(item => item.amount === 0).length;
      const lowStock = items.filter(item => item.amount > 0 && item.amount < 10).length;
      const activeItems = items.filter(item => item.status === 'active').length;
      
      // Group by type for statistics
      const typeStats = items.reduce((acc, item) => {
        if (!acc[item.type]) {
          acc[item.type] = { count: 0, totalAmount: 0, totalValue: 0 };
        }
        acc[item.type].count++;
        acc[item.type].totalAmount += item.amount;
        acc[item.type].totalValue += item.amount * item.unitPrice;
        return acc;
      }, {});

      return {
        totalItems,
        totalValue,
        outOfStock,
        lowStock,
        activeItems,
        typeStats
      };
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      throw error;
    }
  },

  // Buyer inventory services
  getAllBuyerItems: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `/?${queryParams}` : '/';
      const response = await buyerApi.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching buyer items:', error);
      throw error;
    }
  },

  createBuyerItem: async (itemData) => {
    try {
      const response = await buyerApi.post('/', itemData);
      return response.data;
    } catch (error) {
      console.error('Error creating buyer item:', error);
      throw error;
    }
  },

  updateBuyerItem: async (id, itemData) => {
    try {
      const response = await buyerApi.put(`/${id}`, itemData);
      return response.data;
    } catch (error) {
      console.error('Error updating buyer item:', error);
      throw error;
    }
  },

  deleteBuyerItem: async (id) => {
    try {
      const response = await buyerApi.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting buyer item:', error);
      throw error;
    }
  },
};

export default inventoryService;
