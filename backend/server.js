// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models'); // make sure this exports { sequelize }
const authRoutes = require('./routes/auth');
const branchRoutes = require('./routes/branchRoutes');
const clientRoute = require('./routes/clientRoute');
const transportRoutes = require('./routes/transportRoutes');
const { authenticate, authorizeRoles } = require('./middlewares/auth');

const app = express();

// ✅ CORS configuration for frontend
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/clients', clientRoute);
app.use('/api/transport', transportRoutes);

// ✅ Protected test routes
app.get(
  '/api/dashboard',
  authenticate,
  authorizeRoles('admin-dashboard', 'manager-dashboard', 'employee-dashboard'),
  (req, res) => {
    res.json({
      message: `Welcome ${req.user.name} to your dashboard!`,
      role: req.user.role
    });
  }
);

app.get(
  '/api/admin/data',
  authenticate,
  authorizeRoles('admin-dashboard'),
  (req, res) => {
    res.json({ message: 'Admin access granted.', stats: { users: 10, branches: 3 } });
  }
);

// ✅ Health check
app.get('/', (req, res) => {
  res.send('🚀 MBTSMS backend running...');
});

// ✅ Start server and sync DB
const PORT = process.env.PORT || 5050;

app.listen(PORT, async () => {
  try {
    // 1️⃣ Authenticate DB connection
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL');

    // 2️⃣ Sync models (creates tables if missing)
    await sequelize.sync({ alter: true }); // use `force: true` only if you want to drop & recreate tables
    console.log('✅ All models synced successfully');

    console.log(`✅ Backend server running on http://localhost:${PORT}`);
  } catch (err) {
    console.error('❌ DB Connection / Sync Error:', err.message);
  }
});
