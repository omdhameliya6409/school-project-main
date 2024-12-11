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
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Secret key for JWT token generation (should be in .env in a real-world app)
const JWT_SECRET = 'your_jwt_secret_key'; // Use environment variable for secret key

// Login Controller with plain-text password
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare the plain-text password with the stored plain-text password
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create JWT token with user id and access flags (for principal, teacher, and student)
    const token = jwt.sign(
      {
        userId: user._id,
        principalAccess: user.principalAccess, // Assuming this is a boolean field in your User model
        teacherAccess: user.teacherAccess,     // Same as above
        studentAccess: user.studentAccess,     // Same as above
      },
      JWT_SECRET,  // Secret key to sign the JWT
      { expiresIn: '1h' }  // Token expires in 1 hour
    );

    // Return success response with the JWT token
    res.status(200).json({
      message: 'Login successful',
      token,  // Send the token to the client
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

