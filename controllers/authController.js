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

// Define your secret key for signing JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Login controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Step 1: Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Step 2: Validate the provided password (plain-text comparison)
    if (user.password !== password) {  // Direct comparison (not recommended for production)
      return res.status(400).json({ message: 'Invalid email or password' });
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
    } else {
      roleMessage = 'Login successful';
      accessKey = {};
    }

    res.status(200).json({
      message: roleMessage,
      token,
      access: accessKey
    });

  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Logout controller
exports.logout = async (req, res) => {
  try {
    // Step 1: Get the user based on the token
    const user = await User.findById(req.user._id);  // Assuming req.user is set by the auth middleware

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Step 2: Invalidate the token by removing it from the user's activeToken field
    user.activeToken = null;  // Remove the active token
    await user.save();

    // Step 3: Return a success message
    res.status(200).json({ message: 'Logout successful' });

  } catch (err) {
    console.error('Error during logout:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
