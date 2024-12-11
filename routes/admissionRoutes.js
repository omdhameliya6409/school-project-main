const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Admission = require('../models/Admission'); // Admission model
const authMiddleware = require('../middleware/authMiddleware'); // Middleware for authorization

const Student = require('../models/Student'); // Make sure the path is correct

router.post(
  '/add', // Route endpoint for adding a new admission
  authMiddleware(['principalAccess', 'teacherAccess']), // Only Principal and Teacher can access
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
  ],
  async (req, res) => {
    // Validate the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
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
        photo,
        bloodGroup,
        house,
        height,
        weight,
        measurementDate,
        medicalHistory,
      } = req.body;

      // Check for Duplicate Admission No
      const existingAdmission = await Admission.findOne({ admissionNo });
      if (existingAdmission) {
        return res.status(400).json({ message: 'Admission No already exists' });
      }

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
        admissionDate: new Date(admissionDate), // Ensure date is in correct format
        photo,
        bloodGroup,
        house,
        height,
        weight,
        measurementDate: measurementDate ? new Date(measurementDate) : null, // Handle optional fields
        medicalHistory,
      });

      // Save the Admission
      const savedAdmission = await newAdmission.save();

      // Create a New Student Document
      const newStudent = new Student({
        admissionNo,
        name: `${firstName} ${lastName}`,
        rollNo,
        class: studentClass,
        section,
        fatherName: "N/A", // Add any default or optional field here
        dateOfBirth: new Date(dateOfBirth),
        gender,
        mobileNumber,
        isBlocked: false, // Add other fields as needed
        isMultiClass: false,
        deleted: false,
        assignedTeacher: null,
      });

      // Save the Student Document
      await newStudent.save();

      res.status(201).json({
        message: 'Admission and student added successfully',
        admission: savedAdmission,
        student: newStudent,
      });
    } catch (error) {
      console.error('Error adding admission details:', error);
      res.status(500).json({ message: 'Error adding admission details', error });
    }
  }
);




module.exports = router;
