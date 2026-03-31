// routes/bankTransactionRoutes.js
const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bankController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validation');

// Validation rules
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
  body('transactionDate')
    .optional()
    .isISO8601()
    .withMessage('Please enter a valid date (YYYY-MM-DD)'),
  body('referenceNumber')
    .optional()
    .trim(),
  body('category')
    .optional()
    .trim()
    .isIn(['General', 'Salary', 'Rent', 'Utilities', 'Supplies', 'Transport', 'Other'])
    .withMessage('Invalid category'),
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'cheque', 'online', 'card', 'transfer', 'dd'])
    .withMessage('Invalid payment method'),
  body('chequeNumber')
    .optional()
    .trim(),
  body('chequeDate')
    .optional()
    .isISO8601()
    .withMessage('Please enter a valid cheque date (YYYY-MM-DD)'),
  body('beneficiaryName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Beneficiary name must be between 2 and 100 characters'),
  body('beneficiaryAccount')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['completed', 'pending', 'failed', 'cancelled', 'reconciled'])
    .withMessage('Invalid status'),
  body('remarks')
    .optional()
    .trim(),
  body('attachmentUrl')
    .optional()
    .isURL()
    .withMessage('Please enter a valid URL for attachment')
];

const updateTransactionValidation = [
  body('description')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Description must be between 2 and 255 characters'),
  body('category')
    .optional()
    .trim()
    .isIn(['General', 'Salary', 'Rent', 'Utilities', 'Supplies', 'Transport', 'Other'])
    .withMessage('Invalid category'),
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'cheque', 'online', 'card', 'transfer', 'dd'])
    .withMessage('Invalid payment method'),
  body('chequeNumber')
    .optional()
    .trim(),
  body('chequeDate')
    .optional()
    .isISO8601()
    .withMessage('Please enter a valid cheque date (YYYY-MM-DD)'),
  body('beneficiaryName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Beneficiary name must be between 2 and 100 characters'),
  body('beneficiaryAccount')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['completed', 'pending', 'failed', 'cancelled', 'reconciled'])
    .withMessage('Invalid status'),
  body('remarks')
    .optional()
    .trim(),
  body('attachmentUrl')
    .optional()
    .isURL()
    .withMessage('Please enter a valid URL for attachment')
];

