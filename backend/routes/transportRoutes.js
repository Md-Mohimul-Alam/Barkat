// routes/transportRoutes.js

const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transportController');

router.get('/', transportController.getAllStatements);
router.get('/:date', transportController.getStatementByDate);
router.post('/', transportController.createStatement);
router.put('/:date', transportController.updateStatement);
router.delete('/:date', transportController.deleteStatement);

module.exports = router;
