'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if employees table exists
    const tableExists = await queryInterface.sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'employees'
      );
    `, { type: queryInterface.sequelize.QueryTypes.SELECT });

    if (tableExists[0].exists) {
      console.log('✅ Employees table already exists, skipping creation');
      return;
    }

    // Create employees table
    await queryInterface.createTable('employees', {
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
      position: {
        type: Sequelize.STRING,
        allowNull: false
      },
      contact: {
        type: Sequelize.STRING,
        allowNull: false
      },
      whatsapp: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      nid: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      dob: {
        type: Sequelize.DATE,
        allowNull: false
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      salary: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      joinedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      branchId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'branches',
          key: 'id'
        }
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'on-leave'),
        defaultValue: 'active'
      },
      isManager: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
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
      await queryInterface.addIndex('employees', ['email'], { 
        name: 'employees_email_unique',
        unique: true 
      });
      console.log('✅ Created employees_email_unique index');
    } catch (error) {
      console.log('ℹ️  employees_email_unique index already exists');
    }

    try {
      await queryInterface.addIndex('employees', ['nid'], { 
        name: 'employees_nid_unique',
        unique: true 
      });
      console.log('✅ Created employees_nid_unique index');
    } catch (error) {
      console.log('ℹ️  employees_nid_unique index already exists');
    }

    try {
      await queryInterface.addIndex('employees', ['branchId'], {
        name: 'employees_branch_id'
      });
      console.log('✅ Created employees_branch_id index');
    } catch (error) {
      console.log('ℹ️  employees_branch_id index already exists');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('employees');
  }
};