const express = require('express');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const Admission = require('../models/Admission');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const bcrypt = require('bcrypt');
// router.post(
//   '/add', // Route endpoint for adding a new admission
//   [
//     check('admissionNo').notEmpty().withMessage('Admission No is required'),
//     check('class').notEmpty().withMessage('Class is required'),
//     check('section')
//       .notEmpty()
//       .withMessage('Section is required')
//       .isIn(['A', 'B', 'C', 'D'])
//       .withMessage('Invalid section, it should be one of A, B, C, D'),
//     check('firstName').notEmpty().withMessage('First Name is required'),
//     check('gender').notEmpty().withMessage('Gender is required')
//       .isIn(['Male', 'Female'])
//       .withMessage('Gender should be Male or Female'),
//     check('dateOfBirth').notEmpty().withMessage('Date of Birth is required').isDate().withMessage('Invalid Date of Birth'),
//     check('mobileNumber').isMobilePhone().withMessage('Invalid Mobile Number'),
//     check('admissionDate').notEmpty().withMessage('Admission Date is required').isDate().withMessage('Invalid Admission Date'),
//     check('email').isEmail().withMessage('Invalid email'),
//     check('password').notEmpty().withMessage('Password is required'), // Ensure password is provided
//   ],
//   async (req, res) => {
//     // Validate the request
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ status: 400, message: 'Validation failed', errors: errors.array() });
//     }

//     try {
//       const {
//         admissionNo,
//         rollNo,
//         class: studentClass,
//         section,
//         firstName,
//         lastName,
//         gender,
//         dateOfBirth,
//         category,
//         religion,
//         caste,
//         mobileNumber,
//         email,
//         admissionDate,
//         bloodGroup,
//         houseaddressaddressaddressaddress,
//         height,
//         weight,
//         measurementDate,
//         medicalHistory,
//         password,
//       } = req.body;

//       // Check for Duplicate Admission No
//       const existingAdmission = await Admission.findOne({ admissionNo });
//       if (existingAdmission) {
//         return res.status(400).json({ status: 400, message: 'Admission No already exists' });
//       }

//       // Check if the email is already in use
//       const existingUser = await User.findOne({ email });
//       if (existingUser) {
//         return res.status(400).json({ status: 400, message: 'Email is already registered' });
//       }

//       // Create a New User Document (for login purposes)
//       const newUser = new User({
//         email,
//         password, // Store the plain password here (not recommended for production)
//         username: `${firstName} ${lastName}`, 
//         principalAccess: false,
//         teacherAccess: false,
//         studentAccess: true,
//       });

//       const savedUser = await newUser.save();

//       // Create a New Admission Document
//       const newAdmission = new Admission({
//         admissionNo,
//         rollNo,
//         class: studentClass,
//         section,
//         firstName,
//         lastName,
//         gender,
//         dateOfBirth: new Date(dateOfBirth),
//         category,
//         religion,
//         caste,
//         mobileNumber,
//         email,
//         password,
//         admissionDate: new Date(admissionDate),
//         bloodGroup,
//         houseaddressaddressaddressaddress,
//         height,
//         weight,
//         measurementDate: measurementDate ? new Date(measurementDate) : null,
//         medicalHistory,
//         userId: savedUser._id,
//       });

//       const savedAdmission = await newAdmission.save();

//       // Create a New Student Document (linking to the User)
//       const newStudent = new Student({
//         admissionNo,
//         name: `${firstName} ${lastName}`,
//         rollNo,
//         class: studentClass,
//         section,
//         category,
//         dateOfBirth: new Date(dateOfBirth),
//         gender,
//         mobileNumber,
//         isBlocked: false,
//         isMultiClass: false,
//         deleted: false,
//         assignedTeacher: null,
//         userId: savedUser._id,
//       });

//       const savedStudent = await newStudent.save();

//       // Create and Save the Attendance Document for the newly saved student
//       const newAttendance = new Attendance({
//         studentId: savedStudent._id,  // Link the attendance to the saved student
//         admissionNo,
//         class: studentClass,
//         section: section,
//         name: `${firstName} ${lastName}`,
//         rollNo,
//         attendanceDate: new Date(),
//         attendanceStatus: 'Present',  // Default attendance status to 'Present'
//       });

//       await newAttendance.save();  // Save the attendance record

