require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
const PORT = 5053;

console.log('🔧 Building server progressively...');

// Phase 1: Basic middleware only
console.log('\n1. Testing basic middleware...');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log('✅ Basic middleware loaded');

// Phase 2: Basic routes
console.log('\n2. Testing basic routes...');
app.get('/', (req, res) => {
  res.json({ message: 'Basic server working' });
});
app.get('/api/db-status', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'disconnected', error: error.message });
  }
});
console.log('✅ Basic routes loaded');

// Phase 3: Import routes one by one with middleware
console.log('\n3. Testing routes with middleware...');

const { authenticate } = require('./middleware/auth');

// Test auth routes (public)
console.log('   Testing authRoutes (public)...');
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
console.log('   ✅ authRoutes loaded');

// Apply authentication middleware
console.log('   Applying authentication middleware...');
app.use(authenticate);
console.log('   ✅ Authentication middleware applied');

// Test protected routes one by one
console.log('   Testing protected routes...');

try {
  const userRoutes = require('./routes/userRoutes');
  app.use('/api/users', userRoutes);
  console.log('   ✅ userRoutes loaded');
} catch (error) {
  console.log('   ❌ userRoutes failed:', error.message);
}

try {
  const branchRoutes = require('./routes/branchRoutes');
  app.use('/api/branches', branchRoutes);
  console.log('   ✅ branchRoutes loaded');
} catch (error) {
  console.log('   ❌ branchRoutes failed:', error.message);
}

try {
  const clientRoutes = require('./routes/clientRoutes');
  app.use('/api/clients', clientRoutes);
  console.log('   ✅ clientRoutes loaded');
} catch (error) {
  console.log('   ❌ clientRoutes failed:', error.message);
}

try {
  const cnfRoutes = require('./routes/cnfRoutes');
  app.use('/api/cnfs', cnfRoutes);
  console.log('   ✅ cnfRoutes loaded');
} catch (error) {
  console.log('   ❌ cnfRoutes failed:', error.message);
}

try {
  const employeeRoutes = require('./routes/employeeRoutes');
  app.use('/api/employees', employeeRoutes);
  console.log('   ✅ employeeRoutes loaded');
} catch (error) {
  console.log('   ❌ employeeRoutes failed:', error.message);
}

try {
  const transportRoutes = require('./routes/transportRoutes');
  app.use('/api/transport', transportRoutes);
  console.log('   ✅ transportRoutes loaded');
} catch (error) {
  console.log('   ❌ transportRoutes failed:', error.message);
}

// Phase 4: Database connection
console.log('\n4. Testing database connection...');

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Database synchronized');
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Progressive server running on port ${PORT}`);
      console.log('✅ All phases completed successfully!');
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
};

startServer();