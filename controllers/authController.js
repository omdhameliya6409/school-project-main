// const User = require('../models/User');
// const jwt = require('jsonwebtoken');

// // Secret key for JWT token generation (should be in .env in a real-world app)
// const JWT_SECRET = 'your_jwt_secret_key';

// // Login Controller with plain text password (NOT recommended for production)
// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Find the user by email
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({ message: 'Invalid email or password' });
//     }

//     // Compare plain-text password with the stored plain-text password
//     if (user.password !== password) {
//       return res.status(400).json({ message: 'Invalid email or password' });
//     }

//     // Create JWT token with user id and access levels (for principal, teacher, and student)
//     const token = jwt.sign(
//       {
//         userId: user._id, 
//         principalAccess: user.principalAccess,
//         teacherAccess: user.teacherAccess,
//         studentAccess: user.studentAccess
//       },
//       JWT_SECRET, 
//       { expiresIn: '1h' }  // Token expires in 1 hour
//     );

//     // Return success response with the JWT token
//     res.status(200).json({
//       message: 'Login successful',
//       token,  // Send the token to the client
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Login controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Step 1: Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: 400,  message: 'Invalid email' });
    }

    // Step 2: Validate the provided password (plain-text comparison)
    if (user.password !== password) {  // Direct comparison (not recommended for production)
      return res.status(400).json({ status: 400 , message: 'Invalid password' });
    }

    // Step 3: Generate JWT token without expiration (it will not expire automatically)
    const token = jwt.sign(
      {
        userId: user._id,
        principalAccess: user.principalAccess || false,
        teacherAccess: user.teacherAccess || false,
        studentAccess: user.studentAccess || false,
      },
      JWT_SECRET // Secret key for signing the token
    );

    // Step 4: Save the token in the database for tracking active sessions
    user.activeToken = token;
    await user.save();
    // Step 5: Return success response with the token
    let roleMessage = '';
    let accessKey = {};

    if (user.principalAccess) {
      roleMessage = 'Principal login successful';
      accessKey = { "principalAccess": true };
    } else if (user.teacherAccess) {
      roleMessage = 'Teacher login successful';
      accessKey = { "teacherAccess": true };
    } else if (user.studentAccess) {
      roleMessage = 'Student login successful';
      accessKey = { "studentAccess": true };
    } else{
      roleMessage = 'Login successful';
      accessKey = {};
    }

    res.status(200).json({
      status: 200,
      message: roleMessage,
      token,
      access: accessKey
    });

  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ status: 500 , message: 'Server error', error: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    // Step 1: Get the user based on the token
    const user = await User.findById(req.user.userId); // Assuming req.user is set by the auth middleware

    if (!user) {
      return res.status(400).json({status: 400, message: 'User not found' });
    }

    // Step 2: Invalidate the token
    user.activeToken = null; // Remove the active token or any session-related information
    await user.save();

    // Step 3: Clear the cookie
    res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'strict' });

// Step 4: Send a success message
return res.status(200).json({ 
  status: 200, 
  message: 'Logout successful' 
});

} catch (err) {
  console.error('Error during logout:', err);
  return res.status(500).json({
    status: 500,
    message: 'Server error',
    error: err.message || 'An unexpected error occurred'
  });
}

};

exports.isLoggedIn = async (req, res) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  // If no token is provided
  if (!token) {
    return res.status(400).json({ status: 400 , message: 'No token provided, user is not logged in.' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch the user from the database using decoded data
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({ status: 400 , message: 'User not found, invalid token.' });
    }

    // Check if the token is valid (not blacklisted or replaced)
    if (user.activeToken !== token) {
      return res.status(400).json({  status: 400 , message: 'Token is invalidated, user is logged out.' });
    }

    // User is logged in, return their data
    return res.status(200).json({
      status: 200,
      message: 'User is logged in.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (err) {
    // Handle token verification errors
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ status: 400 , message: 'Token has expired, user is logged out.' });
    }

    return res.status(401).json({ status: 401 , message: 'Invalid token, user is not logged in.' });
  }
};

