const express = require('express');
const router = express.Router();
const cnfController = require('../controllers/cnfController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// CNF routes
router.get('/', authorize(['admin', 'manager']), cnfController.getAllCNFs);
router.get('/:id', authorize(['admin', 'manager']), cnfController.getCNFById);

router.post('/', authorize(['admin', 'manager']), cnfController.createCNF);
router.put('/:id', authorize(['admin', 'manager']), cnfController.updateCNF);
router.delete('/:id', authorize(['admin', 'manager']), cnfController.deleteCNF);

module.exports = router;