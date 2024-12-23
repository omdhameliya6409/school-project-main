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
const feeStructure = {
  "9": { sem1: 5000, sem2: 4000 },
  "10": { sem1: 6000, sem2: 5000 },
  "11": { sem1: 7000, sem2: 6000 },
  "12": { sem1: 8000, sem2: 7000 }
};
// exports.collectFee = [
//   authMiddleware(["principalAccess", "teacherAccess"]), // Only allow principal and teacher to collect fee
//   async (req, res) => {
//     const { studentId } = req.params; // Student ID from URL (use req.params)
//     const { mode, amountPaid, discount, fine, feesGroup, feesCode, section, class: studentClass, semester } = req.body;

//     try {
//       // Validate required fields
//       if (!feesGroup || !feesCode || !section || !studentClass || !semester) {
//         return res.status(400).json({ status: 400, message: 'feesGroup, feesCode, section, class, and semester are required' });
//       }

//       // Allowed payment modes
//       const allowedModes = ['Cash', 'Cheque', 'DD', 'Bank Transfer', 'UPI', 'Card'];
//       if (!allowedModes.includes(mode)) {
//         return res.status(400).json({ status: 400, message: `Invalid payment mode. Allowed modes are: ${allowedModes.join(', ')}` });
//       }

//       // Convert studentId to ObjectId
//       const studentIdObject = new mongoose.Types.ObjectId(studentId);

//       // Fetch or create fee record
//       let fee = await Fee.findOne({ studentId: studentIdObject, section, class: studentClass });

//       if (!fee) {
//         // Create a new fee record if it doesn't exist
//         const classFees = feeStructure[studentClass];

//         if (!classFees) {
//           return res.status(400).json({ status: 400, message: "Class not found in fee structure" });
//         }

//         fee = new Fee({
//           studentId: studentIdObject, // Use ObjectId
//           feesGroup: feesGroup,
//           feesCode: feesCode,
//           section: section,
//           class: studentClass,
//           dueDate: new Date(),
//           status: "Unpaid",
//           paymentId: uuidv4(), // Generate Payment ID
//           mode: mode,
//           discount: 0,
//           fine: 0,
//           paid: 0,
//           balance: 0,
//           sem1: { 
//             amount: classFees.sem1, 
//             paid: 0, 
//             balance: classFees.sem1, 
//             status: 'Unpaid' 
//           },
//           sem2: { 
//             amount: classFees.sem2, 
//             paid: 0, 
//             balance: classFees.sem2, 
//             status: 'Unpaid' 
//           }
//         });
//       }

//       // Validate the semester field
//       if (!fee[semester]) {
//         return res.status(400).json({ status: 400, message: "Invalid semester. Allowed semesters are: sem1, sem2." });
//       }

//       // Validate and ensure no negative values for discount, fine, and amount paid
//       const validDiscount = Math.max(0, Math.min(isNaN(discount) ? 0 : Number(discount), fee[semester].amount));
//       const validAmountPaid = Math.max(0, isNaN(amountPaid) ? 0 : Number(amountPaid));
//       const validFine = Math.max(0, isNaN(fine) ? 0 : Number(fine));

//       // Calculate the total amount after discount and fine
//       const totalAmount = fee[semester].amount - validDiscount + validFine;

//       // Ensure the paid amount does not exceed the total amount
//       if (fee[semester].paid + validAmountPaid > totalAmount) {
//         return res.status(400).json({ status: 400, message: 'Paid amount cannot exceed the total fee amount' });
//       }

//       // Update the balance and paid amount for the semester
//       const updatedBalance = totalAmount - (fee[semester].paid + validAmountPaid);

//       fee[semester].paid += validAmountPaid;
//       fee[semester].balance = updatedBalance;

//       // Update the status based on the balance
//       if (fee[semester].balance <= 0) {
//         fee[semester].status = 'Paid'; // If balance is 0, the fee is fully paid
//       } else if (fee[semester].paid > 0 && fee[semester].balance > 0) {
//         fee[semester].status = 'Partial'; // If there's some amount paid but balance is still remaining
//       } else {
//         fee[semester].status = 'Unpaid'; // If no amount has been paid yet
//       }

//       // Update the overall balance
//       fee.balance = fee.sem1.balance + fee.sem2.balance;

//       // Save the updated fee record
//       await fee.save();

