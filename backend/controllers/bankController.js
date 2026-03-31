// controllers/bankController.js
const { Bank, BankTransaction, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

// @desc    Get all banks with pagination and filtering
// @route   GET /api/banks
// @access  Private
const getAllBanks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      accountType,
      currency,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build where conditions
    let where = {};
    
    // Search across multiple fields
    if (search) {
      where[Op.or] = [
        { bankName: { [Op.iLike]: `%${search}%` } },
        { branchName: { [Op.iLike]: `%${search}%` } },
        { accountNumber: { [Op.iLike]: `%${search}%` } },
        { accountHolderName: { [Op.iLike]: `%${search}%` } },
        { swiftCode: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filter by status
    if (status) where.status = status;
    
    // Filter by account type
    if (accountType) where.accountType = accountType;
    
    // Filter by currency
    if (currency) where.currency = currency;

    const { count, rows: banks } = await Bank.findAndCountAll({
      where,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limitNum,
      offset: offset,
      distinct: true
    });

    const totalPages = Math.ceil(count / limitNum);

    // Calculate total balances
    const totalBalances = await Bank.getTotalBalance();

    res.status(200).json({
      success: true,
      message: 'Banks fetched successfully',
      data: banks,
      totalBalances,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBanks: count,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
        pageSize: limitNum
      }
    });
  } catch (error) {
    console.error('Get all banks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching banks',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Get single bank by ID
// @route   GET /api/banks/:id
// @access  Private
const getBankById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Bank ID is required'
      });
    }

    const bank = await Bank.findByPk(id, {
      include: [
        {
          model: BankTransaction,
          as: 'transactions',
          limit: 10,
          order: [['transactionDate', 'DESC']]
        }
      ]
    });

    if (!bank) {
      return res.status(404).json({
        success: false,
        message: 'Bank not found'
      });
    }

    // Get transaction statistics for this bank
    const transactionStats = await BankTransaction.findAll({
      where: { bankId: id },
      attributes: [
        'transactionType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ],
      group: ['transactionType']
    });

    res.status(200).json({
      success: true,
      message: 'Bank fetched successfully',
      data: {
        ...bank.toJSON(),
        transactionStats
      }
    });
  } catch (error) {
    console.error('Get bank by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bank',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Create new bank
// @route   POST /api/banks
// @access  Private
const createBank = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      bankName,
      branchName,
      accountNumber,
      accountType,
      accountHolderName,
      swiftCode,
      routingNumber,
      contactPerson,
      contactNumber,
      email,
      address,
      city,
      state,
      country,
      openingBalance,
      currency,
      openedDate,
      status,
      notes
    } = req.body;

    // Check if bank account already exists
    const existingBank = await Bank.findOne({ 
      where: { accountNumber } 
    });
    
    if (existingBank) {
      return res.status(409).json({
        success: false,
        message: 'Bank account with this account number already exists'
      });
    }

    // Create new bank
    const bank = await Bank.create({
      bankName: bankName.trim(),
      branchName: branchName.trim(),
      accountNumber: accountNumber.trim(),
      accountType: accountType || 'Current',
      accountHolderName: accountHolderName.trim(),
      swiftCode: swiftCode ? swiftCode.trim().toUpperCase() : null,
      routingNumber: routingNumber ? routingNumber.trim() : null,
      contactPerson: contactPerson ? contactPerson.trim() : null,
      contactNumber: contactNumber ? contactNumber.trim() : null,
      email: email ? email.toLowerCase().trim() : null,
      address: address ? address.trim() : null,
      city: city ? city.trim() : null,
      state: state ? state.trim() : null,
      country: country || 'Bangladesh',
      openingBalance: parseFloat(openingBalance) || 0.00,
      currentBalance: parseFloat(openingBalance) || 0.00,
      currency: currency || 'BDT',
      openedDate: openedDate ? new Date(openedDate) : new Date(),
      status: status || 'active',
      notes: notes ? notes.trim() : null,
      createdBy: req.user?.id
    });

    res.status(201).json({
      success: true,
      message: 'Bank created successfully',
      data: bank
    });
  } catch (error) {
    console.error('Create bank error:', error);
    
    // Handle Sequelize validation errors
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

    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Bank account with this account number already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating bank',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Update bank
// @route   PUT /api/banks/:id
// @access  Private
const updateBank = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = { ...req.body };

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Bank ID is required'
      });
    }

    // Check if bank exists
    const existingBank = await Bank.findByPk(id);
    if (!existingBank) {
      return res.status(404).json({
        success: false,
        message: 'Bank not found'
      });
    }

    // Check if account number is being changed and conflicts with existing bank
    if (updateData.accountNumber && updateData.accountNumber !== existingBank.accountNumber) {
      const bankWithSameAccount = await Bank.findOne({
        where: { 
          accountNumber: updateData.accountNumber,
          id: { [Op.ne]: id }
        }
      });
      if (bankWithSameAccount) {
        return res.status(409).json({
          success: false,
          message: 'Another bank account with this account number already exists'
        });
      }
    }

    // Trim string fields
    const stringFields = ['bankName', 'branchName', 'accountNumber', 'accountHolderName', 
                         'swiftCode', 'routingNumber', 'contactPerson', 'contactNumber', 
                         'email', 'address', 'city', 'state', 'country', 'notes'];
    
    stringFields.forEach(field => {
      if (updateData[field]) {
        updateData[field] = updateData[field].toString().trim();
        if (field === 'email') {
          updateData[field] = updateData[field].toLowerCase();
        }
        if (field === 'swiftCode') {
          updateData[field] = updateData[field].toUpperCase();
        }
      }
    });

    // Convert numeric fields
    if (updateData.openingBalance) {
      updateData.openingBalance = parseFloat(updateData.openingBalance);
      // Also update current balance if opening balance is changed
      const balanceDiff = updateData.openingBalance - existingBank.openingBalance;
      updateData.currentBalance = existingBank.currentBalance + balanceDiff;
    }

    // Add updatedBy information
    updateData.updatedBy = req.user?.id;

    // Update bank
    await Bank.update(updateData, {
      where: { id },
      individualHooks: true
    });

    // Fetch updated bank
    const updatedBank = await Bank.findByPk(id);

    res.status(200).json({
      success: true,
      message: 'Bank updated successfully',
      data: updatedBank
    });
  } catch (error) {
    console.error('Update bank error:', error);
    
    // Handle Sequelize validation errors
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

    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Another bank account with this account number already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating bank',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Delete bank (soft delete by changing status)
// @route   DELETE /api/banks/:id
// @access  Private
const deleteBank = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Bank ID is required'
      });
    }

    const bank = await Bank.findByPk(id);
    
    if (!bank) {
      return res.status(404).json({
        success: false,
        message: 'Bank not found'
      });
    }

    // Check if bank has transactions
    const transactionCount = await BankTransaction.count({ where: { bankId: id } });
    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete bank that has transactions. Change status to closed instead.'
      });
    }

    // Soft delete by changing status to closed
    await Bank.update(
      { status: 'closed', updatedBy: req.user?.id },
      { where: { id } }
    );

    res.status(200).json({
      success: true,
      message: 'Bank status changed to closed successfully',
      data: {
        id: bank.id,
        bankName: bank.bankName,
        accountNumber: bank.accountNumber,
        status: 'closed'
      }
    });
  } catch (error) {
    console.error('Delete bank error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting bank',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Get bank transactions
// @route   GET /api/banks/:id/transactions
// @access  Private
const getBankTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      transactionType,
      status,
      search,
      sortBy = 'transactionDate',
      sortOrder = 'DESC'
    } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Bank ID is required'
      });
    }

    // Check if bank exists
    const bank = await Bank.findByPk(id);
    if (!bank) {
      return res.status(404).json({
        success: false,
        message: 'Bank not found'
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build where conditions
    let where = { bankId: id };
    
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
      ]
    });

    const totalPages = Math.ceil(count / limitNum);

    // Calculate summary statistics
    const summary = await BankTransaction.findAll({
      where: { bankId: id },
      attributes: [
        [sequelize.fn('SUM', 
          sequelize.literal(`CASE 
            WHEN "transactionType" IN ('deposit', 'receipt', 'interest') THEN amount 
            ELSE 0 
          END`)
        ), 'totalCredit'],
        [sequelize.fn('SUM', 
          sequelize.literal(`CASE 
            WHEN "transactionType" IN ('withdrawal', 'payment', 'fee', 'transfer') THEN amount 
            ELSE 0 
          END`)
        ), 'totalDebit'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalTransactions']
      ],
      raw: true
    });

    res.status(200).json({
      success: true,
      message: 'Bank transactions fetched successfully',
      data: transactions,
      summary: summary[0] || { totalCredit: 0, totalDebit: 0, totalTransactions: 0 },
      bank: {
        id: bank.id,
        bankName: bank.bankName,
        accountNumber: bank.accountNumber,
        currentBalance: bank.currentBalance,
        currency: bank.currency
      },
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
    console.error('Get bank transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bank transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Create bank transaction
// @route   POST /api/banks/:id/transactions
// @access  Private
const createBankTransaction = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const {
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

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Bank ID is required'
      });
    }

    // Check if bank exists and is active
    const bank = await Bank.findByPk(id);
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
      bankId: id,
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
    const updatedBank = await Bank.findByPk(id);

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
    console.error('Create bank transaction error:', error);
    
    // Handle Sequelize validation errors
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

    // Handle insufficient balance error
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
};

// @desc    Get bank statistics
// @route   GET /api/banks/stats/overview
// @access  Private
const getBankStats = async (req, res) => {
  try {
    // Total banks count
    const totalBanks = await Bank.count();
    
    // Active banks count
    const activeBanks = await Bank.count({ where: { status: 'active' } });
    
    // Total balance by currency
    const totalBalanceByCurrency = await Bank.getTotalBalance();
    
    // Total balance across all currencies
    const totalOverallBalance = totalBalanceByCurrency.reduce((sum, item) => {
      return sum + parseFloat(item.dataValues.totalBalance || 0);
    }, 0);
    
    // Recent transactions
    const recentTransactions = await BankTransaction.findAll({
      include: [{
        model: Bank,
        as: 'bank',
        attributes: ['id', 'bankName', 'accountNumber']
      }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    // Transaction statistics
    const transactionStats = await BankTransaction.findAll({
      attributes: [
        'transactionType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ],
      group: ['transactionType']
    });
    
    // Monthly transaction summary
    const monthlySummary = await BankTransaction.findAll({
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('transactionDate')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transactionCount'],
        [sequelize.fn('SUM', 
          sequelize.literal(`CASE 
            WHEN "transactionType" IN ('deposit', 'receipt', 'interest') THEN amount 
            ELSE 0 
          END`)
        ), 'totalCredit'],
        [sequelize.fn('SUM', 
          sequelize.literal(`CASE 
            WHEN "transactionType" IN ('withdrawal', 'payment', 'fee', 'transfer') THEN amount 
            ELSE 0 
          END`)
        ), 'totalDebit']
      ],
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('transactionDate'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('transactionDate')), 'DESC']],
      limit: 6
    });

    res.status(200).json({
      success: true,
      message: 'Bank statistics fetched successfully',
      data: {
        totalBanks,
        activeBanks,
        inactiveBanks: totalBanks - activeBanks,
        totalOverallBalance,
        totalBalanceByCurrency,
        recentTransactions,
        transactionStats,
        monthlySummary
      }
    });
  } catch (error) {
    console.error('Get bank stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bank statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Get transaction by ID
// @route   GET /api/banks/transactions/:id
// @access  Private
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    const transaction = await BankTransaction.findByPk(id, {
      include: [
        {
          model: Bank,
          as: 'bank',
          attributes: ['id', 'bankName', 'accountNumber', 'accountHolderName', 'currency']
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction fetched successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Update transaction
// @route   PUT /api/banks/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = { ...req.body };

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    // Find transaction
    const transaction = await BankTransaction.findByPk(id, {
      include: [{ model: Bank, as: 'bank' }]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if transaction is reconciled
    if (transaction.reconciled) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update reconciled transaction'
      });
    }

    // If amount is being changed, need to recalculate bank balance
    if (updateData.amount && parseFloat(updateData.amount) !== parseFloat(transaction.amount)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change transaction amount. Please delete and create a new transaction.'
      });
    }

    // If transaction type is being changed, need to recalculate bank balance
    if (updateData.transactionType && updateData.transactionType !== transaction.transactionType) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change transaction type. Please delete and create a new transaction.'
      });
    }

    // Trim string fields
    const stringFields = ['description', 'referenceNumber', 'chequeNumber', 
                         'beneficiaryName', 'beneficiaryAccount', 'remarks'];
    
    stringFields.forEach(field => {
      if (updateData[field]) {
        updateData[field] = updateData[field].toString().trim();
      }
    });

    // Update transaction
    await transaction.update(updateData);

    // Fetch updated transaction
    const updatedTransaction = await BankTransaction.findByPk(id, {
      include: [{ model: Bank, as: 'bank' }]
    });

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: updatedTransaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    
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

    res.status(500).json({
      success: false,
      message: 'Server error while updating transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/banks/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    const transaction = await BankTransaction.findByPk(id, {
      include: [{ model: Bank, as: 'bank' }]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if transaction is reconciled
    if (transaction.reconciled) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete reconciled transaction'
      });
    }

    const bank = transaction.bank;
    const amount = parseFloat(transaction.amount);
    const transactionType = transaction.transactionType;

    // Calculate new bank balance by reversing the transaction
    let newBalance = parseFloat(bank.currentBalance);
    
    if (transactionType === 'deposit' || 
        transactionType === 'receipt' || 
        transactionType === 'interest') {
      newBalance = newBalance - amount;
    } else if (transactionType === 'withdrawal' || 
              transactionType === 'payment' || 
              transactionType === 'fee' ||
              transactionType === 'transfer') {
      newBalance = newBalance + amount;
    }

    // Update bank balance
    await Bank.update(
      { currentBalance: newBalance },
      { where: { id: bank.id } }
    );

    // Delete transaction
    await transaction.destroy();

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      data: {
        transactionId: id,
        bank: {
          id: bank.id,
          bankName: bank.bankName,
          newBalance: newBalance,
          currency: bank.currency
        }
      }
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Reconcile transaction
// @route   PUT /api/banks/transactions/:id/reconcile
// @access  Private
const reconcileTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { reconciled } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    const transaction = await BankTransaction.findByPk(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await transaction.update({
      reconciled: reconciled !== undefined ? reconciled : true,
      reconciledDate: reconciled !== false ? new Date() : null
    });

    // Update bank's last reconciliation date
    if (reconciled !== false) {
      await Bank.update(
        { lastReconciliationDate: new Date() },
        { where: { id: transaction.bankId } }
      );
    }

    const updatedTransaction = await BankTransaction.findByPk(id);

    res.status(200).json({
      success: true,
      message: `Transaction ${reconciled !== false ? 'reconciled' : 'unreconciled'} successfully`,
      data: updatedTransaction
    });
  } catch (error) {
    console.error('Reconcile transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reconciling transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Export bank statement
// @route   GET /api/banks/:id/statement
// @access  Private
const exportBankStatement = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, format = 'pdf' } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Bank ID is required'
      });
    }

    // Check if bank exists
    const bank = await Bank.findByPk(id);
    if (!bank) {
      return res.status(404).json({
        success: false,
        message: 'Bank not found'
      });
    }

    // Build where conditions for date range
    let where = { bankId: id };
    
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate[Op.gte] = new Date(startDate);
      if (endDate) where.transactionDate[Op.lte] = new Date(endDate);
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      where.transactionDate = { [Op.gte]: thirtyDaysAgo };
    }

    // Get transactions for statement
    const transactions = await BankTransaction.findAll({
      where,
      order: [['transactionDate', 'ASC']],
      include: [{
        model: Bank,
        as: 'bank',
        attributes: ['bankName', 'accountNumber', 'accountHolderName', 'currency']
      }]
    });

    // Calculate opening balance (balance before first transaction in range)
    const firstTransaction = await BankTransaction.findOne({
      where: {
        bankId: id,
        transactionDate: { [Op.lt]: where.transactionDate ? where.transactionDate[Op.gte] : thirtyDaysAgo }
      },
      order: [['transactionDate', 'DESC']]
    });

    const openingBalance = firstTransaction 
      ? parseFloat(firstTransaction.balanceAfter) - parseFloat(firstTransaction.amount) * 
        (firstTransaction.transactionType === 'deposit' || firstTransaction.transactionType === 'receipt' || 
         firstTransaction.transactionType === 'interest' ? -1 : 1)
      : parseFloat(bank.openingBalance);

    // Calculate closing balance (current bank balance)
    const closingBalance = parseFloat(bank.currentBalance);

    // Calculate summary
    const summary = {
      openingBalance,
      totalCredit: 0,
      totalDebit: 0,
      closingBalance
    };

    transactions.forEach(txn => {
      if (txn.transactionType === 'deposit' || txn.transactionType === 'receipt' || txn.transactionType === 'interest') {
        summary.totalCredit += parseFloat(txn.amount);
      } else {
        summary.totalDebit += parseFloat(txn.amount);
      }
    });

    const statementData = {
      bank: {
        bankName: bank.bankName,
        branchName: bank.branchName,
        accountNumber: bank.accountNumber,
        accountHolderName: bank.accountHolderName,
        currency: bank.currency
      },
      period: {
        startDate: where.transactionDate ? where.transactionDate[Op.gte] : thirtyDaysAgo,
        endDate: where.transactionDate ? where.transactionDate[Op.lte] : new Date()
      },
      summary,
      transactions
    };

    if (format === 'json') {
      res.status(200).json({
        success: true,
        message: 'Bank statement generated successfully',
        data: statementData
      });
    } else {
      // For PDF export, you would use a PDF generation library
      // This is a simplified response
      res.status(200).json({
        success: true,
        message: 'PDF export functionality would be implemented here',
        data: statementData,
        exportType: 'pdf'
      });
    }
  } catch (error) {
    console.error('Export bank statement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting bank statement',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

module.exports = {
  getAllBanks,
  getBankById,
  createBank,
  updateBank,
  deleteBank,
  getBankTransactions,
  createBankTransaction,
  getBankStats,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  reconcileTransaction,
  exportBankStatement
};