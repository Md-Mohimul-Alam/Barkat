// models/user.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Name is required' }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { 
        isEmail: { msg: 'Please enter a valid email' },
        notEmpty: { msg: 'Email is required' }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password is required' }
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'employee'),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Role is required' },
        isIn: {
          args: [['admin', 'manager', 'employee']],
          msg: 'Role must be admin, manager, or employee'
        }
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    freezeTableName: true
  });

  // Associations
  User.associate = function(models) {
    User.hasMany(models.Branch, {
      foreignKey: 'createdBy',
      as: 'createdBranches'
    });
    
    User.hasMany(models.Branch, {
      foreignKey: 'updatedBy',
      as: 'updatedBranches'
    });
    
    User.hasMany(models.Employee, {
      foreignKey: 'createdBy',
      as: 'createdEmployees'
    });
  };

  return User;
};