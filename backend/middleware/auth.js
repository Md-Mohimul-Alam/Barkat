// middleware/auth.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Authentication middleware - Verifies JWT token and attaches user to request
 */
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // Check if authorization header exists and has correct format
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      message: "Access denied. No authorization header provided." 
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      success: false,
      message: "Invalid authorization format. Expected 'Bearer <token>'." 
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Access denied. No token provided." 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };
    
    console.log('🔧 Authenticated user:', {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    });
    
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    
    // Handle different JWT error types
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Token expired. Please login again." 
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token. Please login again." 
      });
    }
    
    // Generic error for other JWT errors
    return res.status(401).json({ 
      success: false,
      message: "Authentication failed. Please login again." 
    });
  }
};

/**
 * Authorization middleware - Checks if user has required roles
 * @param {...string} roles - Array of allowed roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // ✅ FIX: Flatten the roles array in case it's nested
    const allowedRoles = roles.flat();
    
    console.log('🔧 Authorization check:', {
      userRole: req.user?.role,
      requiredRoles: allowedRoles,
      userId: req.user?.id,
      userName: req.user?.name
    });

    // Check if user is authenticated
    if (!req.user) {
      console.error('❌ No user found in request - make sure authenticate middleware runs first');
      return res.status(401).json({ 
        success: false,
        message: "Authentication required. Please login first." 
      });
    }

    // Check if user role is included in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      console.error(`❌ Access denied: User '${req.user.name}' (${req.user.role}) not in allowed roles: [${allowedRoles.join(', ')}]`);
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      });
    }

    console.log('✅ Authorization granted for user:', {
      name: req.user.name,
      role: req.user.role,
      requiredRoles: allowedRoles
    });
    next();
  };
};

// Alias for backward compatibility
exports.authorizeRoles = exports.authorize;

/**
 * Middleware to check if user is admin
 */
exports.requireAdmin = (req, res, next) => {
  return exports.authorize('admin')(req, res, next);
};

/**
 * Middleware to check if user is manager or admin
 */
exports.requireManager = (req, res, next) => {
  return exports.authorize('admin', 'manager')(req, res, next);
};

/**
 * Middleware to check if user is employee, manager or admin
 */
exports.requireEmployee = (req, res, next) => {
  return exports.authorize('admin', 'manager', 'employee')(req, res, next);
};

module.exports = exports;