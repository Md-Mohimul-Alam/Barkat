// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const branchRoutes = require('./routes/branchRoutes');
const transportRoutes = require('./routes/transportRoutes');
const { authenticate, authorizeRoles } = require('./middlewares/auth');

dotenv.config();

const app = express();

// CORS Config for frontend
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/transport', transportRoutes);

// Protected test routes
app.get(
  "/api/dashboard",
  authenticate,
  authorizeRoles("admin-dashboard", "manager-dashboard", "employee-dashboard"),
  (req, res) => {
    res.json({
      message: `Welcome ${req.user.name} to your dashboard!`,
      role: req.user.role
    });
  }
);


app.get('/api/admin/data',
  authenticate,
  authorizeRoles('admin-dashboard'),
  (req, res) => {
    res.json({ message: 'Admin access granted.', stats: { users: 10, branches: 3 } });
  }
);

// Health check
app.get('/', (req, res) => {
  res.send('🚀 MBTSMS backend running...');
});

// Server
const PORT = process.env.PORT || 5050;
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Connected to PostgreSQL`);
  } catch (err) {
    console.error('❌ DB Connection Error:', err.message);
  }

  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
