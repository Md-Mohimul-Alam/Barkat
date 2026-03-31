// routes/bankRoutes.js
const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bankController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');

// Validation rules
const bankValidation = [
  body('bankName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Bank name must be between 2 and 100 characters'),
  body('branchName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Branch name must be between 2 and 100 characters'),
  body('accountNumber')
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage('Account number must be between 8 and 20 characters'),
  body('accountType')
    .isIn(['Current', 'Savings', 'Salary', 'Fixed Deposit', 'Corporate', 'Business'])
    .withMessage('Invalid account type'),
  body('accountHolderName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Account holder name must be between 2 and 100 characters'),
  body('swiftCode')
    .optional()
    .isLength({ min: 8, max: 11 })
    .withMessage('SWIFT code must be between 8 and 11 characters'),
  body('contactNumber')
    .optional()
    .matches(/^[0-9]{10,15}$/)
    .withMessage('Contact number must be 10-15 digits'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('openingBalance')
    .isFloat({ min: 0 })
    .withMessage('Opening balance must be a positive number'),
  body('currency')
    .optional()
    .isIn(['BDT', 'USD', 'EUR', 'GBP'])
    .withMessage('Currency must be one of: BDT, USD, EUR, GBP'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended', 'closed'])
    .withMessage('Invalid status')
];

const transactionValidation = [
  body('transactionType')
    .isIn(['deposit', 'withdrawal', 'transfer', 'fee', 'interest', 'payment', 'receipt'])
    .withMessage('Invalid transaction type'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('description')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Description must be between 2 and 255 characters'),
  body('chequeNumber')
    .optional()
    .trim(),
  body('beneficiaryName')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['completed', 'pending', 'failed', 'cancelled', 'reconciled'])
    .withMessage('Invalid status')
];

// All routes require authentication
router.use(authenticate);

// Bank routes
router.get('/', bankController.getAllBanks);
router.get('/stats/overview', bankController.getBankStats);
router.get('/:id', bankController.getBankById);
router.get('/:id/statement', bankController.exportBankStatement);
router.get('/:id/transactions', bankController.getBankTransactions);

router.post('/', bankValidation, bankController.createBank);
router.put('/:id', bankValidation, bankController.updateBank);
router.delete('/:id', bankController.deleteBank);

// Transaction routes
router.post('/:id/transactions', transactionValidation, bankController.createBankTransaction);

// Transaction specific routes
router.get('/transactions/:id', bankController.getTransactionById);
router.put('/transactions/:id', transactionValidation, bankController.updateTransaction);
router.delete('/transactions/:id', bankController.deleteTransaction);
router.put('/transactions/:id/reconcile', bankController.reconcileTransaction);

module.exports = router;