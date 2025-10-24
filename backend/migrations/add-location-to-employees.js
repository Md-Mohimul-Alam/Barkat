'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add location column
    await queryInterface.addColumn('employees', 'location', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    // Set default location for existing records
    await queryInterface.sequelize.query(`
      UPDATE employees SET location = 'Main Office' WHERE location IS NULL
    `);
    
    // Make location required
    await queryInterface.changeColumn('employees', 'location', {
      type: Sequelize.STRING,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('employees', 'location');
  }
};