// models/Client.js
module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    manager: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    establishedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });

  return Client;
};