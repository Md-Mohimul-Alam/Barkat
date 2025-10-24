// createAdminUser.js
require('dotenv').config();
const { sequelize, User } = require('./models'); // Import from models index
const bcrypt = require('bcrypt');

const createAdminUser = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Check if user already exists
    const existingAdmin = await User.findOne({ 
      where: { email: 'mohimreza1234@gmail.com' } 
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('User details:', {
        id: existingAdmin.id,
        name: existingAdmin.name,
        email: existingAdmin.email,
        role: existingAdmin.role
      });
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Mohim601141@', 10);
    
    const adminUser = await User.create({
      name: 'Mohim Reza',
      email: 'mohimreza1234@gmail.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active'
    });

    console.log('✅ Admin user created successfully!');
    console.log('User details:', {
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();