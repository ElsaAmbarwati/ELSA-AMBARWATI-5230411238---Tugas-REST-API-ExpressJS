// API Client Wrapper for Elsa Logistics REST API

const API_BASE_URL = 'http://localhost:3000/api';

const api = {
  // GET /api/products
  async getProducts() {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal mengambil data produk');
      }
      return await response.json();
    } catch (error) {
      console.error('API Error (getProducts):', error);
      throw error;
    }
  },

  // POST /api/products
  async createProduct(productData) {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menambahkan produk');
      }
      return await response.json();
    } catch (error) {
      console.error('API Error (createProduct):', error);
      throw error;
    }
  },

  // PUT /api/products/:id
  async updateProduct(id, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal mengupdate produk');
      }
      return await response.json();
    } catch (error) {
      console.error('API Error (updateProduct):', error);
      throw error;
    }
  },

  // DELETE /api/products/:id
  async deleteProduct(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menghapus produk');
      }
      return await response.json();
    } catch (error) {
      console.error('API Error (deleteProduct):', error);
      throw error;
    }
  }
};
