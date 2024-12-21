const Fee = require('../models/Fee');
const mongoose = require("mongoose");
const authMiddleware = require('../middleware/authMiddleware'); // Import the authMiddleware
const { v4: uuidv4 } = require('uuid'); 
const Student = require('../models/Student');

// Get fees by class and section (Only principal and teacher can access this)
exports.getFeesByClassAndSection = [
  authMiddleware(["principalAccess", "teacherAccess"]), // Restrict access to principal and teacher
  async (req, res) => {
    try {
      const { studentClass, section } = req.query;
      const filters = {};

      // Apply filters only if the corresponding parameters are provided
      if (studentClass) filters.class = studentClass;
      if (section) filters.section = section;

      // Step 1: Find students by class and section
      const students = await Student.find(filters);

      if (students.length === 0) {
        return res.status(404).json({ status: 404 , message: 'No students found for the selected class and section' });
      }

      // Step 2: Find fee data for these students
      const fees = await Fee.find({ studentId: { $in: students.map(student => student._id) } })
        .populate('studentId', 'name class section admissionNo dateOfBirth gender category mobileNumber'); 

      // Step 3: Create the response for each student
      const studentFees = students.map(student => {
        // Find fee data for the student
        const fee = fees.find(fee => fee.studentId._id.toString() === student._id.toString());

        // If fee exists, calculate status (Paid or Pending)
        if (fee) {
          const status = fee.balance <= 0 ? 'Paid' : 'Pending'; 
          return {
            studentId: student._id,
            name: student.name,
            class: student.class,
            section: student.section,
            admissionNo: student.admissionNo,
            dateOfBirth: student.dateOfBirth,
            gender: student.gender,
            category: student.category,
            mobileNumber: student.mobileNumber,
            feeStatus: status, // Fee status (Paid or Pending)
            feeDetails: {
              feesGroup: fee.feesGroup,
              feesCode: fee.feesCode,
              amount: fee.amount,
              discount: fee.discount,
              fine: fee.fine,
              paid: fee.paid,
              balance: fee.balance
            }
          };
        }

        // If no fee record, show as Pending with default values
        return {
          studentId: student._id,
          name: student.name,
          class: student.class,
          section: student.section,
          admissionNo: student.admissionNo,
          dateOfBirth: student.dateOfBirth,
          gender: student.gender,
          category: student.category,
          mobileNumber: student.mobileNumber,
          feeStatus: 'Pending', // Fee status is Pending if no fee record exists
          feeDetails: {
            feesGroup: 'Not Paid',
            feesCode: 'N/A',
            amount: 0,
            discount: 0,
            fine: 0,
            paid: 0,
            balance: 0
          }
        };
      });

      res.status(200).json({
        status: 200,
        message: 'Fees data retrieved successfully',
        data: studentFees
      });
    } catch (err) {
      console.error('Error fetching fees:', err);
      res.status(500).json({ status: 500, message: 'Server error', error: err.message });
    }
  }
];

