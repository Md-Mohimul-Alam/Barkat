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
      validate: {
        notEmpty: { msg: 'Branch name is required' }
      }
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Contact is required' }
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Address is required' }
      }
    },
    establishedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'Please enter a valid establishment date' }
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'branches',
    timestamps: true
  });

  Branch.associate = function(models) {
    Branch.hasMany(models.Employee, {
      foreignKey: 'branchId',
      as: 'employees'
    });
  };

  return Branch;
};