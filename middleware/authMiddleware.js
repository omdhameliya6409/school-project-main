// const jwt = require('jsonwebtoken');
// const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // JWT secret key from .env

// // Middleware to verify the JWT token and check access level
// module.exports = (accessType) => {
//   return (req, res, next) => {
//     // Get token from Authorization header
//     const token = req.header('Authorization')?.replace('Bearer ', '');
    
//     if (!token) {
//       return res.status(401).json({ message: 'No token, authorization denied' });
//     }

//     try {
//       // Verify JWT token
//       const decoded = jwt.verify(token, JWT_SECRET);
//       req.user = decoded;  // Store decoded user info in the request object

//       // Check if the user has the correct access based on the accessType (principal, teacher, or student)
//       if (!req.user[accessType]) {
//         return res.status(403).json({ message: 'Forbidden: Access denied' });
//       }

//       next();  // If everything is okay, proceed to the next middleware/route
//     } catch (err) {
//       res.status(401).json({ message: 'Invalid or expired token' });
//     }
//   };
// };
// authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret'

const authMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    // If no token is provided
    if (!token) {
      return res.status(401).json({ message: 'Token is missing, please provide a valid token.' });
    }

    // Verify the token
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        // Handle specific error when the token has expired
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token has expired, please login again.' });
        }

        // Handle other JWT errors (e.g., invalid token, malformed token)
        console.error("JWT verification failed:", err);
        return res.status(403).json({ message: 'Failed to authenticate token', error: err.message });
      }

      // Attach decoded user data to the request object
      req.user = decoded;

      // Ensure requiredRoles is an array
      if (!Array.isArray(requiredRoles)) {
        return res.status(500).json({ message: 'Invalid requiredRoles parameter, expected an array.' });
      }

      // Check if the decoded token contains any of the required roles
      const hasRequiredRole = requiredRoles.some(role => decoded[role] === true);

      if (hasRequiredRole) {
        // Optionally check if the token has been blacklisted
        // (for example, by checking against the database)
        const user = await User.findById(decoded.userId);
        if (user && user.activeToken !== token) {
          return res.status(401).json({ message: 'This token has been invalidated. Please log in again.' });
        }

        return next(); // Proceed to the next middleware or route handler
      } else {
        return res.status(403).json({ message: 'You do not have permission to access this resource' });
      }
    });
  };
};

module.exports = authMiddleware;











