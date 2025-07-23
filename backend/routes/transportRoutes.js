const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transportController');

// All transport statements
router.get('/', transportController.getAllStatements);
router.post('/', transportController.createStatement);

// Routes with a specific date
router.get('/by-date/:date', transportController.getStatementByDate);
router.put('/by-date/:date', transportController.updateStatement);
router.delete('/by-date/:date', transportController.deleteStatement);

module.exports = router;
