const Fee = require('../models/Fee');
const mongoose = require("mongoose");
const authMiddleware = require('../middleware/authMiddleware'); // Import the authMiddleware
const { v4: uuidv4 } = require('uuid'); 

// Get fees by class and section (Only principal and teacher can access this)
exports.getFeesByClassAndSection = [
  authMiddleware(["principalAccess", "teacherAccess"]), // Restrict access to principal and teacher
  async (req, res) => {
    try {
      const { class: studentClass, section } = req.query;
      const filters = {};
      if (studentClass) filters.class = studentClass;
      if (section) filters.section = section;

      const fees = await Fee.find(filters).populate('studentId', 'name class section');
      res.status(200).json({ message: 'Fees data retrieved successfully', data: fees });
    } catch (err) {
      console.error('Error fetching fees:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
];
exports.collectFee = [
  authMiddleware(["principalAccess"]), // Only allow principal to collect fee
  async (req, res) => {
    const { studentId } = req.params;
    const { paymentId, mode, amountPaid, discount, fine, feesGroup, feesCode } = req.body;

    try {
      // Validate required fields
      if (!feesGroup || !feesCode) {
        return res.status(400).json({ message: 'feesGroup and feesCode are required' });
      }

      // Allowed payment modes
      const allowedModes = ['Cash', 'Cheque', 'DD', 'Bank Transfer', 'UPI', 'Card'];
      if (!allowedModes.includes(mode)) {
        return res.status(400).json({ message: `Invalid payment mode. Allowed modes are: ${allowedModes.join(', ')}` });
      }

      let fee = await Fee.findOne({ studentId: new mongoose.Types.ObjectId(studentId) });

      if (!fee) {
        // Create a new fee record with the provided details
        fee = new Fee({
          studentId: new mongoose.Types.ObjectId(studentId),
          feesGroup: feesGroup,  // Ensure feesGroup is set from the request body
          feesCode: feesCode,    // Ensure feesCode is set from the request body
          dueDate: new Date(),
          status: "Unpaid",
          amount: 5000,  // You can modify this amount based on your requirements
          mode: mode,
          discount: 0,
          fine: 0,
          paid: 0,
          balance: 5000,
        });
      } else {
        // Update the existing fee with the new feesGroup and feesCode
        fee.feesGroup = feesGroup;  // Update feesGroup
        fee.feesCode = feesCode;    // Update feesCode
      }

      // Ensure discount is not more than the amount
      const validDiscount = Math.min(isNaN(discount) ? 0 : Number(discount), fee.amount);
      const validAmountPaid = isNaN(amountPaid) ? 0 : Number(amountPaid);
      const validFine = isNaN(fine) ? 0 : Number(fine);

      const totalAmount = fee.amount - validDiscount + validFine;
      const updatedBalance = totalAmount - (fee.paid + validAmountPaid);

      fee.paymentId = fee.paymentId || uuidv4(); // Generate Payment ID if not already present
      fee.mode = mode;
      fee.discount = validDiscount;
      fee.fine = validFine;
      fee.paid += validAmountPaid;
      fee.balance = updatedBalance;
      fee.status = updatedBalance <= 0 ? 'Paid' : 'Partial';

      await fee.save();

      res.status(200).json({ message: 'Fee collected successfully', data: fee });
    } catch (err) {
      console.error('Error collecting fee:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
];

// Get fee details for a student (Only principal and teacher can access this)
exports.getFeeDetails = [
  authMiddleware(["principalAccess", "teacherAccess"]),  // Ensure you have access to this route
  async (req, res) => {
    const { studentId } = req.params;

    try {
      const fee = await Fee.findOne({ studentId }).populate('studentId', 'name class section');
      if (!fee) {
        return res.status(404).json({ message: 'No fee record found for the student' });
      }

      res.status(200).json({ message: 'Fee details retrieved successfully', data: fee });
    } catch (err) {
      console.error('Error fetching fee details:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
];
// Search payment by paymentId (Only principal and teacher can access this)
exports.searchPaymentsByPaymentId = [
  authMiddleware(["principalAccess", "teacherAccess"]), // Restrict access to principal and teacher
  async (req, res) => {
    try {
      const { paymentId } = req.query; // Payment ID passed in query parameter

      if (!paymentId) {
        return res.status(400).json({ message: 'Payment ID is required to search payments' });
      }

      // Find the specific payment by paymentId
      const fee = await Fee.findOne({ paymentId }).populate('studentId', 'name class section');

      if (!fee) {
        return res.status(404).json({ message: 'No payment found with the given Payment ID' });
      }

      res.status(200).json({ message: 'Payment found successfully', data: fee });
    } catch (err) {
      console.error('Error searching payment by Payment ID:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
];
