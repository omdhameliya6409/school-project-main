const Fee = require('../models/Fee');
const mongoose = require("mongoose");
const authMiddleware = require('../middleware/authMiddleware'); // Import the authMiddleware
const { v4: uuidv4 } = require('uuid'); 
const Student = require('../models/Student');
const Admission = require('../models/Admission');

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
        return res.status(404).json({ status: 404, message: 'No students found for the selected class and section' });
      }

      // Step 2: Find fee data for these students
      const fees = await Fee.find({ studentId: { $in: students.map(student => student._id) } })
        .populate('studentId', 'name class section admissionNo dateOfBirth gender category mobileNumber'); // Include admissionFee in the populated student data

      // Step 3: Create the response for each student
      const studentFees = students.map(student => {
        // Find fee data for the student
        const fee = fees.find(fee => fee.studentId._id.toString() === student._id.toString());

        // Retrieve the admission fee from the student's record, or default to 2000
        const admissionFee = student.admissionFee || 2000; // Default to 2000 if admissionFee is not present

        // If fee exists, calculate status (Paid or Pending)
        if (fee) {
          const sem1Total = fee.sem1.amount + admissionFee;
          const sem2Total = fee.sem2.amount;
          const totalAmount = sem1Total + sem2Total;
          const totalPaid = fee.sem1.paid + fee.sem2.paid + admissionFee;
          const totalBalance = totalAmount - totalPaid;

          const status = totalBalance <= 0 ? 'Paid' : 'Pending';

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
            admissionFee: admissionFee, 
            feeStatus: status, // Fee status (Paid or Pending)
            feeDetails: {
              feesGroup: fee.feesGroup,
              feesCode: fee.feesCode,
              amount: totalAmount, // Total amount includes sem1, sem2, and admissionFee
              discount: fee.discount,
              fine: fee.fine,
              paid: totalPaid, // Total paid includes sem1, sem2, and admissionFee
              balance: totalBalance // Total balance includes sem1, sem2, and admissionFee
            },
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
            amount: admissionFee, // Only admission fee is applied here
            discount: 0,
            fine: 0,
            paid: admissionFee, // Show admission fee as paid
            balance: admissionFee // The balance is the admission fee amount
          },
          admissionFee: admissionFee // Show the admission fee in the response
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

//       // Fetch the existing fee record for the student
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

//       // Update the overall status based on semester statuses
//       if (fee.sem1.status === 'Paid' && fee.sem2.status === 'Paid') {
//         fee.status = 'Paid'; // If both semesters are paid
//       } else if (fee.sem1.status === 'Partial' || fee.sem2.status === 'Partial') {
//         fee.status = 'Partial'; // If either semester is partially paid
//       } else {
//         fee.status = 'Unpaid'; // If both semesters are unpaid
//       }

//       // Update the overall balance
//       fee.balance = fee.sem1.balance + fee.sem2.balance;

//       // Provide message for remaining fee or confirmation of full payment
//       let message = '';
//       if (fee[semester].status === 'Paid') {
//         message = 'The fee for this semester is already paid.';
//       } else if (fee[semester].status === 'Partial') {
//         message = `Remaining amount to be paid for this semester is: ₹${fee[semester].balance}`;
//       } else {
//         message = `Remaining amount to be paid for this semester is: ₹${fee[semester].balance}`;
//       }

//       // Update the payment mode
//       fee.mode = mode;

//       // Save the updated fee record
//       await fee.save();

//       res.status(200).json({ 
//         status: 200, 
//         message: `Fee details updated successfully. ${message}`, 
//         data: fee 
//       });
//     } catch (err) {
//       console.error('Error collecting fee:', err);
//       res.status(500).json({ status: 500, message: 'Server error', error: err.message });
//     }
//   }
// ];
// exports.collectFee = [
//   authMiddleware(["principalAccess", "teacherAccess"]), // Only allow principal and teacher to collect fees
//   async (req, res) => {
//     const { studentId } = req.params; // Student ID from URL
//     const {
//       addmissionNo,
//       mode,
//       amountPaid,
//       discount,
//       fine,
//       feesGroup,
//       feesCode,
//       section,
//       class: studentClass,
//       semester,
//     } = req.body;

//     try {
//       // Validate required fields
//       if (!feesGroup || !feesCode || !section || !studentClass || !semester || addmissionNo) {
//         return res.status(400).json({
//           status: 400,
//           message: "feesGroup, feesCode, section, class, addmissionNo and semester are required",
//         });
//       }

//       // Allowed payment modes
//       const allowedModes = ["Cash", "Cheque", "DD", "Bank Transfer", "UPI", "Card"];
//       if (!allowedModes.includes(mode)) {
//         return res.status(400).json({
//           status: 400,
//           message: `Invalid payment mode. Allowed modes are: ${allowedModes.join(", ")}`,
//         });
//       }

//       // Convert studentId to ObjectId
//       const studentIdObject = new mongoose.Types.ObjectId(studentId);

//       // Fetch or create a fee record for the student
//       let fee = await Fee.findOne({ studentId: studentIdObject, section, class: studentClass });
//       if (!fee) {
//         const classFees = feeStructure[studentClass];
//         if (!classFees) {
//           return res.status(400).json({
//             status: 400,
//             message: "Class not found in fee structure",
//           });
//         }

//         // Initialize fee record
//         fee = new Fee({
//           addmissionNo,
//           studentId: studentIdObject,
//           feesGroup,
//           feesCode,
//           section,
//           class: studentClass,
//           // dueDate: new Date(),
//           status: "Unpaid",
//           paymentId: uuidv4(),
//           mode,
//           discount: 0,
//           fine: 0,
//           paid: 0,
//           balance: 0,
//           sem1: {
//             amount: classFees.sem1,
//             paid: 0,
//             balance: classFees.sem1,
//             status: "Unpaid",
//           },
//           sem2: {
//             amount: classFees.sem2,
//             paid: 0,
//             balance: classFees.sem2,
//             status: "Unpaid",
//           },
//           totalAmount: classFees.sem1 + classFees.sem2,
//           totalPaid: 0,
//           totalBalance: classFees.sem1 + classFees.sem2,
//         });
//       }

//       // Validate the semester field
//       if (!fee[semester]) {
//         return res.status(400).json({
//           status: 400,
//           message: "Invalid semester. Allowed semesters are: sem1, sem2.",
//         });
//       }

//       // Ensure no negative values for discount, fine, and amount paid
//       const validDiscount = Math.max(0, Math.min(isNaN(discount) ? 0 : Number(discount), fee[semester].amount));
//       const validFine = Math.max(0, isNaN(fine) ? 0 : Number(fine));
//       const validAmountPaid = Math.max(0, isNaN(amountPaid) ? 0 : Number(amountPaid));

//       // Calculate the total fee for the semester after applying discount and fine
//       const totalFee = fee[semester].amount - validDiscount + validFine;

//       // Ensure the paid amount does not exceed the total fee
//       if (fee[semester].paid + validAmountPaid > totalFee) {
//         return res.status(400).json({
//           status: 400,
//           message: "Paid amount cannot exceed the total fee amount",
//         });
//       }

//       // Update semester-specific details
//       fee[semester].paid += validAmountPaid;
//       fee[semester].balance = totalFee - fee[semester].paid;

//       // Update semester status
//       fee[semester].status =
//         fee[semester].balance === 0
//           ? "Paid"
//           : fee[semester].paid > 0
//           ? "Partial"
//           : "Unpaid";

//       // Update overall fee details
//       fee.paid = fee.sem1.paid + fee.sem2.paid;
//       fee.balance = fee.sem1.balance + fee.sem2.balance;
//       fee.discount = (fee.discount || 0) + validDiscount;
//       fee.fine = (fee.fine || 0) + validFine;
//       fee.status =
//         fee.sem1.status === "Paid" && fee.sem2.status === "Paid"
//           ? "Paid"
//           : fee.sem1.status === "Partial" || fee.sem2.status === "Partial"
//           ? "Partial"
//           : "Unpaid";

//       // Save the updated fee record
//       await fee.save();

//       // Update the student's fee status
//       await Student.findByIdAndUpdate(studentIdObject, {
//         feeStatus: fee.status,
//       });

//       // Prepare response message
//       const remainingBalance = fee.sem1.balance + fee.sem2.balance;
//       const message =
//         fee.status === "Paid"
//           ? "Both semester fees are fully paid."
//           : `Remaining fee balance: ₹${remainingBalance}`;

//       // Respond with the updated fee and message, including detailed semester and total fee information
//       res.status(200).json({
//         status: 200,
//         message: `Fee details updated successfully. ${message}`,
//         data: {
//           _id: fee._id,
//           addmissionNo: fee.addmissionNo,
//           studentId: fee.studentId,
//           feesGroup: fee.feesGroup,
//           feesCode: fee.feesCode,
//           class: fee.class,
//           section: fee.section,
//           // dueDate: fee.dueDate,
//           status: fee.status,
//           paymentId: fee.paymentId,
//           mode: fee.mode,
//           discount: fee.discount,
//           fine: fee.fine,
//           createdAt: fee.createdAt,
//           updatedAt: fee.updatedAt,
//           __v: fee.__v,
//           sem1: {
//             amount: fee.sem1.amount,
//             paid: fee.sem1.paid,
//             balance: fee.sem1.balance,
//             status: fee.sem1.status,
//           },
//           sem2: {
//             amount: fee.sem2.amount,
//             paid: fee.sem2.paid,
//             balance: fee.sem2.balance,
//             status: fee.sem2.status,
//           },
//           total: {
//             paid: fee.paid,
//             balance: fee.balance,
//           },
//         },
//       });
//     } catch (err) {
//       console.error("Error collecting fee:", err);
//       res.status(500).json({
//         status: 500,
//         message: "Server error",
//         error: err.message,
//       });
//     }
//   },
// ];

// exports.collectFee = [
//   authMiddleware(["principalAccess", "teacherAccess"]), // Only allow principal and teacher to collect fees
//   async (req, res) => {
//     const { studentId } = req.params; // Student ID from URL
//     const {
//       admissionNo, // Fixed the typo: 'addmissionNo' -> 'admissionNo'
//       mode,
//       amountPaid,
//       discount,
//       fine,
//       feesGroup,
//       feesCode,
//       section,
//       class: studentClass,
//       semester,
//     } = req.body;

//     try {
//       // Validate required fields
//       if (!feesGroup || !feesCode || !section || !studentClass || !semester || !admissionNo) {
//         return res.status(400).json({
//           status: 400,
//           message: "feesGroup, feesCode, section, class, admissionNo and semester are required",
//         });
//       }

//       // Allowed payment modes
//       const allowedModes = ["Cash", "Cheque", "DD", "Bank Transfer", "UPI", "Card"];
//       if (!allowedModes.includes(mode)) {
//         return res.status(400).json({
//           status: 400,
//           message: `Invalid payment mode. Allowed modes are: ${allowedModes.join(", ")}`,
//         });
//       }

//       // Convert studentId to ObjectId
//       const studentIdObject = new mongoose.Types.ObjectId(studentId);

//       // Fetch the student record to verify the existence of the student
//       const student = await Student.findById(studentIdObject);
//       if (!student) {
//         return res.status(404).json({ status: 404, message: "Student not found" });
//       }

//       // Fetch or create a fee record for the student
//       let fee = await Fee.findOne({ studentId: studentIdObject, section, class: studentClass });
//       if (!fee) {
//         const classFees = feeStructure[studentClass];
//         if (!classFees) {
//           return res.status(400).json({
//             status: 400,
//             message: "Class not found in fee structure",
//           });
//         }

//         // Set due date based on the semester (example: semester 1 could be February, semester 2 could be August)
//         const dueDate = semester === "sem1" ? new Date(`2025-02-01`) : new Date(`2025-08-01`);

//         // Initialize fee record
//         fee = new Fee({
//           admissionNo, // Fixed typo
//           studentId: studentIdObject,
//           feesGroup,
//           feesCode,
//           section,
//           class: studentClass,
//           dueDate, // Set the due date
//           status: "Unpaid",
//           paymentId: uuidv4(),
//           mode,
//           discount: 0,
//           fine: 0,
//           paid: 0,
//           balance: 0,
//           sem1: {
//             amount: classFees.sem1,
//             paid: 0,
//             balance: classFees.sem1,
//             status: "Unpaid",
//           },
//           sem2: {
//             amount: classFees.sem2,
//             paid: 0,
//             balance: classFees.sem2,
//             status: "Unpaid",
//           },
//           totalAmount: classFees.sem1 + classFees.sem2,
//           totalPaid: 0,
//           totalBalance: classFees.sem1 + classFees.sem2,
//         });
//       }

//       // Validate the semester field
//       if (!fee[semester]) {
//         return res.status(400).json({
//           status: 400,
//           message: "Invalid semester. Allowed semesters are: sem1, sem2.",
//         });
//       }

//       // Ensure no negative values for discount, fine, and amount paid
//       const validDiscount = Math.max(0, Math.min(isNaN(discount) ? 0 : Number(discount), fee[semester].amount));
//       const validFine = Math.max(0, isNaN(fine) ? 0 : Number(fine));
//       const validAmountPaid = Math.max(0, isNaN(amountPaid) ? 0 : Number(amountPaid));

//       // Calculate the total fee for the semester after applying discount and fine
//       const totalFee = fee[semester].amount - validDiscount + validFine;

//       // Ensure the paid amount does not exceed the total fee
//       if (fee[semester].paid + validAmountPaid > totalFee) {
//         return res.status(400).json({
//           status: 400,
//           message: "Paid amount cannot exceed the total fee amount",
//         });
//       }

//       // Update semester-specific details
//       fee[semester].paid += validAmountPaid;
//       fee[semester].balance = totalFee - fee[semester].paid;

//       // Update semester status
//       fee[semester].status =
//         fee[semester].balance === 0
//           ? "Paid"
//           : fee[semester].paid > 0
//           ? "Partial"
//           : "Unpaid";

//       // Update overall fee details
//       fee.paid = fee.sem1.paid + fee.sem2.paid;
//       fee.balance = fee.sem1.balance + fee.sem2.balance;
//       fee.discount = (fee.discount || 0) + validDiscount;
//       fee.fine = (fee.fine || 0) + validFine;
//       fee.status =
//         fee.sem1.status === "Paid" && fee.sem2.status === "Paid"
//           ? "Paid"
//           : fee.sem1.status === "Partial" || fee.sem2.status === "Partial"
//           ? "Partial"
//           : "Unpaid";

//       // Save the updated fee record
//       await fee.save();

//       // Update the student's fee status
//       await Student.findByIdAndUpdate(studentIdObject, {
//         feeStatus: fee.status,
//       });

//       // Prepare response message
//       const remainingBalance = fee.sem1.balance + fee.sem2.balance;
//       const message =
//         fee.status === "Paid"
//           ? "Both semester fees are fully paid."
//           : `Remaining fee balance: ₹${remainingBalance}`;

//       // Respond with the updated fee and message, including detailed semester and total fee information
//       res.status(200).json({
//         status: 200,
//         message: `Fee details updated successfully. ${message}`,
//         Fee: {
//           _id: fee._id,
//           admissionNo: fee.admissionNo,
//           studentId: fee.studentId,
//           feesGroup: fee.feesGroup,
//           feesCode: fee.feesCode,
//           class: fee.class,
//           section: fee.section,
//           status: fee.status,
//           paymentId: fee.paymentId,
//           mode: fee.mode,
//           discount: fee.discount,
//           fine: fee.fine,
//           createdAt: fee.createdAt,
//           updatedAt: fee.updatedAt,
//           __v: fee.__v,
//           sem1: {
//             amount: fee.sem1.amount,
//             paid: fee.sem1.paid,
//             balance: fee.sem1.balance,
//             status: fee.sem1.status,
//           },
//           sem2: {
//             amount: fee.sem2.amount,
//             paid: fee.sem2.paid,
//             balance: fee.sem2.balance,
//             status: fee.sem2.status,
//           },
//           total: {
//             paid: fee.paid,
//             balance: fee.balance,
//           },
//         },
//       });
//     } catch (err) {
//       console.error("Error collecting fee:", err);
//       res.status(500).json({
//         status: 500,
//         message: "Server error",
//         error: err.message,
//       });
//     }
//   },
// ];

exports.collectFee = [
  authMiddleware(["principalAccess", "teacherAccess"]), // Only allow principal and teacher to collect fees
  async (req, res) => {
    const { studentId } = req.params; // Student ID from URL
    const {
      admissionNo,
      mode,
      amountPaid,
      discount,
      fine,
      feesGroup,
      feesCode,
      section,
      class: studentClass,
      semester,
    } = req.body;

    try {
      // Validate required fields
      if (!feesGroup || !feesCode || !section || !studentClass || !semester || !admissionNo) {
        return res.status(400).json({
          status: 400,
          message: "feesGroup, feesCode, section, class, admissionNo and semester are required",
        });
      }

      // Allowed payment modes
      const allowedModes = ["Cash", "Cheque", "DD", "Bank Transfer", "UPI", "Card"];
      if (!allowedModes.includes(mode)) {
        return res.status(400).json({
          status: 400,
          message: `Invalid payment mode. Allowed modes are: ${allowedModes.join(", ")}`,
        });
      }

      // Convert studentId to ObjectId
      const studentIdObject = new mongoose.Types.ObjectId(studentId);

      // Fetch the student record to verify the existence of the student
      const student = await Student.findById(studentIdObject);
      if (!student) {
        return res.status(404).json({ status: 404, message: "Student not found" });
      }

      // Fetch the admission record to get the admission fee
      const admissionRecord = await Admission.findOne({ admissionNo });
      if (!admissionRecord) {
        return res.status(404).json({ status: 404, message: "Admission record not found" });
      }

      const admissionFee = admissionRecord.admissionFee || 2000; // Default to 2000 if admission fee is not present

      // Fetch or create a fee record for the student
      let fee = await Fee.findOne({ studentId: studentIdObject, section, class: studentClass });
      if (!fee) {
        const classFees = feeStructure[studentClass] || { sem1: 7000, sem2: 6000 }; // Adjust if needed

        // Set due date based on the semester
        const dueDate = semester === "sem1" ? new Date(`2025-02-01`) : new Date(`2025-08-01`);

        // Initialize fee record with admission fee included in the paid amount
        fee = new Fee({
          admissionNo,
          studentId: studentIdObject,
          feesGroup,
          feesCode,
          section,
          class: studentClass,
          dueDate,
          status: "Unpaid",
          paymentId: uuidv4(),
          mode,
          discount: 0,
          fine: 0,
          paid: admissionFee, // Include admission fee as paid by default
          balance: classFees.sem1 + classFees.sem2 + admissionFee, // Include admission fee in total balance
          sem1: {
            amount: classFees.sem1,
            paid: admissionFee, // Include admission fee as part of sem1 paid
            balance: classFees.sem1,
            status: "Unpaid",
          },
          sem2: {
            amount: classFees.sem2,
            paid: 0,
            balance: classFees.sem2,
            status: "Unpaid",
          },
          totalAmount: classFees.sem1 + classFees.sem2 + admissionFee, // Include admission fee in total amount
          totalPaid: admissionFee, // Include admission fee in total paid
          totalBalance: classFees.sem1 + classFees.sem2 + admissionFee, // Include admission fee in total balance
        });
      }

      // Validate the semester field
      if (!fee[semester]) {
        return res.status(400).json({
          status: 400,
          message: "Invalid semester. Allowed semesters are: sem1, sem2.",
        });
      }

      // Ensure no negative values for discount, fine, and amount paid
      const validDiscount = Math.max(0, Math.min(isNaN(discount) ? 0 : Number(discount), fee[semester].amount));
      const validFine = Math.max(0, isNaN(fine) ? 0 : Number(fine));
      const validAmountPaid = Math.max(0, isNaN(amountPaid) ? 0 : Number(amountPaid));

      // Calculate the total fee for the semester after applying discount and fine
      const totalFee = fee[semester].amount - validDiscount + validFine;

      // Ensure the paid amount does not exceed the total fee
      if (fee[semester].paid + validAmountPaid > totalFee) {
        return res.status(400).json({
          status: 400,
          message: "Paid amount cannot exceed the total fee amount",
        });
      }

      // Update semester-specific details
      fee[semester].paid += validAmountPaid;
      fee[semester].balance = totalFee - fee[semester].paid;

      // Update semester status
      fee[semester].status =
        fee[semester].balance === 0
          ? "Paid"
          : fee[semester].paid > 0
          ? "Partial"
          : "Unpaid";

      // Update overall fee details
      fee.paid = fee.sem1.paid + fee.sem2.paid + admissionFee; // Add admission fee to total paid
      fee.balance = fee.sem1.balance + fee.sem2.balance;
      fee.discount = (fee.discount || 0) + validDiscount;
      fee.fine = (fee.fine || 0) + validFine;
      fee.status =
        fee.sem1.status === "Paid" && fee.sem2.status === "Paid"
          ? "Paid"
          : fee.sem1.status === "Partial" || fee.sem2.status === "Partial"
          ? "Partial"
          : "Unpaid";

      // Save the updated fee record
      await fee.save();

      // Update the student's fee status
      await Student.findByIdAndUpdate(studentIdObject, {
        feeStatus: fee.status,
      });

      // Prepare response message
      const remainingBalance = fee.sem1.balance + fee.sem2.balance;
      const message =
        fee.status === "Paid"
          ? "Both semester fees are fully paid, including the admission fee."
          : `Remaining fee balance including admission fee: ₹${remainingBalance}`;

      // Respond with the updated fee and message, including detailed semester and total fee information
      res.status(200).json({
        status: 200,
        message: `Fee details updated successfully. ${message}`,
        Fee: {
          _id: fee._id,
          admissionNo: fee.admissionNo,
          studentId: fee.studentId,
          feesGroup: fee.feesGroup,
          feesCode: fee.feesCode,
          class: fee.class,
          section: fee.section,
          status: fee.status,
          paymentId: fee.paymentId,
          mode: fee.mode,
          discount: fee.discount,
          fine: fee.fine,
          createdAt: fee.createdAt,
          updatedAt: fee.updatedAt,
          __v: fee.__v,
          sem1: {
            amount: fee.sem1.amount,
            paid: fee.sem1.paid,
            balance: fee.sem1.balance,
            status: fee.sem1.status,
          },
          sem2: {
            amount: fee.sem2.amount,
            paid: fee.sem2.paid,
            balance: fee.sem2.balance,
            status: fee.sem2.status,
          },
           // Admission fee from the admission record
          total: {
            paid: fee.paid, // Total paid including admission fee
            balance: fee.balance, // Total balance including admission fee
            amount: fee.totalAmount, // Total amount including admission fee
          },
        },
      });
    } catch (err) {
      console.error("Error collecting fee:", err);
      res.status(500).json({
        status: 500,
        message: "Server error",
        error: err.message,
      });
    }
  },
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

// exports.editFee = [
//   authMiddleware(["principalAccess", "teacherAccess"]), // Only allow principal and teacher to edit fee
//   async (req, res) => {
//     const { studentId } = req.params; // Student ID from URL
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

//       // Fetch the fee record
//       let fee = await Fee.findOne({ studentId: studentIdObject, section, class: studentClass });

//       if (!fee) {
//         return res.status(404).json({ status: 404, message: "Fee record not found" });
//       }

//       // Validate the semester field
//       if (!fee[semester]) {
//         return res.status(400).json({ status: 400, message: "Invalid semester. Allowed semesters are: sem1, sem2." });
//       }

//       // Remove old fee details for the semester
//       fee[semester].paid = 0; // Reset the old paid amount
//       fee[semester].discount = 0; // Reset the old discount
//       fee[semester].fine = 0; // Reset the old fine
//       fee[semester].balance = fee[semester].amount; // Reset the balance to the original amount

//       // Validate and ensure no negative values for discount, fine, and amount paid
//       const validDiscount = Math.max(0, Math.min(isNaN(discount) ? 0 : Number(discount), fee[semester].amount));
//       const validAmountPaid = Math.max(0, isNaN(amountPaid) ? 0 : Number(amountPaid));
//       const validFine = Math.max(0, isNaN(fine) ? 0 : Number(fine));

//       // Calculate the total amount after discount and fine
//       const totalAmount = fee[semester].amount - validDiscount + validFine;

//       // Ensure the paid amount does not exceed the total amount
//       if (validAmountPaid > totalAmount) {
//         return res.status(400).json({ status: 400, message: 'Paid amount cannot exceed the total fee amount' });
//       }

//       // Update the balance and paid amount for the semester
//       fee[semester].paid += validAmountPaid;
//       fee[semester].discount = validDiscount;
//       fee[semester].fine = validFine;
//       fee[semester].balance = totalAmount - fee[semester].paid;

//       // Update the status based on the balance
//       if (fee[semester].balance <= 0) {
//         fee[semester].status = 'Paid'; // If balance is 0, the fee is fully paid
//       } else if (fee[semester].paid > 0 && fee[semester].balance > 0) {
//         fee[semester].status = 'Partial'; // If there's some amount paid but balance is still remaining
//       } else {
//         fee[semester].status = 'Unpaid'; // If no amount has been paid yet
//       }

//       // Update the overall balance and status based on both semesters
//       const totalBalance = fee.sem1.balance + fee.sem2.balance;

//       fee.balance = totalBalance;

//       // Update the overall fee status based on semester statuses
//       if (fee.sem1.status === 'Paid' && fee.sem2.status === 'Paid') {
//         fee.status = 'Paid'; // If both semesters are paid
//       } else if (fee.sem1.status === 'Partial' || fee.sem2.status === 'Partial') {
//         fee.status = 'Partial'; // If either semester is partially paid
//       } else {
//         fee.status = 'Unpaid'; // If both semesters are unpaid
//       }

//       // Provide message for remaining fee or confirmation of full payment
//       let message = '';
//       if (fee[semester].status === 'Paid') {
//         message = 'The fee for this semester is already paid.';
//       } else if (fee[semester].status === 'Partial') {
//         message = `Remaining amount to be paid for this semester is: ₹${fee[semester].balance}`;
//       } else {
//         message = `Remaining amount to be paid for this semester is: ₹${fee[semester].balance}`;
//       }

//       // Update the payment mode
//       fee.mode = mode;

//       // Save the updated fee record
//       await fee.save();

//       res.status(200).json({ 
//         status: 200, 
//         message: 'Fee details updated successfully. ' + message, 
//         data: fee 
//       });
//     } catch (err) {
//       console.error('Error updating fee details:', err);
//       res.status(500).json({ status: 500, message: 'Server error', error: err.message });
//     }
//   }
// ];

exports.editFee = [
  authMiddleware(["principalAccess", "teacherAccess"]), // Only allow principal and teacher to edit fee
  async (req, res) => {
    const { studentId } = req.params; // Student ID from URL
    const { mode, amountPaid, discount, fine, feesGroup, feesCode, section, class: studentClass, semester } = req.body;

    try {
      // Validate required fields
      if (!feesGroup || !feesCode || !section || !studentClass || !semester) {
        return res.status(400).json({
          status: 400,
          message: 'Required fields: feesGroup, feesCode, section, class, and semester',
        });
      }

      // Allowed payment modes
      const allowedModes = ['Cash', 'Cheque', 'DD', 'Bank Transfer', 'UPI', 'Card'];
      if (!allowedModes.includes(mode)) {
        return res.status(400).json({
          status: 400,
          message: `Invalid payment mode. Allowed modes: ${allowedModes.join(', ')}`,
        });
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
        return res.status(400).json({
          status: 400,
          message: "Invalid semester. Allowed semesters: sem1, sem2",
        });
      }

      // Reset old semester details
      fee[semester] = {
        ...fee[semester],
        paid: 0,
        discount: 0,
        fine: 0,
        balance: fee[semester].amount,
        status: 'Unpaid',
      };

      // Validate discount, fine, and amountPaid
      const validDiscount = Math.max(0, Math.min(Number(discount) || 0, fee[semester].amount));
      const validFine = Math.max(0, Number(fine) || 0);
      const validAmountPaid = Math.max(0, Number(amountPaid) || 0);

      // Calculate total amount after adjustments
      const totalAmount = fee[semester].amount - validDiscount + validFine;

      if (validAmountPaid > totalAmount) {
        return res.status(400).json({ status: 400, message: 'Paid amount exceeds total fee' });
      }

      // Update semester details
      fee[semester] = {
        ...fee[semester],
        paid: validAmountPaid,
        discount: validDiscount,
        fine: validFine,
        balance: totalAmount - validAmountPaid,
        status: validAmountPaid === totalAmount ? 'Paid' : validAmountPaid > 0 ? 'Partial' : 'Unpaid',
      };

      // Update the total fee status
      const allSemesters = [fee.sem1, fee.sem2];
      fee.status = allSemesters.every(s => s.status === 'Paid')
        ? 'Paid'
        : allSemesters.some(s => s.status === 'Partial')
        ? 'Partial'
        : 'Unpaid';

      // Save fee record
      await fee.save();

      // Update student's fee status
      const student = await Student.findById(studentIdObject);
      if (student) {
        student.feesDetails = student.feesDetails || [];

        const existingDetail = student.feesDetails.find(
          detail => detail.feeRecordId.toString() === fee._id.toString()
        );

        if (existingDetail) {
          existingDetail.status = fee.status;
        } else {
          student.feesDetails.push({ feeRecordId: fee._id, status: fee.status });
        }

        student.feeStatus = student.feesDetails.every(detail => detail.status === 'Paid')
          ? 'Paid'
          : student.feesDetails.some(detail => detail.status === 'Partial')
          ? 'Partial'
          : 'Unpaid';

        await student.save();
      }

      // Respond with updated details
      res.status(200).json({
        status: 200,
        message: `Fee updated successfully. Remaining balance: ₹${fee.sem1.balance + fee.sem2.balance}`,
        data: {
          _id: fee._id,
          studentId: fee.studentId,
          feesGroup: fee.feesGroup,
          feesCode: fee.feesCode,
          class: fee.class,
          section: fee.section,
          status: fee.status,
          paymentId: fee.paymentId,
          mode: fee.mode,
          discount: fee.discount,
          fine: fee.fine,
          createdAt: fee.createdAt,
          updatedAt: fee.updatedAt,
          __v: fee.__v,
          sem1: {
            amount: fee.sem1.amount,
            paid: fee.sem1.paid,
            balance: fee.sem1.balance,
            status: fee.sem1.status,
          },
          sem2: {
            amount: fee.sem2.amount,
            paid: fee.sem2.paid,
            balance: fee.sem2.balance,
            status: fee.sem2.status,
          },
          total: {
            paid: fee.sem1.paid + fee.sem2.paid,
            balance: fee.sem1.balance + fee.sem2.balance,
          },
        },
      });
    } catch (err) {
      console.error('Error editing fee:', err);
      res.status(500).json({ status: 500, message: 'Server error', error: err.message });
    }
  },
];







// exports.getFeeOverview  amount = async (req, res) => {
//   try {
//     const feeStructure = {
//       "9": { sem1: 5000, sem2: 4000 },
//       "10": { sem1: 6000, sem2: 5000 },
//       "11": { sem1: 7000, sem2: 6000 },
//       "12": { sem1: 8000, sem2: 7000 },
//     };

//     // Fetch all students
//     const students = await Student.find();
//     const totalStudents = students.length;

//     let totalFees = 0;
//     let totalPaidFees = 0;

//     for (const student of students) {
//       const studentClass = student.class;
//       const studentId = student._id;

//       // Calculate total fees based on the student's class
//       if (feeStructure[studentClass]) {
//         totalFees += feeStructure[studentClass].sem1 + feeStructure[studentClass].sem2;
//       }

//       // Fetch and sum all fees paid by this student (using sem1.paid and sem2.paid)
//       const studentFees = await Fee.aggregate([
//         { $match: { studentId: studentId } },
//         {
//           $group: {
//             _id: null,
//             totalPaid: {
//               $sum: { $add: ["$sem1.paid", "$sem2.paid"] }, // Sum sem1.paid and sem2.paid
//             },
//           },
//         },
//       ]);

      

//       // Add this student's total paid fees to the overall total
//       if (studentFees.length > 0) {
//         totalPaidFees += studentFees[0].totalPaid;
//       }
//     }

//     const totalUnpaidFees = totalFees - totalPaidFees;

//     return res.status(200).json({
//       status: 200,
//       message: "Fee overview retrieved successfully",
//       data: {
//         totalStudents,
//         totalFees,
//         totalPaidFees,
//         totalUnpaidFees,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching fee overview:", error);
//     return res.status(500).json({
//       status: 500,
//       message: "An error occurred while fetching fee overview",
//     });
//   }
// };