//       res.status(200).json({ status: 200, message: 'Fee collected successfully', data: fee });
//     } catch (err) {
//       console.error('Error collecting fee:', err);
//       res.status(500).json({ status: 500, message: 'Server error', error: err.message });
//     }
//   }
// ];

exports.collectFee = [
  authMiddleware(["principalAccess", "teacherAccess"]), // Only allow principal and teacher to collect fee
  async (req, res) => {
    const { studentId } = req.params; // Student ID from URL (use req.params)
    const { mode, amountPaid, discount, fine, feesGroup, feesCode, section, class: studentClass, semester } = req.body;

    try {
      // Validate required fields
      if (!feesGroup || !feesCode || !section || !studentClass || !semester) {
        return res.status(400).json({ status: 400, message: 'feesGroup, feesCode, section, class, and semester are required' });
      }

      // Allowed payment modes
      const allowedModes = ['Cash', 'Cheque', 'DD', 'Bank Transfer', 'UPI', 'Card'];
      if (!allowedModes.includes(mode)) {
        return res.status(400).json({ status: 400, message: `Invalid payment mode. Allowed modes are: ${allowedModes.join(', ')}` });
      }

      // Convert studentId to ObjectId
      const studentIdObject = new mongoose.Types.ObjectId(studentId);

      // Fetch the existing fee record for the student
      let fee = await Fee.findOne({ studentId: studentIdObject, section, class: studentClass });

      if (!fee) {
        // Create a new fee record if it doesn't exist
        const classFees = feeStructure[studentClass];

        if (!classFees) {
          return res.status(400).json({ status: 400, message: "Class not found in fee structure" });
        }

        fee = new Fee({
          studentId: studentIdObject, // Use ObjectId
          feesGroup: feesGroup,
          feesCode: feesCode,
          section: section,
          class: studentClass,
          dueDate: new Date(),
          status: "Unpaid",
          paymentId: uuidv4(), // Generate Payment ID
          mode: mode,
          discount: 0,
          fine: 0,
          paid: 0,
          balance: 0,
          sem1: { 
            amount: classFees.sem1, 
            paid: 0, 
            balance: classFees.sem1, 
            status: 'Unpaid' 
          },
          sem2: { 
            amount: classFees.sem2, 
            paid: 0, 
            balance: classFees.sem2, 
            status: 'Unpaid' 
          }
        });
      }

      // Validate the semester field
      if (!fee[semester]) {
        return res.status(400).json({ status: 400, message: "Invalid semester. Allowed semesters are: sem1, sem2." });
      }

      // Validate and ensure no negative values for discount, fine, and amount paid
      const validDiscount = Math.max(0, Math.min(isNaN(discount) ? 0 : Number(discount), fee[semester].amount));
      const validAmountPaid = Math.max(0, isNaN(amountPaid) ? 0 : Number(amountPaid));
      const validFine = Math.max(0, isNaN(fine) ? 0 : Number(fine));

      // Calculate the total amount after discount and fine
      const totalAmount = fee[semester].amount - validDiscount + validFine;

      // Ensure the paid amount does not exceed the total amount
      if (fee[semester].paid + validAmountPaid > totalAmount) {
        return res.status(400).json({ status: 400, message: 'Paid amount cannot exceed the total fee amount' });
      }

      // Update the balance and paid amount for the semester
      const updatedBalance = totalAmount - (fee[semester].paid + validAmountPaid);

      fee[semester].paid += validAmountPaid;
      fee[semester].balance = updatedBalance;

      // Update the status based on the balance
      if (fee[semester].balance <= 0) {
        fee[semester].status = 'Paid'; // If balance is 0, the fee is fully paid
      } else if (fee[semester].paid > 0 && fee[semester].balance > 0) {
        fee[semester].status = 'Partial'; // If there's some amount paid but balance is still remaining
      } else {
        fee[semester].status = 'Unpaid'; // If no amount has been paid yet
      }

      // Update the overall status based on semester statuses
      if (fee.sem1.status === 'Paid' && fee.sem2.status === 'Paid') {
        fee.status = 'Paid'; // If both semesters are paid
      } else if (fee.sem1.status === 'Partial' || fee.sem2.status === 'Partial') {
        fee.status = 'Partial'; // If either semester is partially paid
      } else {
        fee.status = 'Unpaid'; // If both semesters are unpaid
      }

      // Update the overall balance
      fee.balance = fee.sem1.balance + fee.sem2.balance;

      // Provide message for remaining fee or confirmation of full payment
      let message = '';
      if (fee[semester].status === 'Paid') {
        message = 'The fee for this semester is already paid.';
      } else if (fee[semester].status === 'Partial') {
        message = `Remaining amount to be paid for this semester is: ₹${fee[semester].balance}`;
      } else {
        message = `Remaining amount to be paid for this semester is: ₹${fee[semester].balance}`;
      }

      // Update the payment mode
      fee.mode = mode;

      // Save the updated fee record
      await fee.save();

      res.status(200).json({ 
        status: 200, 
        message: `Fee details updated successfully. ${message}`, 
        data: fee 
      });
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
// exports.editFee = [
//   authMiddleware(["principalAccess", "teacherAccess"]), // Only allow principal and teacher to edit fee records
//   async (req, res) => {
//     const { studentId } = req.params; // Use studentId to identify the fee record
//     const {
//       mode,
//       amountPaid,
//       discount,
//       fine,
//       feesGroup,
//       feesCode,
//       section,
//       class: studentClass,
//     } = req.body;

//     try {
//       // Validate required fields
//       if (!feesGroup || !feesCode || !section || !studentClass) {
//         return res
//           .status(400)
//           .json({ status:400, message: "feesGroup, feesCode, section, and class are required" });
//       }

//       // Allowed payment modes
//       const allowedModes = ["Cash", "Cheque", "DD", "Bank Transfer", "UPI", "Card"];
//       if (mode && !allowedModes.includes(mode)) {
//         return res
//           .status(400)
//           .json({status:400,
//             message: `Invalid payment mode. Allowed modes are: ${allowedModes.join(", ")}`,
//           });
//       }

//       // Fetch the fee record by studentId and additional filters
//       let fee = await Fee.findOne({
//         studentId: new mongoose.Types.ObjectId(studentId),
//         feesGroup: feesGroup,
//         feesCode: feesCode,
//         section: section,
//         class: studentClass,
//       });

//       if (!fee) {
//         return res.status(404).json({status:404, message: "Fee record not found" });
//       }

//       // Validate and ensure no negative values for discount, fine, and amount paid
//       const validDiscount = Math.max(0, Math.min(isNaN(discount) ? fee.discount : Number(discount), fee.amount));
//       const validFine = Math.max(0, isNaN(fine) ? fee.fine : Number(fine));
//       const validAmountPaid = Math.max(0, isNaN(amountPaid) ? 0 : Number(amountPaid));

//       // Calculate the total amount after discount and fine
//       const totalAmount = fee.amount - validDiscount + validFine;

//       // Ensure the paid amount does not exceed the total amount
//       if (fee.paid + validAmountPaid > totalAmount) {
//         return res
//           .status(400)
//           .json({ status:400, message: "Paid amount cannot exceed the total fee amount" });
//       }

//       // Update the balance and paid amount
//       const updatedBalance = totalAmount - (fee.paid + validAmountPaid);

//       // Update fee record fields
//       fee.feesGroup = feesGroup || fee.feesGroup;
//       fee.feesCode = feesCode || fee.feesCode;
//       fee.section = section || fee.section;
//       fee.class = studentClass || fee.class;
//       fee.mode = mode || fee.mode;
//       fee.discount = validDiscount;
//       fee.fine = validFine;
//       fee.paid += validAmountPaid;
//       fee.balance = updatedBalance;

//       // Update the status based on the balance
//       if (fee.balance <= 0) {
//         fee.status = "Paid"; // If balance is 0, the fee is fully paid
//       } else if (fee.paid > 0 && fee.balance > 0) {
//         fee.status = "Partial"; // If there's some amount paid but balance is still remaining
//       } else {
//         fee.status = "Pending"; // If no amount has been paid yet
//       }

//       // Save the updated fee record
//       await fee.save();

//       res.status(200).json({ status:200, message: "Fee record updated successfully", data: fee });
//     } catch (err) {
//       console.error("Error editing fee:", err);
//       res.status(500).json({ status:500, message: "Server error", error: err.message });
//     }
//   },
// ];

exports.editFee = [
  authMiddleware(["principalAccess", "teacherAccess"]), // Only allow principal and teacher to edit fee
  async (req, res) => {
    const { studentId } = req.params; // Student ID from URL
    const { mode, amountPaid, discount, fine, feesGroup, feesCode, section, class: studentClass, semester } = req.body;

    try {
      // Validate required fields
      if (!feesGroup || !feesCode || !section || !studentClass || !semester) {
        return res.status(400).json({ status: 400, message: 'feesGroup, feesCode, section, class, and semester are required' });
      }

      // Allowed payment modes
      const allowedModes = ['Cash', 'Cheque', 'DD', 'Bank Transfer', 'UPI', 'Card'];
      if (!allowedModes.includes(mode)) {
        return res.status(400).json({ status: 400, message: `Invalid payment mode. Allowed modes are: ${allowedModes.join(', ')}` });
      }

      // Convert studentId to ObjectId
      const studentIdObject = new mongoose.Types.ObjectId(studentId);

      // Fetch the fee record
      let fee = await Fee.findOne({ studentId: studentIdObject, section, class: studentClass });

      if (!fee) {
        return res.status(404).json({ status: 404, message: "Fee record not found" });
      }

      // Validate the semester field
      if (!fee[semester]) {
        return res.status(400).json({ status: 400, message: "Invalid semester. Allowed semesters are: sem1, sem2." });
      }

      // Remove old fee details for the semester
      fee[semester].paid = 0; // Reset the old paid amount
      fee[semester].discount = 0; // Reset the old discount
      fee[semester].fine = 0; // Reset the old fine
      fee[semester].balance = fee[semester].amount; // Reset the balance to the original amount

      // Validate and ensure no negative values for discount, fine, and amount paid
      const validDiscount = Math.max(0, Math.min(isNaN(discount) ? 0 : Number(discount), fee[semester].amount));
      const validAmountPaid = Math.max(0, isNaN(amountPaid) ? 0 : Number(amountPaid));
      const validFine = Math.max(0, isNaN(fine) ? 0 : Number(fine));

      // Calculate the total amount after discount and fine
      const totalAmount = fee[semester].amount - validDiscount + validFine;

      // Ensure the paid amount does not exceed the total amount
      if (validAmountPaid > totalAmount) {
        return res.status(400).json({ status: 400, message: 'Paid amount cannot exceed the total fee amount' });
      }

      // Update the balance and paid amount for the semester
      fee[semester].paid += validAmountPaid;
      fee[semester].discount = validDiscount;
      fee[semester].fine = validFine;
      fee[semester].balance = totalAmount - fee[semester].paid;

      // Update the status based on the balance
      if (fee[semester].balance <= 0) {
        fee[semester].status = 'Paid'; // If balance is 0, the fee is fully paid
      } else if (fee[semester].paid > 0 && fee[semester].balance > 0) {
        fee[semester].status = 'Partial'; // If there's some amount paid but balance is still remaining
      } else {
        fee[semester].status = 'Unpaid'; // If no amount has been paid yet
      }

      // Update the overall balance and status based on both semesters
      const totalBalance = fee.sem1.balance + fee.sem2.balance;

      fee.balance = totalBalance;

      // Update the overall fee status based on semester statuses
      if (fee.sem1.status === 'Paid' && fee.sem2.status === 'Paid') {
        fee.status = 'Paid'; // If both semesters are paid
      } else if (fee.sem1.status === 'Partial' || fee.sem2.status === 'Partial') {
        fee.status = 'Partial'; // If either semester is partially paid
      } else {
        fee.status = 'Unpaid'; // If both semesters are unpaid
      }

      // Provide message for remaining fee or confirmation of full payment
      let message = '';
      if (fee[semester].status === 'Paid') {
        message = 'The fee for this semester is already paid.';
      } else if (fee[semester].status === 'Partial') {
        message = `Remaining amount to be paid for this semester is: ₹${fee[semester].balance}`;
      } else {
        message = `Remaining amount to be paid for this semester is: ₹${fee[semester].balance}`;
      }

      // Update the payment mode
      fee.mode = mode;

      // Save the updated fee record
      await fee.save();

      res.status(200).json({ 
        status: 200, 
        message: 'Fee details updated successfully. ' + message, 
        data: fee 
      });
    } catch (err) {
      console.error('Error updating fee details:', err);
      res.status(500).json({ status: 500, message: 'Server error', error: err.message });
    }
  }
];

