'use strict';
module.exports = (sequelize, DataTypes) => {
  const Branch = sequelize.define('Branch', {
    name: DataTypes.STRING,
    manager: DataTypes.STRING,
    contact: DataTypes.STRING,
    address: DataTypes.STRING,
    establishedAt: DataTypes.DATE
  }, {});
  return Branch;
};
