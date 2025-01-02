const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

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
      const resetLink = `http://localhost:1000/reset-password/${resetToken}`;

      // Configure nodemailer
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'omdhameliya0707@gmail.com',
          pass: 'riuk szch eufx rmpa',
        },
      });

      // Send email
      const mailOptions = {
        from: 'omdhameliya0707@gmail.com',
        to: email,
        subject: 'Password Reset Request',
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 1 hour.</p>`,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ status: 200, message: 'Password reset email sent' });

    } catch (err) {
      console.error('Error in forgotPassword:', err);
      res.status(500).json({ status: 500, message: 'Server error', error: err.message });
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
      res.status(500).json({ status: 500, message: 'Invalid or expired token', error: err.message });
    }
  },
};
