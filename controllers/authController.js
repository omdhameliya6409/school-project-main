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
const User = require('../models/User'); // User model for database interaction

// Define your secret key for signing JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Step 1: Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Step 2: Validate the provided password (plain text check for this example)
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Step 3: Generate JWT token upon successful login
    const token = jwt.sign(
      {
        userId: user._id, // Unique user ID
        principalAccess: user.principalAccess || false, // Roles and permissions
        teacherAccess: user.teacherAccess || false,
        studentAccess: user.studentAccess || false,
      },
      JWT_SECRET, // Secret key for signing the token
      { expiresIn: '1h' } // Token validity duration
    );

    // Step 4: Return success response with the token
    res.status(200).json({
      message: 'Login successful',
      token, // Token sent to client
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
