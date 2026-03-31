// models/BankTransaction.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const BankTransaction = sequelize.define('BankTransaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    bankId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'banks',
        key: 'id'
      }
    },
    transactionDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: { msg: 'Please enter a valid date' }
      }
    },
    transactionNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    referenceNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    transactionType: {
      type: DataTypes.ENUM('deposit', 'withdrawal', 'transfer', 'fee', 'interest', 'payment', 'receipt'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['deposit', 'withdrawal', 'transfer', 'fee', 'interest', 'payment', 'receipt']],
          msg: 'Invalid transaction type'
        }
      }
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: { args: [0.01], msg: 'Amount must be greater than 0' }
      }
    },
    balanceAfter: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Description is required' },
        len: { args: [2, 255], msg: 'Description must be between 2 and 255 characters' }
      }
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'General'
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'cheque', 'online', 'card', 'transfer', 'dd'),
      allowNull: true,
      defaultValue: 'cash'
    },
    chequeNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    chequeDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    beneficiaryName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    beneficiaryAccount: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('completed', 'pending', 'failed', 'cancelled', 'reconciled'),
      defaultValue: 'completed',
      validate: {
        isIn: {
          args: [['completed', 'pending', 'failed', 'cancelled', 'reconciled']],
          msg: 'Invalid status'
        }
      }
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    attachmentUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reconciled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    reconciledDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    tableName: 'bank_transactions',
    timestamps: true,
    indexes: [
      {
        fields: ['bankId']
      },
      {
        fields: ['transactionDate']
      },
      {
        fields: ['transactionType']
      },
      {
        fields: ['transactionNumber'],
        unique: true
      },
      {
        fields: ['status']
      }
    ],
    hooks: {
      beforeCreate: async (transaction) => {
        // Generate transaction number if not provided
        if (!transaction.transactionNumber) {
          const date = new Date();
          const prefix = 'TRX' + date.getFullYear().toString().slice(-2) + 
                        (date.getMonth() + 1).toString().padStart(2, '0');
          const count = await sequelize.models.BankTransaction.count({
            where: {
              transactionNumber: {
                [sequelize.Op.like]: `${prefix}%`
              }
            }
          });
          transaction.transactionNumber = `${prefix}${(count + 1).toString().padStart(6, '0')}`;
        }
        
        // Update bank balance
        const Bank = sequelize.models.Bank;
        const bank = await Bank.findByPk(transaction.bankId);
        
        if (!bank) {
          throw new Error('Bank not found');
        }
        
        // Calculate new balance
        let newBalance;
        const amount = parseFloat(transaction.amount);
        const currentBalance = parseFloat(bank.currentBalance);
        
        if (transaction.transactionType === 'deposit' || 
            transaction.transactionType === 'receipt' || 
            transaction.transactionType === 'interest') {
          newBalance = currentBalance + amount;
        } else if (transaction.transactionType === 'withdrawal' || 
                  transaction.transactionType === 'payment' || 
                  transaction.transactionType === 'fee' ||
                  transaction.transactionType === 'transfer') {
          newBalance = currentBalance - amount;
          if (newBalance < 0) {
            throw new Error('Insufficient balance in bank account');
          }
        }
        
        transaction.balanceAfter = newBalance;
        
        // Update bank balance
        await Bank.update(
          { currentBalance: newBalance },
          { where: { id: transaction.bankId } }
        );
      },
      
      beforeValidate: (transaction) => {
        // Trim string fields
        if (transaction.description) transaction.description = transaction.description.trim();
        if (transaction.referenceNumber) transaction.referenceNumber = transaction.referenceNumber.trim();
        if (transaction.chequeNumber) transaction.chequeNumber = transaction.chequeNumber.trim();
        if (transaction.beneficiaryName) transaction.beneficiaryName = transaction.beneficiaryName.trim();
        if (transaction.beneficiaryAccount) transaction.beneficiaryAccount = transaction.beneficiaryAccount.trim();
        if (transaction.remarks) transaction.remarks = transaction.remarks.trim();
        if (transaction.category) transaction.category = transaction.category.trim();
      }
    }
  });

  BankTransaction.associate = function(models) {
    BankTransaction.belongsTo(models.Bank, {
      foreignKey: 'bankId',
      as: 'bank'
    });
    
    BankTransaction.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
  };

  return BankTransaction;
};