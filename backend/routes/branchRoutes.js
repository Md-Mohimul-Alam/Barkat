const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Branch routes
router.get('/', branchController.getBranches);
router.get('/stats/overview', branchController.getBranchStats);
router.get('/city/:city', branchController.getBranchesByCity);
router.get('/:id', branchController.getBranchById);
router.get('/:branchId/employees', branchController.getBranchEmployees);

// Test endpoint (remove in production)
router.get('/test/test-branches', branchController.testBranches);

router.post('/', authorize(['admin', 'manager']), branchController.createBranch);
router.put('/:id', authorize(['admin', 'manager']), branchController.updateBranch);
router.delete('/:id', authorize(['admin']), branchController.deleteBranch);

module.exports = router;