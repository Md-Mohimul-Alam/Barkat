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
      unique: {
        name: 'employees_email_unique',
        msg: 'Employee with this email already exists'
      },
      validate: {
        isEmail: { msg: 'Please enter a valid email' },
        notEmpty: { msg: 'Email is required' }
      }
    },
    nid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'employees_nid_unique',
        msg: 'Employee with this NID already exists'
      },
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
        notEmpty: { msg: 'Date of birth is required' },
        isBefore: {
          args: new Date().toISOString(),
          msg: 'Date of birth must be in the past'
        }
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Address is required' },
        len: { args: [10, 500], msg: 'Address must be between 10 and 500 characters' }
      }
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { 
          args: [0], 
          msg: 'Salary cannot be negative' 
        },
        max: {
          args: [99999999.99],
          msg: 'Salary cannot exceed 99,999,999.99'
        },
        notEmpty: { msg: 'Salary is required' }
      }
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'Please enter a valid join date' },
        notEmpty: { msg: 'Join date is required' },
        isBefore: {
          args: new Date().toISOString(),
          msg: 'Join date cannot be in the future'
        }
      }
    },
    branchId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'branches',
        key: 'id'
      },
      validate: {
        notEmpty: { msg: 'Branch selection is required' }
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'on-leave'),
      defaultValue: 'active',
      validate: {
        isIn: { 
          args: [['active', 'inactive', 'on-leave']], 
          msg: 'Status must be either active, inactive, or on-leave' 
        }
      }
    },
    isManager: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {
    tableName: 'employees',
    timestamps: true,
    indexes: [
      {
        fields: ['email'],
        unique: true
      },
      {
        fields: ['nid'],
        unique: true
      },
      {
        fields: ['branchId']
      },
      {
        fields: ['isManager']
      },
      {
        fields: ['status']
      },
      {
        fields: ['position']
      }
    ],
    hooks: {
      beforeValidate: (employee) => {
        // Trim string fields
        if (employee.name) employee.name = employee.name.trim();
        if (employee.position) employee.position = employee.position.trim();
        if (employee.contact) employee.contact = employee.contact.trim();
        if (employee.whatsapp) employee.whatsapp = employee.whatsapp.trim();
        if (employee.address) employee.address = employee.address.trim();
        if (employee.email) employee.email = employee.email.toLowerCase().trim();
        if (employee.nid) employee.nid = employee.nid.trim();
        
        // Validate dates
        if (employee.dob && employee.joinedAt) {
          const dob = new Date(employee.dob);
          const joinDate = new Date(employee.joinedAt);
          
          if (joinDate < dob) {
            throw new Error('Join date cannot be before date of birth');
          }
          
          // Validate employee is at least 18 years old
          const age = new Date().getFullYear() - dob.getFullYear();
          const monthDiff = new Date().getMonth() - dob.getMonth();
          const actualAge = monthDiff < 0 || (monthDiff === 0 && new Date().getDate() < dob.getDate()) ? age - 1 : age;
          
          if (actualAge < 18) {
            throw new Error('Employee must be at least 18 years old');
          }
        }
      },
      
      afterCreate: async (employee, options) => {
        if (employee.isManager) {
          const { Branch } = sequelize.models;
          try {
            await Branch.update(
              { managerId: employee.id },
              { 
                where: { id: employee.branchId },
                transaction: options.transaction 
              }
            );
            console.log(`✅ Employee ${employee.id} assigned as manager for branch ${employee.branchId}`);
          } catch (error) {
            console.error('❌ Error assigning manager to branch:', error);
          }
        }
      },
      
      afterUpdate: async (employee, options) => {
        const { Branch } = sequelize.models;
        
        if (employee.changed('isManager') && employee.isManager) {
          try {
            await Branch.update(
              { managerId: employee.id },
              { 
                where: { id: employee.branchId },
                transaction: options.transaction 
              }
            );
            console.log(`✅ Employee ${employee.id} assigned as manager for branch ${employee.branchId}`);
          } catch (error) {
            console.error('❌ Error assigning manager to branch:', error);
          }
        }
        
        if (employee.changed('isManager') && !employee.isManager) {
          try {
            await Branch.update(
              { managerId: null },
              { 
                where: { 
                  id: employee.branchId,
                  managerId: employee.id 
                },
                transaction: options.transaction 
              }
            );
            console.log(`✅ Employee ${employee.id} removed as manager from branch ${employee.branchId}`);
          } catch (error) {
            console.error('❌ Error removing manager from branch:', error);
          }
        }
      }
    }
  });

  // Associations
  Employee.associate = function(models) {
    Employee.belongsTo(models.Branch, {
      foreignKey: 'branchId',
      as: 'branch'
    });
    
    Employee.hasOne(models.Branch, {
      foreignKey: 'managerId',
      as: 'managedBranch'
    });
  };

  return Employee;
};