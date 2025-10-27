const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/', authorize(['admin']), userController.getAllUsers);
router.get('/stats/overview', authorize(['admin']), userController.getUserStats);
router.get('/profile/me', userController.getCurrentUser);
router.get('/:id', userController.getUserById);

router.post('/', authorize(['admin']), userController.createUser);
router.put('/profile/me', userController.updateCurrentUser);
router.put('/profile/password', userController.changePassword);
router.put('/profile/deactivate', userController.deactivateAccount);
router.put('/:id', userController.updateUser);
router.delete('/:id', authorize(['admin']), userController.deleteUser);

module.exports = router;