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
        notEmpty: { msg: 'Branch name is required' },
        len: { args: [2, 100], msg: 'Branch name must be between 2 and 100 characters' }
      }
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: { args: [1, 10], msg: 'Branch code must be between 1 and 10 characters' }
      }
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Contact is required' },
        is: { args: /^[0-9]{10,15}$/, msg: 'Contact must be 10-15 digits' }
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
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Address is required' },
        len: { args: [10, 500], msg: 'Address must be between 10 and 500 characters' }
      }
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Unknown',
      validate: {
        notEmpty: { msg: 'City is required' }
      }
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Unknown',
      validate: {
        notEmpty: { msg: 'State is required' }
      }
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Bangladesh',
      validate: {
        notEmpty: { msg: 'Country is required' }
      }
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    establishedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'Please enter a valid establishment date' },
        notEmpty: { msg: 'Establishment date is required' }
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'under-maintenance'),
      defaultValue: 'active',
      validate: {
        isIn: { 
          args: [['active', 'inactive', 'under-maintenance']], 
          msg: 'Status must be either active, inactive, or under-maintenance' 
        }
      }
    },
    managerId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: { args: /^[0-9]{10,15}$/, msg: 'Phone must be 10-15 digits' }
      }
    },
    fax: {
      type: DataTypes.STRING,
      allowNull: true
    },
    openingTime: {
      type: DataTypes.TIME,
      allowNull: true
    },
    closingTime: {
      type: DataTypes.TIME,
      allowNull: true
    },
    workingDays: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Monday-Friday'
    },
    totalEmployees: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: 'Total employees cannot be negative' }
      }
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: { args: [0], msg: 'Capacity cannot be negative' }
      }
    },
    area: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Area in square feet'
    },
    monthlyRent: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      validate: {
        min: { args: [0], msg: 'Monthly rent cannot be negative' }
      }
    },
    utilitiesCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: { args: [0], msg: 'Utilities cost cannot be negative' }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    tableName: 'branches',
    timestamps: true,
    hooks: {
      beforeValidate: (branch) => {
        // Ensure required fields have values
        if (!branch.city) branch.city = 'Unknown';
        if (!branch.state) branch.state = 'Unknown';
        if (!branch.country) branch.country = 'Bangladesh';
        
        // Trim string fields
        if (branch.name) branch.name = branch.name.trim();
        if (branch.code) branch.code = branch.code.trim();
        if (branch.contact) branch.contact = branch.contact.trim();
        if (branch.email) branch.email = branch.email.toLowerCase().trim();
        if (branch.address) branch.address = branch.address.trim();
        if (branch.city) branch.city = branch.city.trim();
        if (branch.state) branch.state = branch.state.trim();
        if (branch.country) branch.country = branch.country.trim();
        if (branch.postalCode) branch.postalCode = branch.postalCode.trim();
        if (branch.phone) branch.phone = branch.phone.trim();
        if (branch.fax) branch.fax = branch.fax.trim();
        if (branch.workingDays) branch.workingDays = branch.workingDays.trim();
        if (branch.description) branch.description = branch.description.trim();
        
        // Generate branch code if not provided
        if (!branch.code && branch.name) {
          branch.code = branch.name
            .replace(/\s+/g, '_')
            .toUpperCase()
            .substring(0, 10);
        }
      }
    }
  });

  Branch.associate = function(models) {
    Branch.hasMany(models.Employee, {
      foreignKey: 'branchId',
      as: 'employees'
    });
    
    Branch.belongsTo(models.Employee, {
      foreignKey: 'managerId',
      as: 'manager',
      constraints: false
    });
    
    Branch.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    
    Branch.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updater'
    });
  };

  // Instance methods
  Branch.prototype.isOperational = function() {
    return this.status === 'active';
  };

  Branch.prototype.getContactInfo = function() {
    return {
      name: this.name,
      address: this.address,
      city: this.city,
      state: this.state,
      country: this.country,
      postalCode: this.postalCode,
      contact: this.contact,
      email: this.email,
      phone: this.phone
    };
  };

  Branch.prototype.getOperationalHours = function() {
    return {
      openingTime: this.openingTime,
      closingTime: this.closingTime,
      workingDays: this.workingDays
    };
  };

  // Static methods
  Branch.getStatistics = async function() {
    const totalBranches = await this.count();
    const activeBranches = await this.count({ where: { status: 'active' } });
    const branchesWithManagers = await this.count({ 
      where: { 
        managerId: { [models.Sequelize.Op.ne]: null } 
      } 
    });

    return {
      totalBranches,
      activeBranches,
      inactiveBranches: totalBranches - activeBranches,
      branchesWithManagers,
      branchesWithoutManagers: totalBranches - branchesWithManagers
    };
  };

  return Branch;
};