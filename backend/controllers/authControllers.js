// backend/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    console.log('🔧 Register attempt:', { name, email, role });
    
    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) return res.status(400).json({ 
      success: false,
      message: 'User already exists' 
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({ 
      success: true,
      message: 'User registered successfully', 
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

const login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    console.log('🔧 Login attempt:', { email, role });
    
    // Find user by email only (don't filter by role in login)
    const user = await User.findOne({ 
      where: { 
        email: email
      } 
    });
    
    console.log('🔧 Found user:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Verify role matches (if role is provided)
    if (role && user.role !== role) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid role for this user' 
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error during login' 
    });
  }
};

module.exports = {
  register,
  login,
};