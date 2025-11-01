'use strict';

module.exports = (sequelize, DataTypes) => {
  const UnloadingPoint = sequelize.define('UnloadingPoint', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Unloading point name is required' },
        len: { args: [2, 100], msg: 'Unloading point name must be between 2 and 100 characters' }
      }
    },
    type: {
      type: DataTypes.ENUM('Port', 'Storage', 'Vessel', 'Local', 'Factory', 'Warehouse', 'Distribution Center'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['Port', 'Storage', 'Vessel', 'Local', 'Factory', 'Warehouse', 'Distribution Center']],
          msg: 'Type must be one of: Port, Storage, Vessel, Local, Factory, Warehouse, Distribution Center'
        }
      }
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Location is required' },
        len: { args: [2, 200], msg: 'Location must be between 2 and 200 characters' }
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
    postalCode: {
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
    capacity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    operatingHours: {
      type: DataTypes.STRING,
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
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
      defaultValue: 'active',
      validate: {
        isIn: {
          args: [['active', 'inactive', 'maintenance']],
          msg: 'Status must be either active, inactive, or maintenance'
        }
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'unloading_points',
    timestamps: true,
    hooks: {
      beforeValidate: (unloadingPoint) => {
        if (!unloadingPoint.country) unloadingPoint.country = 'Bangladesh';
        
        // Trim string fields
        if (unloadingPoint.name) unloadingPoint.name = unloadingPoint.name.trim();
        if (unloadingPoint.location) unloadingPoint.location = unloadingPoint.location.trim();
        if (unloadingPoint.address) unloadingPoint.address = unloadingPoint.address.trim();
        if (unloadingPoint.city) unloadingPoint.city = unloadingPoint.city.trim();
        if (unloadingPoint.state) unloadingPoint.state = unloadingPoint.state.trim();
        if (unloadingPoint.contactPerson) unloadingPoint.contactPerson = unloadingPoint.contactPerson.trim();
        if (unloadingPoint.contactNumber) unloadingPoint.contactNumber = unloadingPoint.contactNumber.trim();
        if (unloadingPoint.email) unloadingPoint.email = unloadingPoint.email.toLowerCase().trim();
      }
    }
  });

  UnloadingPoint.associate = function(models) {
    // Associations can be added later
  };

  return UnloadingPoint;
};