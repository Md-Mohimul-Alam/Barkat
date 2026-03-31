// models/Bank.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Bank = sequelize.define('Bank', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Bank name is required' },
        len: { args: [2, 100], msg: 'Bank name must be between 2 and 100 characters' }
      }
    },
    branchName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Branch name is required' },
        len: { args: [2, 100], msg: 'Branch name must be between 2 and 100 characters' }
      }
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'banks_account_number_unique',
        msg: 'Bank account number must be unique'
      },
      validate: {
        notEmpty: { msg: 'Account number is required' },
        len: { args: [8, 20], msg: 'Account number must be between 8 and 20 characters' }
      }
    },
    accountType: {
      type: DataTypes.ENUM('Current', 'Savings', 'Salary', 'Fixed Deposit', 'Corporate', 'Business'),
      allowNull: false,
      defaultValue: 'Current',
      validate: {
        isIn: {
          args: [['Current', 'Savings', 'Salary', 'Fixed Deposit', 'Corporate', 'Business']],
          msg: 'Invalid account type'
        }
      }
    },
    accountHolderName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Account holder name is required' },
        len: { args: [2, 100], msg: 'Account holder name must be between 2 and 100 characters' }
      }
    },
    bankCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    swiftCode: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: { args: [8, 11], msg: 'SWIFT code must be between 8 and 11 characters' }
      }
    },
    routingNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contactPerson: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contactNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: { args: /^[0-9]{10,15}$/, msg: 'Contact number must be 10-15 digits' }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: { msg: 'Please enter a valid email' }
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Bangladesh'
    },
    openingBalance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: { args: [0], msg: 'Opening balance cannot be negative' }
      }
    },
    currentBalance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: { args: [0], msg: 'Current balance cannot be negative' }
      }
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'BDT',
      validate: {
        isIn: {
          args: [['BDT', 'USD', 'EUR', 'GBP']],
          msg: 'Currency must be one of: BDT, USD, EUR, GBP'
        }
      }
    },
    openedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: { msg: 'Please enter a valid date' }
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended', 'closed'),
      defaultValue: 'active',
      validate: {
        isIn: {
          args: [['active', 'inactive', 'suspended', 'closed']],
          msg: 'Status must be either active, inactive, suspended, or closed'
        }
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lastReconciliationDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'banks',
    timestamps: true,
    indexes: [
      {
        fields: ['accountNumber'],
        unique: true
      },
      {
        fields: ['bankName']
      },
      {
        fields: ['branchName']
      },
      {
        fields: ['status']
      }
    ],
    hooks: {
      beforeValidate: (bank) => {
        if (!bank.country) bank.country = 'Bangladesh';
        if (!bank.currency) bank.currency = 'BDT';
        if (!bank.openedDate) bank.openedDate = new Date();
        
        // Trim string fields
        if (bank.bankName) bank.bankName = bank.bankName.trim();
        if (bank.branchName) bank.branchName = bank.branchName.trim();
        if (bank.accountNumber) bank.accountNumber = bank.accountNumber.trim();
        if (bank.accountHolderName) bank.accountHolderName = bank.accountHolderName.trim();
        if (bank.swiftCode) bank.swiftCode = bank.swiftCode.trim().toUpperCase();
        if (bank.contactPerson) bank.contactPerson = bank.contactPerson.trim();
        if (bank.contactNumber) bank.contactNumber = bank.contactNumber.trim();
        if (bank.email) bank.email = bank.email.toLowerCase().trim();
        if (bank.address) bank.address = bank.address.trim();
        if (bank.city) bank.city = bank.city.trim();
        if (bank.state) bank.state = bank.state.trim();
        
        // Ensure current balance matches opening balance initially
        if (bank.isNewRecord) {
          bank.currentBalance = bank.openingBalance || 0.00;
        }
      }
    }
  });

  Bank.associate = function(models) {
    Bank.hasMany(models.BankTransaction, {
      foreignKey: 'bankId',
      as: 'transactions',
      onDelete: 'CASCADE'
    });
    
    Bank.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    
    Bank.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updater'
    });
  };

  // Instance methods
  Bank.prototype.updateBalance = async function(amount, type) {
    if (type === 'credit') {
      this.currentBalance = parseFloat(this.currentBalance) + parseFloat(amount);
    } else if (type === 'debit') {
      const newBalance = parseFloat(this.currentBalance) - parseFloat(amount);
      if (newBalance < 0) {
        throw new Error('Insufficient balance');
      }
      this.currentBalance = newBalance;
    }
    await this.save();
    return this.currentBalance;
  };

  Bank.prototype.getBalanceInfo = function() {
    return {
      openingBalance: this.openingBalance,
      currentBalance: this.currentBalance,
      currency: this.currency,
      lastUpdated: this.updatedAt
    };
  };

  Bank.prototype.isActive = function() {
    return this.status === 'active';
  };

  // Static methods
  Bank.getTotalBalance = async function() {
    const result = await this.findAll({
      where: { status: 'active' },
      attributes: [
        'currency',
        [sequelize.fn('SUM', sequelize.col('currentBalance')), 'totalBalance']
      ],
      group: ['currency']
    });
    return result;
  };

  return Bank;
};