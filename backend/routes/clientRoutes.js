const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Client routes
router.get('/', clientController.getClients);
router.get('/search', clientController.searchClients);
router.get('/stats', authorize(['admin', 'manager']), clientController.getClientStats);
router.get('/filters', clientController.getClientsWithFilters);
router.get('/:id', clientController.getClientById);

router.post('/', clientController.createClient);
router.post('/bulk-update', authorize(['admin', 'manager']), clientController.bulkUpdateClients);
router.put('/:id', clientController.updateClient);
router.delete('/:id', authorize(['admin', 'manager']), clientController.deleteClient);

module.exports = router;