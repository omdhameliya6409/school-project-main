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
const JWT_SECRET = 'your_jwt_secret_key'; // Use your secret key here

const authMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Failed to authenticate token' });
      }

      // Ensure requiredRoles is an array
      if (!Array.isArray(requiredRoles)) {
        return res.status(500).json({ message: 'Invalid requiredRoles parameter' });
      }

      // Attach the decoded user data to req.user
      req.user = decoded;

      // Check if the user has any of the required roles directly (not in a "roles" array)
      const hasRequiredRole = requiredRoles.some(role => decoded[role] === true);

      if (hasRequiredRole) {
        next();  // Continue to the next middleware or route handler
      } else {
        res.status(403).json({ message: 'You do not have permission to access this resource' });
      }
    });
  };
};

module.exports = authMiddleware;









