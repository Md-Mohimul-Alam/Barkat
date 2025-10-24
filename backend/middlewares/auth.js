// auth.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    console.log('🔧 Authenticated user:', {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    });
    
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log('🔧 Authorization check:', {
      userRole: req.user?.role,
      requiredRoles: roles,
      hasUser: !!req.user
    });

    if (!req.user) {
      console.error('❌ No user found in request - make sure authenticate middleware runs first');
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      console.error(`❌ Access denied: User role '${req.user.role}' not in allowed roles: [${roles.join(', ')}]`);
      return res.status(403).json({ message: "Access denied: role not permitted" });
    }

    console.log('✅ Authorization granted for role:', req.user.role);
    next();
  };
};

// If you want a shorthand "authorize" function for common use cases
exports.authorize = (roles) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  return exports.authorizeRoles(...roles);
};