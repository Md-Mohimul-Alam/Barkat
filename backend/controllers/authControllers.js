// backend/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user || user.role !== role) {
      return res.status(401).json({ message: 'Invalid email or role' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Incorrect password' });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
};
