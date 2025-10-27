require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5050;

console.log('🚀 Starting MBTS Backend Server...');

// 1. Basic middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 MBTSMS Backend API is running!',
    timestamp: new Date().toISOString(),
    status: 'operational'
  });
});

app.get('/api/db-status', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      success: true,
      status: 'connected',
      database: sequelize.config.database,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

console.log('✅ Basic middleware and routes loaded');

// 3. Public routes (NO authentication)
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes loaded');

// ✅ FIX: Create authentication middleware that only applies to specific routes
const { authenticate } = require('./middleware/auth');

// 4. Protected routes - apply authentication individually
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', authenticate, userRoutes);
console.log('✅ User routes loaded');

const branchRoutes = require('./routes/branchRoutes');
app.use('/api/branches', authenticate, branchRoutes);
console.log('✅ Branch routes loaded');

const clientRoutes = require('./routes/clientRoutes');
app.use('/api/clients', authenticate, clientRoutes);
console.log('✅ Client routes loaded');

const cnfRoutes = require('./routes/cnfRoutes');
app.use('/api/cnfs', authenticate, cnfRoutes);
console.log('✅ CNF routes loaded');

const employeeRoutes = require('./routes/employeeRoutes');
app.use('/api/employees', authenticate, employeeRoutes);
console.log('✅ Employee routes loaded');

const transportRoutes = require('./routes/transportRoutes');
app.use('/api/transport', authenticate, transportRoutes);
console.log('✅ Transport routes loaded');

// 5. Test protected route
app.get('/api/protected-test', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Protected route accessed successfully',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// 6. Error handling
app.use((error, req, res, next) => {
  console.error('❌ Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// 7. 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    timestamp: new Date().toISOString()
  });
});

// 8. Start server
const startServer = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Database synchronized');
    
    app.listen(PORT, () => {
      console.log(`\n🎉 Server successfully started on http://localhost:${PORT}`);
      console.log('📋 Available endpoints:');
      console.log('   GET  /              - Health check');
      console.log('   GET  /api/db-status - Database status');
      console.log('   POST /api/auth/login - User login');
      console.log('   POST /api/auth/register - User registration');
      console.log('   GET  /api/protected-test - Test protected route');
      console.log('\n✨ Server is ready to accept requests!');
    });
    
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();