// Query parameter validation
const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be in ISO8601 format (YYYY-MM-DD)'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be in ISO8601 format (YYYY-MM-DD)'),
  query('transactionType')
    .optional()
    .isIn(['deposit', 'withdrawal', 'transfer', 'fee', 'interest', 'payment', 'receipt'])
    .withMessage('Invalid transaction type'),
  query('status')
    .optional()
    .isIn(['completed', 'pending', 'failed', 'cancelled', 'reconciled'])
    .withMessage('Invalid status'),
  query('search')
    .optional()
    .trim(),
  query('sortBy')
    .optional()
    .isIn(['transactionDate', 'amount', 'createdAt', 'transactionType'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Sort order must be ASC or DESC'),
  query('reconciled')
    .optional()
    .isBoolean()
    .withMessage('Reconciled must be true or false'),
  query('minAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum amount must be a positive number'),
  query('maxAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum amount must be a positive number')
];

// All routes require authentication
router.use(authenticate);

// ================================
// TRANSACTION ROUTES
// ================================

// @desc    Get all transactions (with filtering)
// @route   GET /api/transactions
// @access  Private (Admin/Manager/Accountant)
router.get(
  '/',
  authorize(['admin', 'manager', 'accountant']),
  queryValidation,
  validate,
  bankController.getAllTransactions || async (req, res) => {
    // Fallback implementation if not in controller
    try {
      const {
        page = 1,
        limit = 10,
        startDate,
        endDate,
        transactionType,
        status,
        search,
        reconciled,
        minAmount,
        maxAmount,
        sortBy = 'transactionDate',
        sortOrder = 'DESC'
      } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      const { BankTransaction, Bank } = require('../models');
      const { Op } = require('sequelize');

      let where = {};
      
      // Date range filter
      if (startDate || endDate) {
        where.transactionDate = {};
        if (startDate) where.transactionDate[Op.gte] = new Date(startDate);
        if (endDate) where.transactionDate[Op.lte] = new Date(endDate);
      }

      // Filter by transaction type
      if (transactionType) where.transactionType = transactionType;
      
      // Filter by status
      if (status) where.status = status;
      
      // Filter by reconciled status
      if (reconciled !== undefined) where.reconciled = reconciled === 'true';
      
      // Amount range filter
      if (minAmount || maxAmount) {
        where.amount = {};
        if (minAmount) where.amount[Op.gte] = parseFloat(minAmount);
        if (maxAmount) where.amount[Op.lte] = parseFloat(maxAmount);
      }
      
      // Search
      if (search) {
        where[Op.or] = [
          { description: { [Op.iLike]: `%${search}%` } },
          { transactionNumber: { [Op.iLike]: `%${search}%` } },
          { referenceNumber: { [Op.iLike]: `%${search}%` } },
          { chequeNumber: { [Op.iLike]: `%${search}%` } },
          { beneficiaryName: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows: transactions } = await BankTransaction.findAndCountAll({
        where,
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: limitNum,
        offset: offset,
        include: [
          {
            model: Bank,
            as: 'bank',
            attributes: ['id', 'bankName', 'accountNumber', 'currency']
          }
        ],
        distinct: true
      });

      const totalPages = Math.ceil(count / limitNum);

      // Calculate summary
      const summary = await BankTransaction.findAll({
        where,
        attributes: [
          [require('sequelize').fn('SUM', 
            require('sequelize').literal(`CASE 
              WHEN "transactionType" IN ('deposit', 'receipt', 'interest') THEN amount 
              ELSE 0 
            END`)
          ), 'totalCredit'],
          [require('sequelize').fn('SUM', 
            require('sequelize').literal(`CASE 
              WHEN "transactionType" IN ('withdrawal', 'payment', 'fee', 'transfer') THEN amount 
              ELSE 0 
            END`)
          ), 'totalDebit'],
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalTransactions']
        ],
        raw: true
      });

      res.status(200).json({
        success: true,
        message: 'Transactions fetched successfully',
        data: transactions,
        summary: summary[0] || { totalCredit: 0, totalDebit: 0, totalTransactions: 0 },
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalTransactions: count,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
          pageSize: limitNum
        }
      });
    } catch (error) {
      console.error('Get all transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching transactions',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }
);

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
router.get(
  '/:id',
  param('id').isUUID().withMessage('Invalid transaction ID'),
  validate,
  bankController.getTransactionById
);

// @desc    Create transaction for specific bank
// @route   POST /api/transactions/bank/:bankId
// @access  Private (Admin/Manager/Accountant)
router.post(
  '/bank/:bankId',
  authorize(['admin', 'manager', 'accountant']),
  param('bankId').isUUID().withMessage('Invalid bank ID'),
  transactionValidation,
  validate,
  bankController.createBankTransaction
);

// @desc    Create standalone transaction
// @route   POST /api/transactions
// @access  Private (Admin/Manager/Accountant)
router.post(
  '/',
  authorize(['admin', 'manager', 'accountant']),
  transactionValidation,
  validate,
  async (req, res) => {
    try {
      const {
        bankId,
        transactionDate,
        transactionType,
        amount,
        description,
        referenceNumber,
        category,
        paymentMethod,
        chequeNumber,
        chequeDate,
        beneficiaryName,
        beneficiaryAccount,
        status,
        remarks,
        attachmentUrl
      } = req.body;

      if (!bankId) {
        return res.status(400).json({
          success: false,
          message: 'Bank ID is required'
        });
      }

      const { Bank, BankTransaction } = require('../models');

      // Check if bank exists and is active
      const bank = await Bank.findByPk(bankId);
      if (!bank) {
        return res.status(404).json({
          success: false,
          message: 'Bank not found'
        });
      }

      if (bank.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Cannot add transaction to inactive bank account'
        });
      }

      // Create transaction
      const transaction = await BankTransaction.create({
        bankId,
        transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
        transactionType,
        amount: parseFloat(amount),
        description: description.trim(),
        referenceNumber: referenceNumber ? referenceNumber.trim() : null,
        category: category || 'General',
        paymentMethod: paymentMethod || 'cash',
        chequeNumber: chequeNumber ? chequeNumber.trim() : null,
        chequeDate: chequeDate ? new Date(chequeDate) : null,
        beneficiaryName: beneficiaryName ? beneficiaryName.trim() : null,
        beneficiaryAccount: beneficiaryAccount ? beneficiaryAccount.trim() : null,
        status: status || 'completed',
        remarks: remarks ? remarks.trim() : null,
        attachmentUrl: attachmentUrl || null,
        createdBy: req.user?.id
      });

      // Fetch updated bank balance
      const updatedBank = await Bank.findByPk(bankId);

      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: {
          transaction,
          bank: {
            id: updatedBank.id,
            bankName: updatedBank.bankName,
            currentBalance: updatedBank.currentBalance,
            currency: updatedBank.currency
          }
        }
      });
    } catch (error) {
      console.error('Create transaction error:', error);
      
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => ({
          field: err.path,
          message: err.message,
          value: err.value
        }));
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }

      if (error.message === 'Insufficient balance in bank account') {
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance in bank account'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error while creating transaction',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }
);

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private (Admin/Manager/Accountant)
router.put(
  '/:id',
  authorize(['admin', 'manager', 'accountant']),
  param('id').isUUID().withMessage('Invalid transaction ID'),
  updateTransactionValidation,
  validate,
  bankController.updateTransaction
);

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private (Admin/Manager/Accountant)
router.delete(
  '/:id',
  authorize(['admin', 'manager', 'accountant']),
  param('id').isUUID().withMessage('Invalid transaction ID'),
  validate,
  bankController.deleteTransaction
);