//       // Respond with the data
//       res.status(200).json({
//         status: 200,
//         message: 'Admission, student, and attendance added successfully.',
//         admission: savedAdmission,
//         student: savedStudent,
//         user: savedUser,
//         attendance: newAttendance,  // Include attendance in the response
//       });

//     } catch (error) {
//       console.error('Error adding admission details:', error);
//       res.status(500).json({ status: 500, message: 'Error adding admission details', error });
//     }
//   }
// );
router.post(
  '/add',
  authMiddleware(['principalAccess', 'teacherAccess']),
  [
    check('admissionNo').notEmpty().withMessage('Admission No is required'),
    check('class').notEmpty().withMessage('Class is required'),
    check('section')
      .notEmpty()
      .withMessage('Section is required')
      .isIn(['A', 'B', 'C', 'D'])
      .withMessage('Invalid section, it should be one of A, B, C, D'),
    check('firstName').notEmpty().withMessage('First Name is required'),
    check('gender')
      .notEmpty()
      .withMessage('Gender is required')
      .isIn(['Male', 'Female'])
      .withMessage('Gender should be Male or Female'),
    check('dateOfBirth').notEmpty().withMessage('Date of Birth is required').isDate().withMessage('Invalid Date of Birth'),
    check('mobileNumber').isMobilePhone().withMessage('Invalid Mobile Number'),
    check('admissionDate').notEmpty().withMessage('Admission Date is required').isDate().withMessage('Invalid Admission Date'),
    check('email').isEmail().withMessage('Invalid email'),
    check('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 400, message: 'Validation failed', errors: errors.array() });
    }

    const {
      admissionNo,
      rollNo,
      class: studentClass,
      section,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      category,
      religion,
      caste,
      mobileNumber,
      email,
      admissionDate,
      bloodGroup,
      houseaddress,
      height,
      weight,
      measurementDate,
      medicalHistory,
      password,
      feeAmount,
    } = req.body;

    // Extract the part before '@' symbol for username
    const emailParts = email.split('@');
    const username = emailParts[0];  // This will be used as the username

    try {
      // Check if email or username already exists in the User collection
      const existingUser = await User.findOne({ $or: [{ email }] });
      if (existingUser) {
        return res.status(400).json({
          status: 400,
          message: 'Email  already exists. Please use a different email .',
        });
      }

      const existingAdmission = await Admission.findOne({ admissionNo });
      if (existingAdmission) {
        return res.status(400).json({ status: 400, message: 'Admission No already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        email,
        password: hashedPassword,
        username: username,
        principalAccess: false,
        teacherAccess: false,
        studentAccess: true,
      });

      const savedUser = await newUser.save();

      const newAdmission = new Admission({
        admissionNo,
        rollNo,
        class: studentClass,
        section,
        firstName,
        lastName,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        category,
        religion,
        caste,
        mobileNumber,
        email,
        password: hashedPassword,
        admissionDate: new Date(admissionDate),
        bloodGroup,
        houseaddress,
        height,
        weight,
        measurementDate: measurementDate ? new Date(measurementDate) : null,
        medicalHistory,
        feeAmount, // Keep feeAmount from request body
        userId: savedUser._id,
      });

      const savedAdmission = await newAdmission.save();

      const newStudent = new Student({
        admissionNo,
        name: `${firstName} ${lastName}`,
        rollNo,
        class: studentClass,
        section,
        category,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        mobileNumber,
        isBlocked: false,
        isMultiClass: false,
        deleted: false,
        assignedTeacher: null,
        userId: savedUser._id,
      });

      const savedStudent = await newStudent.save();

      const newAttendance = new Attendance({
        studentId: savedStudent._id,
        admissionNo,
        class: studentClass,
        section: section,
        name: `${firstName} ${lastName}`,
        rollNo,
        attendanceDate: new Date(),
        attendanceStatus: 'Present',
      });

      await newAttendance.save();

      res.status(200).json({
        status: 200,
        message: 'Admission, student, and attendance added successfully.',
        admission: savedAdmission,
        student: savedStudent,
        user: savedUser,
        attendance: newAttendance,
      });
    } catch (error) {
      console.error('Error adding admission details:', error);
      res.status(400).json({ status: 400, message: 'Error adding admission details', error });
    }
  }
);


module.exports = router;  