const express = require('express');
const router = express.Router();
const db = require('./db');

// GET /api/products - Get all products
router.get('/products', (req, res) => {
  try {
    const products = db.getAll();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data produk' });
  }
});

// GET /api/products/:id - Get product by ID
router.get('/products/:id', (req, res) => {
  try {
    const product = db.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data produk' });
  }
});

// POST /api/products - Create new product
router.post('/products', (req, res) => {
  try {
    const { name, price, stock, category } = req.body;

    // Simple validation
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Nama barang wajib diisi' });
    }
    if (price === undefined || isNaN(price) || parseInt(price) < 0) {
      return res.status(400).json({ error: 'Harga barang harus berupa angka positif' });
    }
    if (stock === undefined || isNaN(stock) || parseInt(stock) < 0) {
      return res.status(400).json({ error: 'Stok barang harus berupa angka positif' });
    }
    if (!category || category.trim() === '') {
      return res.status(400).json({ error: 'Kategori barang wajib diisi' });
    }

    const newProduct = db.create({ name, price, stock, category });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menambahkan produk baru' });
  }
});

// PUT /api/products/:id - Update product by ID (price and stock, or name and category if provided)
router.put('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existingProduct = db.getById(id);

    if (!existingProduct) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }

    const { name, price, stock, category } = req.body;
    const updates = {};

    // Validate updates if provided
    if (name !== undefined) {
      if (name.trim() === '') return res.status(400).json({ error: 'Nama barang tidak boleh kosong' });
      updates.name = name;
    }
    if (price !== undefined) {
      if (isNaN(price) || parseInt(price) < 0) return res.status(400).json({ error: 'Harga barang harus positif' });
      updates.price = parseInt(price);
    }
    if (stock !== undefined) {
      if (isNaN(stock) || parseInt(stock) < 0) return res.status(400).json({ error: 'Stok barang harus positif' });
      updates.stock = parseInt(stock);
    }
    if (category !== undefined) {
      if (category.trim() === '') return res.status(400).json({ error: 'Kategori barang tidak boleh kosong' });
      updates.category = category;
    }

    const updatedProduct = db.update(id, updates);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengupdate produk' });
  }
});

// DELETE /api/products/:id - Delete product by ID
router.delete('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }

    res.json({ message: 'Produk berhasil dihapus', id: parseInt(id) });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menghapus produk' });
  }
});

module.exports = router;
