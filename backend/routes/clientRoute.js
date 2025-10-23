// routes/clientRoute.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authenticate, authorizeRoles } = require('../middlewares/auth'); // Fix path to middlewares

// Apply authentication to all client routes
router.use(authenticate);

// Client routes - all roles can access basic client operations
router.get('/', clientController.getClients);
router.post('/', clientController.createClient);
router.get('/search', clientController.searchClients);
router.get('/stats', authorizeRoles('admin-dashboard', 'manager-dashboard'), clientController.getClientStats);
router.get('/filters', clientController.getClientsWithFilters);
router.post('/bulk-update', authorizeRoles('admin-dashboard', 'manager-dashboard'), clientController.bulkUpdateClients);
router.get('/:id', clientController.getClientById);
router.put('/:id', clientController.updateClient);
router.delete('/:id', authorizeRoles('admin-dashboard', 'manager-dashboard'), clientController.deleteClient);

module.exports = router;