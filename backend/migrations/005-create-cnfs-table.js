'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if cnfs table exists
    const tableExists = await queryInterface.sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'cnfs'
      );
    `, { type: queryInterface.sequelize.QueryTypes.SELECT });

    if (tableExists[0].exists) {
      console.log('✅ CNFs table already exists, skipping creation');
      return;
    }

    await queryInterface.createTable('cnfs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      contact: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      establishedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create indexes safely
    try {
      await queryInterface.addIndex('cnfs', ['name'], {
        name: 'cnfs_name_index'
      });
      console.log('✅ Created cnfs_name_index');
    } catch (error) {
      console.log('ℹ️  cnfs_name_index already exists');
    }

    try {
      await queryInterface.addIndex('cnfs', ['isActive'], {
        name: 'cnfs_is_active_index'
      });
      console.log('✅ Created cnfs_is_active_index');
    } catch (error) {
      console.log('ℹ️  cnfs_is_active_index already exists');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('cnfs');
  }
};