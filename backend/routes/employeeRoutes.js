const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Employee routes
router.get('/', employeeController.getAllEmployees);
router.get('/stats/overview', employeeController.getEmployeeStats);
router.get('/managers', employeeController.getManagers);
router.get('/branch/:branchId', employeeController.getEmployeesByBranch);
router.get('/:id', employeeController.getEmployeeById);

router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.patch('/bulk', authorize(['admin', 'manager']), employeeController.bulkUpdateEmployees);
router.delete('/:id', authorize(['admin', 'manager']), employeeController.deleteEmployee);

module.exports = router;