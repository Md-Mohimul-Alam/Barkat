// models/Branch.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Branch = sequelize.define('Branch', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Branch name is required' },
        len: { args: [2, 100], msg: 'Branch name must be between 2 and 100 characters' }
      }
    },
    manager: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: { args: [0, 100], msg: 'Manager name cannot exceed 100 characters' }
      }
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: { args: /^[0-9]{10,15}$/, msg: 'Contact must be 10-15 digits' }
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Branch address is required' },
        len: { args: [1, 500], msg: 'Address cannot exceed 500 characters' }
      }
    },
    establishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: 'Please enter a valid date' }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: { msg: 'Please enter a valid email' }
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'branches',
    timestamps: true,
    freezeTableName: true // ✅ ADD THIS to prevent pluralization
  });

  // Add associations
  Branch.associate = function(models) {
    Branch.hasMany(models.Employee, {
      foreignKey: 'branchId',
      as: 'employees',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
  };

  return Branch;
};