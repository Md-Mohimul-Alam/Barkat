const express = require('express');
const router = express.Router();
const loadingPointController = require('../controllers/loadingPointController');
const { body } = require('express-validator');
const auth = require('../middleware/auth');

// Validation rules
const loadingPointValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('type')
    .isIn(['Port', 'Storage', 'Vessel', 'Local', 'Factory', 'Warehouse'])
    .withMessage('Invalid type'),
  body('location')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),
  body('contactNumber')
    .optional()
    .matches(/^[0-9]{10,15}$/)
    .withMessage('Contact number must be 10-15 digits'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'maintenance'])
    .withMessage('Invalid status')
];

// Apply auth middleware to all routes
router.use(auth);

// Routes
router.get('/', loadingPointController.getAllLoadingPoints);
router.get('/statistics', loadingPointController.getStatistics);
router.get('/:id', loadingPointController.getLoadingPointById);
router.post('/', loadingPointValidation, loadingPointController.createLoadingPoint);
router.put('/:id', loadingPointValidation, loadingPointController.updateLoadingPoint);
router.delete('/:id', loadingPointController.deleteLoadingPoint);

module.exports = router;