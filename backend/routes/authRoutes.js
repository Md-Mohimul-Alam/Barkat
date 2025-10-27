const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authControllers');
const { authenticate } = require('../middleware/auth'); // ✅ ADD this import

// Public routes - no authentication required
router.post('/register', register);
router.post('/login', login);

// ✅ ADD token verification route (requires authentication)
router.get('/verify', authenticate, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
      // Don't send password or other sensitive data
    },
    message: 'Token is valid'
  });
});

module.exports = router;