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
// authMiddleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'omdhameliya6409';  // Ensure this matches the key used for signing

const authMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
 // Log the received token for debugging

    // Verify the token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        // Handle token expiration
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token has expired, please login again.' });
        }

        console.error("JWT verification failed:", err);  // Log the error
        return res.status(403).json({ message: 'Failed to authenticate token', error: err.message });
      }

      // Attach decoded user data to the request
      req.user = decoded;

      // Ensure requiredRoles is an array
      if (!Array.isArray(requiredRoles)) {
        return res.status(500).json({ message: 'Invalid requiredRoles parameter' });
      }

      // Check if the decoded token contains the required role
      const hasRequiredRole = requiredRoles.some(role => decoded[role] === true);

      if (hasRequiredRole) {
        return next();  // Proceed to the next middleware or route handler
      } else {
        return res.status(403).json({ message: 'You do not have permission to access this resource' });
      }
    });
  };
};






module.exports = authMiddleware;








