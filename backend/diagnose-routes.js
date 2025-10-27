require('dotenv').config();
const express = require('express');

const app = express();
const PORT = 5051;

console.log('🔍 Diagnosing route issues...');

// Test each route file individually
const routeFiles = [
  { name: 'authRoutes', path: './routes/authRoutes', basePath: '/api/auth' },
  { name: 'userRoutes', path: './routes/userRoutes', basePath: '/api/users' },
  { name: 'branchRoutes', path: './routes/branchRoutes', basePath: '/api/branches' },
  { name: 'clientRoutes', path: './routes/clientRoutes', basePath: '/api/clients' },
  { name: 'cnfRoutes', path: './routes/cnfRoutes', basePath: '/api/cnfs' },
  { name: 'employeeRoutes', path: './routes/employeeRoutes', basePath: '/api/employees' },
  { name: 'transportRoutes', path: './routes/transportRoutes', basePath: '/api/transport' }
];

let problematicFile = null;

for (const routeFile of routeFiles) {
  try {
    console.log(`\n🔄 Testing ${routeFile.name}...`);
    delete require.cache[require.resolve(routeFile.path)];
    const routes = require(routeFile.path);
    app.use(routeFile.basePath, routes);
    console.log(`✅ ${routeFile.name} loaded successfully`);
  } catch (error) {
    console.log(`❌ ${routeFile.name} FAILED: ${error.message}`);
    problematicFile = routeFile.name;
    break;
  }
}

if (problematicFile) {
  console.log(`\n🎯 PROBLEM FOUND: ${problematicFile} is causing the issue`);
  console.log('Please check this file for invalid route patterns');
} else {
  console.log('\n✅ All route files loaded successfully');
  console.log('The issue might be elsewhere');
}

app.get('/', (req, res) => {
  res.json({ message: 'Diagnostic server running' });
});

app.listen(PORT, () => {
  console.log(`\n🔧 Diagnostic server running on port ${PORT}`);
});