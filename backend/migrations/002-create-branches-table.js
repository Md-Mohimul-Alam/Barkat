'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // First, check if the table exists
    const tableExists = await queryInterface.sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'branches'
      );
    `, { type: queryInterface.sequelize.QueryTypes.SELECT });

    if (tableExists[0].exists) {
      console.log('✅ Branches table already exists, skipping creation');
      return;
    }

    // Create the table if it doesn't exist
    await queryInterface.createTable('branches', {
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
      code: {
        type: Sequelize.STRING,
        allowNull: true
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
      city: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Unknown'
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Unknown'
      },
      country: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Bangladesh'
      },
      postalCode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      establishedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'under-maintenance'),
        defaultValue: 'active'
      },
      managerId: {
        type: Sequelize.UUID,
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fax: {
        type: Sequelize.STRING,
        allowNull: true
      },
      openingTime: {
        type: Sequelize.TIME,
        allowNull: true
      },
      closingTime: {
        type: Sequelize.TIME,
        allowNull: true
      },
      workingDays: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'Monday-Friday'
      },
      totalEmployees: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      area: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      monthlyRent: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      utilitiesCost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: true
      },
      updatedBy: {
        type: Sequelize.UUID,
        allowNull: true
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

    // Create indexes only if they don't exist
    try {
      await queryInterface.addIndex('branches', ['name'], {
        name: 'branches_name_unique',
        unique: true
      });
      console.log('✅ Created branches_name_unique index');
    } catch (error) {
      console.log('ℹ️  branches_name_unique index already exists');
    }

    try {
      await queryInterface.addIndex('branches', ['code'], {
        name: 'branches_code_unique',
        unique: true
      });
      console.log('✅ Created branches_code_unique index');
    } catch (error) {
      console.log('ℹ️  branches_code_unique index already exists');
    }

    // Create other indexes safely
    const indexQueries = [
      { name: 'branches_manager_id', columns: ['managerId'] },
      { name: 'branches_status', columns: ['status'] },
      { name: 'branches_city', columns: ['city'] },
      { name: 'branches_state', columns: ['state'] },
      { name: 'branches_country', columns: ['country'] },
      { name: 'branches_created_by', columns: ['createdBy'] }
    ];

    for (const index of indexQueries) {
      try {
        await queryInterface.addIndex('branches', index.columns, {
          name: index.name
        });
        console.log(`✅ Created ${index.name} index`);
      } catch (error) {
        console.log(`ℹ️  ${index.name} index already exists`);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('branches');
  }
};