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

// ✅ CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Public Routes (no authentication required)
app.use('/api/auth', authRoutes);

// ✅ Apply authentication middleware to ALL protected routes
app.use(authenticate); // This runs for all routes below

// ✅ Protected Routes (authentication required)
app.use('/api/branches', branchRoutes);
app.use('/api/clients', clientRoute);
app.use('/api/cnfs', cnfsRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/transport', transportRoutes);

// ✅ Protected test routes (already have authenticate middleware)
app.get(
  '/api/dashboard',
  authorizeRoles('admin-dashboard', 'manager-dashboard', 'employee-dashboard'),
  (req, res) => {
    res.json({
      message: `Welcome ${req.user.name} to your dashboard!`,
      role: req.user.role
    });
  }
);

app.get('/api/admin/data', authorizeRoles('admin-dashboard'), (req, res) => {
  res.json({ message: 'Admin access granted.', stats: { users: 10, branches: 3 } });
});

// ✅ Health check (public)
app.get('/', (req, res) => {
  res.send('🚀 MBTSMS backend running...');
});

// ✅ Database connection test endpoint (public)
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

// ✅ Start server safely (no data wipe on restart)
const startServer = async () => {
  try {
    console.log('🔄 Attempting to connect to PostgreSQL...');

    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL');
    console.log(`📊 Database: ${sequelize.config.database}`);
    console.log(`🏠 Host: ${sequelize.config.host}`);

    console.log(`🔧 Running Sequelize sync in ${process.env.NODE_ENV || 'development'} mode...`);

    // ⚠️ Safe sync (no data deletion)
    if (process.env.NODE_ENV === 'development') {
      // In development: alter tables without dropping
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized with alter:true (non-destructive)');
    } else {
      // In production: no table changes, data stays safe
      await sequelize.sync();
      console.log('✅ Database synchronized (no schema change)');
    }

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