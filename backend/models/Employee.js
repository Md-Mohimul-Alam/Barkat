// models/Employee.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define('Employee', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Employee name is required' },
        len: { args: [2, 100], msg: 'Name must be between 2 and 100 characters' }
      }
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Position is required' },
        len: { args: [2, 50], msg: 'Position must be between 2 and 50 characters' }
      }
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Contact number is required' },
        is: { args: /^[0-9]{10,15}$/, msg: 'Contact must be 10-15 digits' }
      }
    },
    whatsapp: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: { args: /^[0-9]{10,15}$/, msg: 'WhatsApp must be 10-15 digits' }
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
    nid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'NID number is required' },
        is: { args: /^[0-9]{10,17}$/, msg: 'NID must be 10-17 digits' }
      }
    },
    dob: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'Please enter a valid date of birth' },
        notEmpty: { msg: 'Date of birth is required' }
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Address is required' },
        len: { args: [1, 500], msg: 'Address cannot exceed 500 characters' }
      }
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: 'Salary cannot be negative' },
        notEmpty: { msg: 'Salary is required' }
      }
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'Please enter a valid join date' },
        notEmpty: { msg: 'Join date is required' }
      }
    },
    branchId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'branches',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'on-leave'),
      defaultValue: 'active',
      validate: {
        isIn: { args: [['active', 'inactive', 'on-leave']], msg: 'Invalid status' }
      }
    }
  }, {
    tableName: 'employees',
    timestamps: true,
    hooks: {
      beforeValidate: (employee) => {
        // Trim string fields
        if (employee.name) employee.name = employee.name.trim();
        if (employee.position) employee.position = employee.position.trim();
        if (employee.contact) employee.contact = employee.contact.trim();
        if (employee.whatsapp) employee.whatsapp = employee.whatsapp.trim();
        if (employee.address) employee.address = employee.address.trim();
        if (employee.email) employee.email = employee.email.toLowerCase().trim();
      }
    }
  });

  // Associations
  Employee.associate = function(models) {
    Employee.belongsTo(models.Branch, {
      foreignKey: 'branchId',
      as: 'branch',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
  };

  // Instance methods
  Employee.prototype.getAge = function() {
    if (!this.dob) return null;
    const today = new Date();
    const birthDate = new Date(this.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  Employee.prototype.getEmploymentDuration = function() {
    if (!this.joinedAt) return null;
    const join = new Date(this.joinedAt);
    const today = new Date();
    const diffTime = Math.abs(today - join);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}${months > 0 ? `, ${months} month${months > 1 ? 's' : ''}` : ''}`;
    }
    return `${months} month${months > 1 ? 's' : ''}`;
  };

  return Employee;
};