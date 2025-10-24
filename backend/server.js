// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const branchRoutes = require('./routes/branchRoutes');
const clientRoute = require('./routes/clientRoute');
const cnfsRoutes = require('./routes/cnfRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const transportRoutes = require('./routes/transportRoutes');
const { authenticate, authorizeRoles } = require('./middlewares/auth');

const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/clients', clientRoute);
app.use('/api/cnfs', cnfsRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/transport', transportRoutes);

// Protected test routes
app.get('/api/dashboard', authenticate, authorizeRoles('admin-dashboard', 'manager-dashboard', 'employee-dashboard'), (req, res) => {
  res.json({
    message: `Welcome ${req.user.name} to your dashboard!`,
    role: req.user.role
  });
});

app.get('/api/admin/data', authenticate, authorizeRoles('admin-dashboard'), (req, res) => {
  res.json({ message: 'Admin access granted.', stats: { users: 10, branches: 3 } });
});

// Health check
app.get('/', (req, res) => {
  res.send('🚀 MBTSMS backend running...');
});

// Database connection test endpoint
app.get('/api/db-status', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'connected', 
      database: sequelize.config.database,
      host: sequelize.config.host 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'disconnected', 
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 5050;

// Start server
const startServer = async () => {
  try {
    console.log('🔄 Attempting to connect to PostgreSQL...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL');
    console.log(`📊 Database: ${sequelize.config.database}`);
    console.log(`🏠 Host: ${sequelize.config.host}`);

    // Sync models - use { force: true } to drop and recreate tables
    console.log('🔄 Syncing database models...');
    await sequelize.sync({ force: true }); // ✅ CHANGE THIS to force: true temporarily
    console.log('✅ All models synced successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error details:', error.message);
    process.exit(1);
  }
};
startServer();