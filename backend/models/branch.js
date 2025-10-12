'use strict';

module.exports = (sequelize, DataTypes) => {
  const Branch = sequelize.define(
    'Branch',
    {
      name: { type: DataTypes.STRING, allowNull: false },
      manager: { type: DataTypes.STRING },
      contact: { type: DataTypes.STRING },
      address: { type: DataTypes.STRING },
      establishedAt: { type: DataTypes.DATE }
    },
    {
      tableName: 'branches', // ensures lowercase table name
      timestamps: true
    }
  );
  return Branch;
};