exports.collectFee = [
  authMiddleware(["principalAccess", "teacherAccess"]), // Only allow principal and teacher to collect fee
  async (req, res) => {
    const { studentId } = req.params;
    const { mode, amountPaid, discount, fine, feesGroup, feesCode, section, class: studentClass } = req.body;

    try {
      // Validate required fields
      if (!feesGroup || !feesCode || !section || !studentClass) {
        return res.status(400).json({ status: 400, message: 'feesGroup, feesCode, section, and class are required' });
      }

      // Allowed payment modes
      const allowedModes = ['Cash', 'Cheque', 'DD', 'Bank Transfer', 'UPI', 'Card'];
      if (!allowedModes.includes(mode)) {
        return res.status(400).json({ status: 400, message: `Invalid payment mode. Allowed modes are: ${allowedModes.join(', ')}` });
      }

      // Fetch or create fee record
      let fee = await Fee.findOne({ studentId: new mongoose.Types.ObjectId(studentId), section, class: studentClass });

      if (!fee) {
        // Create a new fee record if it doesn't exist
        fee = new Fee({
          studentId: new mongoose.Types.ObjectId(studentId),
          feesGroup: feesGroup,
          feesCode: feesCode,
          section: section,
          class: studentClass,
          dueDate: new Date(),
          status: "Unpaid",
          amount: 5000, // Replace with actual fee structure if applicable
          mode: mode,
          discount: 0,
          fine: 0,
          paid: 0,
          balance: 5000,
        });
      }

      // Validate and ensure no negative values for discount, fine, and amount paid
      const validDiscount = Math.max(0, Math.min(isNaN(discount) ? 0 : Number(discount), fee.amount));
      const validAmountPaid = Math.max(0, isNaN(amountPaid) ? 0 : Number(amountPaid));
      const validFine = Math.max(0, isNaN(fine) ? 0 : Number(fine));

      // Calculate the total amount after discount and fine
      const totalAmount = fee.amount - validDiscount + validFine;

      // Ensure the paid amount does not exceed the total amount
      if (fee.paid + validAmountPaid > totalAmount) {
        return res.status(400).json({ status: 200, message: 'Paid amount cannot exceed the total fee amount' });
      }

      // Update the balance and paid amount
      const updatedBalance = totalAmount - (fee.paid + validAmountPaid);

      fee.paymentId = fee.paymentId || uuidv4(); // Generate Payment ID if not already present
      fee.mode = mode;
      fee.discount = validDiscount;
      fee.fine = validFine;
      fee.paid += validAmountPaid; // Add the amount paid to the existing `paid` value
      fee.balance = updatedBalance;

      // Update the status based on the balance
      if (fee.balance <= 0) {
        fee.status = 'Paid'; // If balance is 0, the fee is fully paid
      } else if (fee.paid > 0 && fee.balance > 0) {
        fee.status = 'Partial'; // If there's some amount paid but balance is still remaining
      } else {
        fee.status = 'Pending'; // If no amount has been paid yet
      }

      // Save the updated fee record
      await fee.save();

      res.status(200).json({ status: 200, message: 'Fee collected successfully', data: fee });
    } catch (err) {
      console.error('Error collecting fee:', err);
      res.status(500).json({ status: 500, message: 'Server error', error: err.message });
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
        return res.status(404).json({ status: 404, message: 'No fee record found for the student' });
      }

      res.status(200).json({ status: 200, message: 'Fee details retrieved successfully', data: fee });
    } catch (err) {
      console.error('Error fetching fee details:', err);
      res.status(500).json({ status: 500, message: 'Server error', error: err.message });
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
        return res.status(400).json({ status:400,message: 'Payment ID is required to search payments' });
      }

      // Find the specific payment by paymentId
      const fee = await Fee.findOne({ paymentId }).populate('studentId', 'name class section');

      if (!fee) {
        return res.status(404).json({ status:404, message: 'No payment found with the given Payment ID' });
      }

      res.status(200).json({ status:200,message: 'Payment found successfully', data: fee });
    } catch (err) {
      console.error('Error searching payment by Payment ID:', err);
      res.status(500).json({ status:500, message: 'Server error', error: err.message });
    }
  }
];
exports.editFee = [
  authMiddleware(["principalAccess", "teacherAccess"]), // Only allow principal and teacher to edit fee records
  async (req, res) => {
    const { studentId } = req.params; // Use studentId to identify the fee record
    const {
      mode,
      amountPaid,
      discount,
      fine,
      feesGroup,
      feesCode,
      section,
      class: studentClass,
    } = req.body;

    try {
      // Validate required fields
      if (!feesGroup || !feesCode || !section || !studentClass) {
        return res
          .status(400)
          .json({ status:400, message: "feesGroup, feesCode, section, and class are required" });
      }

      // Allowed payment modes
      const allowedModes = ["Cash", "Cheque", "DD", "Bank Transfer", "UPI", "Card"];
      if (mode && !allowedModes.includes(mode)) {
        return res
          .status(400)
          .json({status:400,
            message: `Invalid payment mode. Allowed modes are: ${allowedModes.join(", ")}`,
          });
      }

      // Fetch the fee record by studentId and additional filters
      let fee = await Fee.findOne({
        studentId: new mongoose.Types.ObjectId(studentId),
        feesGroup: feesGroup,
        feesCode: feesCode,
        section: section,
        class: studentClass,
      });

      if (!fee) {
        return res.status(404).json({status:404, message: "Fee record not found" });
      }

      // Validate and ensure no negative values for discount, fine, and amount paid
      const validDiscount = Math.max(0, Math.min(isNaN(discount) ? fee.discount : Number(discount), fee.amount));
      const validFine = Math.max(0, isNaN(fine) ? fee.fine : Number(fine));
      const validAmountPaid = Math.max(0, isNaN(amountPaid) ? 0 : Number(amountPaid));

      // Calculate the total amount after discount and fine
      const totalAmount = fee.amount - validDiscount + validFine;

      // Ensure the paid amount does not exceed the total amount
      if (fee.paid + validAmountPaid > totalAmount) {
        return res
          .status(400)
          .json({ status:400, message: "Paid amount cannot exceed the total fee amount" });
      }

      // Update the balance and paid amount
      const updatedBalance = totalAmount - (fee.paid + validAmountPaid);

      // Update fee record fields
      fee.feesGroup = feesGroup || fee.feesGroup;
      fee.feesCode = feesCode || fee.feesCode;
      fee.section = section || fee.section;
      fee.class = studentClass || fee.class;
      fee.mode = mode || fee.mode;
      fee.discount = validDiscount;
      fee.fine = validFine;
      fee.paid += validAmountPaid;
      fee.balance = updatedBalance;

      // Update the status based on the balance
      if (fee.balance <= 0) {
        fee.status = "Paid"; // If balance is 0, the fee is fully paid
      } else if (fee.paid > 0 && fee.balance > 0) {
        fee.status = "Partial"; // If there's some amount paid but balance is still remaining
      } else {
        fee.status = "Pending"; // If no amount has been paid yet
      }

      // Save the updated fee record
      await fee.save();

      res.status(200).json({ status:200, message: "Fee record updated successfully", data: fee });
    } catch (err) {
      console.error("Error editing fee:", err);
      res.status(500).json({ status:500, message: "Server error", error: err.message });
    }
  },
];

