// routes/employeeRoutes.js
const express = require('express');
const router = express.Router();

// Import middleware
const { authorizeRoles } = require('../middlewares/auth');

// Import validation - FIX: Import validateBulkUpdate
const { 
  validateEmployee, 
  validateEmployeeUpdate, 
  validateBulkUpdate 
} = require('../middlewares/validation');

// Import controllers
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  bulkUpdateEmployees
} = require('../controllers/employeeController');

// Apply routes
router.get('/', authorizeRoles('admin', 'manager', 'user'), getAllEmployees);
router.get('/:id', authorizeRoles('admin', 'manager', 'user'), getEmployeeById);
router.post('/', authorizeRoles('admin', 'manager'), validateEmployee, createEmployee);
router.put('/:id', authorizeRoles('admin', 'manager'), validateEmployeeUpdate, updateEmployee);
router.delete('/:id', authorizeRoles('admin'), deleteEmployee);
router.patch('/bulk', authorizeRoles('admin', 'manager'), validateBulkUpdate, bulkUpdateEmployees);

module.exports = router;