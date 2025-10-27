'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if clients table exists
    const tableExists = await queryInterface.sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'clients'
      );
    `, { type: queryInterface.sequelize.QueryTypes.SELECT });

    if (tableExists[0].exists) {
      console.log('✅ Clients table already exists, skipping creation');
      return;
    }

    await queryInterface.createTable('clients', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      manager: {
        type: Sequelize.STRING,
        allowNull: false
      },
      contact: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      establishedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active'
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
      await queryInterface.addIndex('clients', ['name'], {
        name: 'clients_name_index'
      });
      console.log('✅ Created clients_name_index');
    } catch (error) {
      console.log('ℹ️  clients_name_index already exists');
    }

    try {
      await queryInterface.addIndex('clients', ['status'], {
        name: 'clients_status_index'
      });
      console.log('✅ Created clients_status_index');
    } catch (error) {
      console.log('ℹ️  clients_status_index already exists');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('clients');
  }
};