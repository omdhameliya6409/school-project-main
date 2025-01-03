const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
require('dotenv').config();

module.exports = {
  // Forgot Password
  forgotPassword: async (req, res) => {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ status: 404, message: 'User not found' });
      }

      // Generate a reset token
      const resetToken = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

      // Generate a reset link
      const resetLink = `https://school-project-main.onrender.com/password/reset-password/${resetToken}`;

      // Configure nodemailer
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, 
          pass: process.env.EMAIL_PASS, 
        },
      });

      // Send email
      const mailOptions = {
        from: process.env.EMAIL_USER,  // Use environment variable for the sender email
        to: email,
        subject: 'Password Reset Request',
        html: `
          <p>Dear User,</p>
          <p>We received a request to reset your password. To proceed, please click the link below:</p>
          <p><a href="${resetLink}">Click here to reset your password</a></p>
          <p>This link is valid for 1 hour. If you did not request a password reset, please ignore this email or contact support immediately.</p>
          <p>Best regards,</p>
          <p>The School Management Team</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ status: 200, message: 'Password reset email sent successfully' });

    } catch (err) {
      console.error('Error in forgotPassword:', err);
      res.status(500).json({ status: 500, message: 'Server error. Please try again later.', error: err.message });
    }
  },

  // Reset Password
  resetPassword: async (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;

    try {
      // Verify the reset token
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;

      // Validate passwords
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ status: 400, message: 'Passwords do not match' });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password
      await User.findByIdAndUpdate(userId, { password: hashedPassword });

      res.status(200).json({ status: 200, message: 'Password reset successful' });

    } catch (err) {
      console.error('Error in resetPassword:', err);
      if (err.name === 'TokenExpiredError') {
        return res.status(400).json({ status: 400, message: 'The password reset link has expired. Please request a new one.' });
      }
      res.status(500).json({ status: 500, message: 'Invalid or expired token', error: err.message });
    }
  },
};
