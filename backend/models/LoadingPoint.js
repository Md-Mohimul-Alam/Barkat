'use strict';

module.exports = (sequelize, DataTypes) => {
  const LoadingPoint = sequelize.define('LoadingPoint', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Loading point name is required' },
        len: { args: [2, 100], msg: 'Loading point name must be between 2 and 100 characters' }
      }
    },
    type: {
      type: DataTypes.ENUM('Port', 'Storage', 'Vessel', 'Local', 'Factory', 'Warehouse'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['Port', 'Storage', 'Vessel', 'Local', 'Factory', 'Warehouse']],
          msg: 'Type must be one of: Port, Storage, Vessel, Local, Factory, Warehouse'
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
    tableName: 'loading_points',
    timestamps: true,
    hooks: {
      beforeValidate: (loadingPoint) => {
        if (!loadingPoint.country) loadingPoint.country = 'Bangladesh';
        
        // Trim string fields
        if (loadingPoint.name) loadingPoint.name = loadingPoint.name.trim();
        if (loadingPoint.location) loadingPoint.location = loadingPoint.location.trim();
        if (loadingPoint.address) loadingPoint.address = loadingPoint.address.trim();
        if (loadingPoint.city) loadingPoint.city = loadingPoint.city.trim();
        if (loadingPoint.state) loadingPoint.state = loadingPoint.state.trim();
        if (loadingPoint.contactPerson) loadingPoint.contactPerson = loadingPoint.contactPerson.trim();
        if (loadingPoint.contactNumber) loadingPoint.contactNumber = loadingPoint.contactNumber.trim();
        if (loadingPoint.email) loadingPoint.email = loadingPoint.email.toLowerCase().trim();
      }
    }
  });

  LoadingPoint.associate = function(models) {
    // Associations can be added later
  };

  return LoadingPoint;
};