// @desc    Reconcile transaction
// @route   PUT /api/transactions/:id/reconcile
// @access  Private (Admin/Manager/Accountant)
router.put(
  '/:id/reconcile',
  authorize(['admin', 'manager', 'accountant']),
  param('id').isUUID().withMessage('Invalid transaction ID'),
  body('reconciled')
    .optional()
    .isBoolean()
    .withMessage('Reconciled must be true or false'),
  validate,
  bankController.reconcileTransaction
);

// @desc    Bulk reconcile transactions
// @route   PUT /api/transactions/bulk/reconcile
// @access  Private (Admin/Manager/Accountant)
router.put(
  '/bulk/reconcile',
  authorize(['admin', 'manager', 'accountant']),
  body('transactionIds')
    .isArray()
    .withMessage('Transaction IDs must be an array')
    .isLength({ min: 1 })
    .withMessage('At least one transaction ID is required'),
  body('reconciled')
    .isBoolean()
    .withMessage('Reconciled must be true or false'),
  validate,
  async (req, res) => {
    try {
      const { transactionIds, reconciled } = req.body;

      const { BankTransaction, Bank } = require('../models');
      const { Op } = require('sequelize');

      // Update all transactions
      const [updatedCount] = await BankTransaction.update(
        {
          reconciled,
          reconciledDate: reconciled ? new Date() : null
        },
        {
          where: {
            id: {
              [Op.in]: transactionIds
            }
          }
        }
      );

      // Update banks' last reconciliation date
      if (reconciled && updatedCount > 0) {
        // Get unique bank IDs from updated transactions
        const transactions = await BankTransaction.findAll({
          where: {
            id: {
              [Op.in]: transactionIds
            }
          },
          attributes: ['bankId'],
          group: ['bankId']
        });

        const bankIds = transactions.map(t => t.bankId);
        
        await Bank.update(
          { lastReconciliationDate: new Date() },
          {
            where: {
              id: {
                [Op.in]: bankIds
              }
            }
          }
        );
      }

      res.status(200).json({
        success: true,
        message: `${updatedCount} transaction(s) ${reconciled ? 'reconciled' : 'unreconciled'} successfully`,
        data: {
          updatedCount,
          reconciled
        }
      });
    } catch (error) {
      console.error('Bulk reconcile error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while bulk reconciling transactions',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }
);

// @desc    Bulk delete transactions
// @route   DELETE /api/transactions/bulk
// @access  Private (Admin/Manager)
router.delete(
  '/bulk',
  authorize(['admin', 'manager']),
  body('transactionIds')
    .isArray()
    .withMessage('Transaction IDs must be an array')
    .isLength({ min: 1 })
    .withMessage('At least one transaction ID is required'),
  validate,
  async (req, res) => {
    try {
      const { transactionIds } = req.body;

      const { BankTransaction, Bank } = require('../models');
      const { Op } = require('sequelize');

      // Get transactions with bank info
      const transactions = await BankTransaction.findAll({
        where: {
          id: {
            [Op.in]: transactionIds
          }
        },
        include: [{
          model: Bank,
          as: 'bank'
        }]
      });

      // Check if any transactions are reconciled
      const reconciledTransactions = transactions.filter(t => t.reconciled);
      if (reconciledTransactions.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete ${reconciledTransactions.length} reconciled transaction(s)`
        });
      }

      // Group transactions by bank for balance adjustment
      const bankUpdates = {};
      
      transactions.forEach(transaction => {
        const bank = transaction.bank;
        const amount = parseFloat(transaction.amount);
        const transactionType = transaction.transactionType;

        if (!bankUpdates[bank.id]) {
          bankUpdates[bank.id] = {
            bank: bank,
            adjustment: 0
          };
        }

        // Calculate balance adjustment (reverse the transaction)
        if (transactionType === 'deposit' || 
            transactionType === 'receipt' || 
            transactionType === 'interest') {
          bankUpdates[bank.id].adjustment -= amount;
        } else if (transactionType === 'withdrawal' || 
                  transactionType === 'payment' || 
                  transactionType === 'fee' ||
                  transactionType === 'transfer') {
          bankUpdates[bank.id].adjustment += amount;
        }
      });

      // Update bank balances
      for (const [bankId, update] of Object.entries(bankUpdates)) {
        const newBalance = parseFloat(update.bank.currentBalance) + update.adjustment;
        await Bank.update(
          { currentBalance: newBalance },
          { where: { id: bankId } }
        );
      }

      // Delete transactions
      const deletedCount = await BankTransaction.destroy({
        where: {
          id: {
            [Op.in]: transactionIds
          }
        }
      });

      res.status(200).json({
        success: true,
        message: `${deletedCount} transaction(s) deleted successfully`,
        data: {
          deletedCount,
          transactionIds
        }
      });
    } catch (error) {
      console.error('Bulk delete transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while bulk deleting transactions',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }
);

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats/overview
// @access  Private (Admin/Manager/Accountant)
router.get(
  '/stats/overview',
  authorize(['admin', 'manager', 'accountant']),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const { BankTransaction } = require('../models');
      const { Op } = require('sequelize');
      const sequelize = require('sequelize');

      let where = {};
      
      // Date range filter
      if (startDate || endDate) {
        where.transactionDate = {};
        if (startDate) where.transactionDate[Op.gte] = new Date(startDate);
        if (endDate) where.transactionDate[Op.lte] = new Date(endDate);
      }

      // Today's transactions
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayWhere = { ...where, transactionDate: { [Op.gte]: today, [Op.lt]: tomorrow } };
      
      const todayStats = await BankTransaction.findAll({
        where: todayWhere,
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', 
            sequelize.literal(`CASE 
              WHEN "transactionType" IN ('deposit', 'receipt', 'interest') THEN amount 
              ELSE 0 
            END`)
          ), 'todayCredit'],
          [sequelize.fn('SUM', 
            sequelize.literal(`CASE 
              WHEN "transactionType" IN ('withdrawal', 'payment', 'fee', 'transfer') THEN amount 
              ELSE 0 
            END`)
          ), 'todayDebit']
        ],
        raw: true
      });

      // This month's transactions
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const firstDayNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

      const monthWhere = { ...where, transactionDate: { [Op.gte]: firstDayOfMonth, [Op.lt]: firstDayNextMonth } };
      
      const monthStats = await BankTransaction.findAll({
        where: monthWhere,
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', 
            sequelize.literal(`CASE 
              WHEN "transactionType" IN ('deposit', 'receipt', 'interest') THEN amount 
              ELSE 0 
            END`)
          ), 'monthCredit'],
          [sequelize.fn('SUM', 
            sequelize.literal(`CASE 
              WHEN "transactionType" IN ('withdrawal', 'payment', 'fee', 'transfer') THEN amount 
              ELSE 0 
            END`)
          ), 'monthDebit']
        ],
        raw: true
      });

      // Transaction type distribution
      const typeDistribution = await BankTransaction.findAll({
        where,
        attributes: [
          'transactionType',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
        ],
        group: ['transactionType'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
      });

      // Status distribution
      const statusDistribution = await BankTransaction.findAll({
        where,
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      // Recent transactions
      const recentTransactions = await BankTransaction.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: 10,
        include: [{
          model: require('../models').Bank,
          as: 'bank',
          attributes: ['id', 'bankName', 'accountNumber']
        }]
      });

      // Daily transaction trend (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const trendWhere = { ...where, transactionDate: { [Op.gte]: sevenDaysAgo } };
      
      const dailyTrend = await BankTransaction.findAll({
        where: trendWhere,
        attributes: [
          [sequelize.fn('DATE', sequelize.col('transactionDate')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', 
            sequelize.literal(`CASE 
              WHEN "transactionType" IN ('deposit', 'receipt', 'interest') THEN amount 
              ELSE 0 
            END`)
          ), 'credit'],
          [sequelize.fn('SUM', 
            sequelize.literal(`CASE 
              WHEN "transactionType" IN ('withdrawal', 'payment', 'fee', 'transfer') THEN amount 
              ELSE 0 
            END`)
          ), 'debit']
        ],
        group: [sequelize.fn('DATE', sequelize.col('transactionDate'))],
        order: [[sequelize.fn('DATE', sequelize.col('transactionDate')), 'ASC']]
      });

      const stats = {
        today: todayStats[0] || { count: 0, todayCredit: 0, todayDebit: 0 },
        thisMonth: monthStats[0] || { count: 0, monthCredit: 0, monthDebit: 0 },
        typeDistribution,
        statusDistribution,
        recentTransactions,
        dailyTrend
      };

      res.status(200).json({
        success: true,
        message: 'Transaction statistics fetched successfully',
        data: stats
      });
    } catch (error) {
      console.error('Get transaction stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching transaction statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }
);

// @desc    Export transactions to CSV
// @route   GET /api/transactions/export/csv
// @access  Private (Admin/Manager/Accountant)
router.get(
  '/export/csv',
  authorize(['admin', 'manager', 'accountant']),
  queryValidation,
  validate,
  async (req, res) => {
    try {
      const { startDate, endDate, transactionType, status } = req.query;

      const { BankTransaction, Bank } = require('../models');
      const { Op } = require('sequelize');

      let where = {};
      
      // Date range filter
      if (startDate || endDate) {
        where.transactionDate = {};
        if (startDate) where.transactionDate[Op.gte] = new Date(startDate);
        if (endDate) where.transactionDate[Op.lte] = new Date(endDate);
      }

      // Filter by transaction type
      if (transactionType) where.transactionType = transactionType;
      
      // Filter by status
      if (status) where.status = status;

      const transactions = await BankTransaction.findAll({
        where,
        order: [['transactionDate', 'ASC']],
        include: [{
          model: Bank,
          as: 'bank',
          attributes: ['bankName', 'accountNumber', 'currency']
        }]
      });

      // Convert to CSV format
      const csvHeaders = [
        'Transaction ID',
        'Date',
        'Bank',
        'Account Number',
        'Type',
        'Amount',
        'Currency',
        'Description',
        'Reference',
        'Status',
        'Payment Method',
        'Beneficiary',
        'Reconciled'
      ];

      const csvRows = transactions.map(txn => [
        txn.transactionNumber,
        new Date(txn.transactionDate).toISOString().split('T')[0],
        txn.bank?.bankName || '',
        txn.bank?.accountNumber || '',
        txn.transactionType,
        txn.amount,
        txn.bank?.currency || 'BDT',
        txn.description,
        txn.referenceNumber || '',
        txn.status,
        txn.paymentMethod || '',
        txn.beneficiaryName || '',
        txn.reconciled ? 'Yes' : 'No'
      ]);

      // Add header row
      csvRows.unshift(csvHeaders);

      // Convert to CSV string
      const csvContent = csvRows.map(row => row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma
        const cellStr = String(cell || '');
        if (cellStr.includes(',') || cellStr.includes('"')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')).join('\n');

      // Set response headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
      res.status(200).send(csvContent);

    } catch (error) {
      console.error('Export transactions CSV error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while exporting transactions to CSV',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }
);

// @desc    Search transactions
// @route   GET /api/transactions/search
// @access  Private
router.get(
  '/search',
  query('q')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query is required'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  validate,
  async (req, res) => {
    try {
      const { q, limit = 10 } = req.query;

      const { BankTransaction, Bank } = require('../models');
      const { Op } = require('sequelize');

      const transactions = await BankTransaction.findAll({
        where: {
          [Op.or]: [
            { description: { [Op.iLike]: `%${q}%` } },
            { transactionNumber: { [Op.iLike]: `%${q}%` } },
            { referenceNumber: { [Op.iLike]: `%${q}%` } },
            { chequeNumber: { [Op.iLike]: `%${q}%` } },
            { beneficiaryName: { [Op.iLike]: `%${q}%` } }
          ]
        },
        limit: parseInt(limit),
        order: [['transactionDate', 'DESC']],
        include: [{
          model: Bank,
          as: 'bank',
          attributes: ['id', 'bankName', 'accountNumber']
        }]
      });

      res.status(200).json({
        success: true,
        message: 'Transactions search completed',
        data: transactions,
        searchQuery: q,
        count: transactions.length
      });
    } catch (error) {
      console.error('Search transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while searching transactions',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }
);

// ================================
// BANK-SPECIFIC TRANSACTION ROUTES
// ================================

// @desc    Get transactions for specific bank
// @route   GET /api/banks/:bankId/transactions
// @access  Private
router.get(
  '/banks/:bankId/transactions',
  param('bankId').isUUID().withMessage('Invalid bank ID'),
  queryValidation,
  validate,
  bankController.getBankTransactions
);

// @desc    Create transaction for specific bank
// @route   POST /api/banks/:bankId/transactions
// @access  Private (Admin/Manager/Accountant)
router.post(
  '/banks/:bankId/transactions',
  authorize(['admin', 'manager', 'accountant']),
  param('bankId').isUUID().withMessage('Invalid bank ID'),
  transactionValidation,
  validate,
  bankController.createBankTransaction
);

// @desc    Get bank statement
// @route   GET /api/banks/:bankId/statement
// @access  Private
router.get(
  '/banks/:bankId/statement',
  param('bankId').isUUID().withMessage('Invalid bank ID'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be in ISO8601 format (YYYY-MM-DD)'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be in ISO8601 format (YYYY-MM-DD)'),
  query('format')
    .optional()
    .isIn(['json', 'pdf', 'csv'])
    .withMessage('Format must be json, pdf, or csv'),
  validate,
  bankController.exportBankStatement
);

module.exports = router;