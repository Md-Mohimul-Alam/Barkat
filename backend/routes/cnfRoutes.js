// backend/routes/cnfRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middlewares/auth');
const cnfController = require('../controllers/cnfController');

// All CNF routes - authenticate FIRST, then authorizeRoles
router.get('/', authenticate, authorizeRoles('admin', 'manager'), cnfController.getAllCNFs);
router.get('/:id', authenticate, authorizeRoles('admin', 'manager'), cnfController.getCNFById);
router.post('/', authenticate, authorizeRoles('admin', 'manager'), cnfController.createCNF);
router.put('/:id', authenticate, authorizeRoles('admin', 'manager'), cnfController.updateCNF);
router.delete('/:id', authenticate, authorizeRoles('admin', 'manager'), cnfController.deleteCNF);

module.exports = router;