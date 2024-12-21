const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const authMiddleware = require('../middleware/authMiddleware'); // Middleware for authorization

const User = require('../models/User');
const Admission = require('../models/Admission');
const Student = require('../models/Student'); // Ensure the path is correct
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
//       return res.status(400).json({ errors: errors.array() });
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
//         house,
//         height,
//         weight,
//         measurementDate,
//         medicalHistory,
//         password,
//       } = req.body;

//       // Check for Duplicate Admission No
//       const existingAdmission = await Admission.findOne({ admissionNo });
//       if (existingAdmission) {
//         return res.status(400).json({ message: 'Admission No already exists' });
//       }

//       // Check if the email is already in use
//       const existingUser = await User.findOne({ email });
//       if (existingUser) {
//         return res.status(400).json({ message: 'Email is already registered' });
//       }

//       // Create a New User Document (for login purposes)
//       const newUser = new User({
//         email,
//         password, // Store the plain password here (not recommended for production)
//         username: `${firstName} ${lastName}`, // Add username or other info as needed
//         principalAccess: false,
//         teacherAccess: false,
//         studentAccess: true,
//       });

//       // Save the User Document
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
//         dateOfBirth: new Date(dateOfBirth), // Ensure date is in correct format
//         category,
//         religion,
//         caste,
//         mobileNumber,
//         email,
//         password,
//         admissionDate: new Date(admissionDate), // Ensure date is in correct format
//         bloodGroup,
//         house,
//         height,
//         weight,
//         measurementDate: measurementDate ? new Date(measurementDate) : null, // Handle optional fields
//         medicalHistory,
//         userId: savedUser._id,  // Link the admission to the User document
//       });

//       // Save the Admission
//       const savedAdmission = await newAdmission.save();

//       // Create a New Student Document (linking to the User)
//       const newStudent = new Student({
//         admissionNo,
//         name: `${firstName} ${lastName}`,
//         rollNo,
//         class: studentClass,
//         section,
//         dateOfBirth: new Date(dateOfBirth),
//         gender,
//         mobileNumber,
//         isBlocked: false, // Add other fields as needed
//         isMultiClass: false,
//         deleted: false,
//         assignedTeacher: null,
//         userId: savedUser._id, // Link the student to the User
//       });

//       // Save the Student Document
//       await newStudent.save();

//       res.status(201).json({
//         message: 'Admission and student added successfully',
//         admission: savedAdmission,
//         student: newStudent,
//         user: savedUser,
//       });
//     } catch (error) {
//       console.error('Error adding admission details:', error);
//       res.status(500).json({ message: 'Error adding admission details', error });
//     }
//   }
// );
// PUT: Update admission details
router.put("/edit/:id", async (req, res) => {
  const admissionId = req.params.id; // Get the admission ID from the route
  const updateData = req.body; // Get updated data from the request body

  try {
    // Find and update the admission record
    const updatedAdmission = await Admission.findByIdAndUpdate(
      admissionId,
      { $set: updateData }, // Update only fields provided in req.body
      { new: true, runValidators: true } // Return updated document and validate
    );

    if (!updatedAdmission) {
      return res.status(404).json({ status:404, message: "Admission not found" });
    }

    res.status(200).json({
      status: 201,
      message: "Admission updated successfully",
      admission: updatedAdmission,
    });
  } catch (error) {
    res.status(500).json({
      status:500,
      message: "Error updating admission",
      error: error.message,
    });
  }
});
router.post(
  '/add', // Route endpoint for adding a new admission
  [
    check('admissionNo').notEmpty().withMessage('Admission No is required'),
    check('class').notEmpty().withMessage('Class is required'),
    check('section')
      .notEmpty()
      .withMessage('Section is required')
      .isIn(['A', 'B', 'C', 'D'])
      .withMessage('Invalid section, it should be one of A, B, C, D'),
    check('firstName').notEmpty().withMessage('First Name is required'),
    check('gender').notEmpty().withMessage('Gender is required')
      .isIn(['Male', 'Female'])
      .withMessage('Gender should be Male or Female'),
    check('dateOfBirth').notEmpty().withMessage('Date of Birth is required').isDate().withMessage('Invalid Date of Birth'),
    check('mobileNumber').isMobilePhone().withMessage('Invalid Mobile Number'),
    check('admissionDate').notEmpty().withMessage('Admission Date is required').isDate().withMessage('Invalid Admission Date'),
    check('email').isEmail().withMessage('Invalid email'),
    check('password').notEmpty().withMessage('Password is required'), // Ensure password is provided
  ],
  async (req, res) => {
    // Validate the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 400, message: 'Validation failed', errors: errors.array() });
    }

    try {
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
        house,
        height,
        weight,
        measurementDate,
        medicalHistory,
        password,
      } = req.body;

      // Check for Duplicate Admission No
      const existingAdmission = await Admission.findOne({ admissionNo });
      if (existingAdmission) {
        return res.status(400).json({ status: 400, message: 'Admission No already exists' });
      }

      // Check if the email is already in use
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ status: 400, message: 'Email is already registered' });
      }

      // Check if the username is unique
      let username = `${firstName} ${lastName}`;
      let existingUsername = await User.findOne({ username });

      // If the username already exists, append a unique number
      let counter = 1;
      while (existingUsername) {
        username = `${firstName} ${lastName} ${counter}`;
        existingUsername = await User.findOne({ username });
        counter++;
      }

      // Create a New User Document (for login purposes)
      const newUser = new User({
        email,
        password, // Store the plain password here (not recommended for production)
        username, // Use the unique username
        principalAccess: false,
        teacherAccess: false,
        studentAccess: true,
      });

      // Save the User Document
      const savedUser = await newUser.save();

      // Create a New Admission Document
      const newAdmission = new Admission({
        admissionNo,
        rollNo,
        class: studentClass,
        section,
        firstName,
        lastName,
        gender,
        dateOfBirth: new Date(dateOfBirth), // Ensure date is in correct format
        category,
        religion,
        caste,
        mobileNumber,
        email,
        password,
        admissionDate: new Date(admissionDate), // Ensure date is in correct format
        bloodGroup,
        house,
        height,
        weight,
        measurementDate: measurementDate ? new Date(measurementDate) : null, // Handle optional fields
        medicalHistory,
        userId: savedUser._id,  // Link the admission to the User document
      });

      // Save the Admission
      const savedAdmission = await newAdmission.save();

      // Create a New Student Document (linking to the User)
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
        isBlocked: false, // Add other fields as needed
        isMultiClass: false,
        deleted: false,
        assignedTeacher: null,
        userId: savedUser._id, // Link the student to the User
      });

      // Save the Student Document
      await newStudent.save();

      res.status(201).json({
        status: 201,
        message: 'Admission and student added successfully.',
        admission: savedAdmission,
        student: newStudent,
        user: savedUser,
      });
    } catch (error) {
      console.error('Error adding admission details:', error);
      res.status(500).json({ status: 500, message: 'Error adding admission details', error });
    }
  }
);


module.exports = router;