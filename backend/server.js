const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const apiRoutes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Catch-all route for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Terjadi kesalahan sistem internal!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` LOGISTIK ELSA SERVER RUNNING IN DEVELOPMENT MODE`);
  console.log(`==================================================`);
  console.log(`> Server is active at: http://localhost:${PORT}`);
  console.log(`> REST API Endpoint  : http://localhost:${PORT}/api/products`);
  console.log(`==================================================`);
});
