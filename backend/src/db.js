const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'products.json');

// Default initial data for simulation
const initialProducts = [
  { id: 1, name: "Indomie Goreng Spesial", price: 3500, stock: 150, category: "Makanan" },
  { id: 2, name: "Aqua Botol 600ml", price: 4000, stock: 80, category: "Minuman" },
  { id: 3, name: "Buku Tulis Kiky A5", price: 7500, stock: 45, category: "Alat Tulis" },
  { id: 4, name: "Pulpen Pilot Ballliner Black", price: 12000, stock: 8, category: "Alat Tulis" },
  { id: 5, name: "Susu UHT Ultra Milk Cokelat 250ml", price: 6500, stock: 120, category: "Minuman" },
  { id: 6, name: "Chiki Taro Net Rumput Laut", price: 5000, stock: 3, category: "Makanan" }
];

function initDB() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(initialProducts, null, 2), 'utf-8');
  }
}

function readData() {
  initDB();
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file, resetting to initial state', err);
    return initialProducts;
  }
}

function writeData(data) {
  initDB();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

const db = {
  getAll() {
    return readData();
  },

  getById(id) {
    const products = readData();
    return products.find(p => p.id === parseInt(id)) || null;
  },

  create(productData) {
    const products = readData();
    
    // Auto Increment ID
    const maxId = products.reduce((max, p) => p.id > max ? p.id : max, 0);
    const newId = maxId + 1;

    const newProduct = {
      id: newId,
      name: String(productData.name || '').trim(),
      price: parseInt(productData.price) || 0,
      stock: parseInt(productData.stock) || 0,
      category: String(productData.category || 'Lainnya').trim()
    };

    products.push(newProduct);
    writeData(products);
    return newProduct;
  },

  update(id, updates) {
    const products = readData();
    const index = products.findIndex(p => p.id === parseInt(id));
    if (index === -1) return null;

    const current = products[index];

    // Merge updates
    const updated = {
      ...current,
      name: updates.name !== undefined ? String(updates.name).trim() : current.name,
      price: updates.price !== undefined ? parseInt(updates.price) : current.price,
      stock: updates.stock !== undefined ? parseInt(updates.stock) : current.stock,
      category: updates.category !== undefined ? String(updates.category).trim() : current.category
    };

    // Ensure valid values
    if (updated.price < 0) updated.price = 0;
    if (updated.stock < 0) updated.stock = 0;

    products[index] = updated;
    writeData(products);
    return updated;
  },

  delete(id) {
    const products = readData();
    const initialLength = products.length;
    const filtered = products.filter(p => p.id !== parseInt(id));
    
    if (filtered.length === initialLength) {
      return false; // Not found
    }

    writeData(filtered);
    return true;
  }
};

module.exports = db;
