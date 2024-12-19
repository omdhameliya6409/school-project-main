const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { check, validationResult } = require('express-validator');
const Student = require('../models/Student');
const Admission = require('../models/Admission');
const OnlineAdmission = require('../models/OnlineAdmission');

// Dashboard route for Principal (access all data)
router.get('/dashboard/principal', authMiddleware(['principalAccess']), (req, res) => {
  res.status(200).json({ message: 'Welcome to Principal Dashboard' });
});

// Route to get Student Information
router.get('/dashboard/student-list', authMiddleware(['principalAccess', 'teacherAccess']), async (req, res) => {
  try {
    // Query to get a list of all students and select specific fields
    const students = await Student.find().select('admissionNo name rollNo class fatherName dateOfBirth gender mobileNumber').lean();

    // Check if the user is a Principal (based on req.user data from the authMiddleware)
    console.log('User from request:', req.user);  // Debugging line to see user data

    const isPrincipal = req.user && req.user.principalAccess;  // Ensure req.user is defined

    // Prepare the response by adding an 'action' field for each student (Optional, for further actions)
    const studentsWithActions = students.map(student => ({
      ...student,
      action: isPrincipal ? {  // If Principal, add actions; if not, don't
        edit: `/dashboard/students/edit/${student._id}`,
        delete: `/dashboard/students/delete/${student._id}`,
      } : null  // No actions for Teachers
    }));

    // Respond with the list of students
    res.status(200).json({
      message: "Student list fetched successfully",
      students: studentsWithActions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching student information' });
  }
});

// Route to get Student Admission Details
router.get(
  '/admission', // Simplified route without '/dashboard' and '/principal'
  authMiddleware(['principalAccess', 'teacherAccess']), // Authorization for Principal and Teacher
  async (req, res) => {
    try {
      // Fetch all admissions
      const admissions = await Admission.find()
        .select(
          'admissionNo rollNo class section firstName lastName gender dateOfBirth category religion caste mobileNumber email admissionDate photo bloodGroup house height weight measurementDate medicalHistory'
        ) // Select specific fields to minimize data transfer
        .lean(); // Optimize query by returning plain JS objects

      if (!admissions.length) {
        return res.status(404).json({ message: 'No admission details found' });
      }

      // Send response
      res.status(200).json({
        message: 'Admission details fetched successfully',
        admissions,
      });
    } catch (error) {
      console.error('Error fetching admission information:', error);
      res.status(500).json({ message: 'Error fetching admission information', error });
    }
  }
);
// Route to get Online Admission Data
router.get('/dashboard/principal/online-admissions', authMiddleware(['principalAccess']), async (req, res) => {
  try {
    const onlineAdmissions = await OnlineAdmission.find();
    res.status(200).json(onlineAdmissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching online admission data' });
  }
});

// Route to get Disabled Students
router.get('/dashboard/principal/disabled-students', authMiddleware(['principalAccess']), async (req, res) => {
  try {
    const disabledStudents = await Student.find({ isDisabled: true });
    res.status(200).json(disabledStudents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching disabled students data' });
  }
});

// Route for Multi-Class Students
router.get('/dashboard/principal/multi-class-students', authMiddleware(['principalAccess']), async (req, res) => {
  try {
    const multiClassStudents = await Student.find({ isMultiClass: true });
    res.status(200).json(multiClassStudents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching multi-class students data' });
  }
});

// Route for Bulk Delete Students (for the Principal)
router.delete('/dashboard/principal/bulk-delete', authMiddleware(['principalAccess']), async (req, res) => {
  try {
    await Student.deleteMany({ deleted: true });
    res.status(200).json({ message: 'Bulk delete successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error performing bulk delete' });
  }
});

// Route for Student Categories (assuming there's a Category field for students)
router.get('/dashboard/principal/student-categories', authMiddleware(['principalAccess']), async (req, res) => {
  try {
    const studentCategories = await studentCategories.find(); // Assuming StudentCategory model exists
    res.status(200).json(studentCategories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student categories data' });
  }
});

// Route for Student Houses (assuming there is a House field in the Student model)
router.get('/dashboard/principal/student-houses', authMiddleware(['principalAccess']), async (req, res) => {
  try {
    const studentHouses = await studentHouses.find(); // Assuming StudentHouse model exists
    res.status(200).json(studentHouses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student houses data' });
  }
});

// Route for Disabled Reason (assuming there is a reason field for disabled students)
router.get('/dashboard/principal/disable-reason', authMiddleware(['principalAccess']), async (req, res) => {
  try {
    const disabledReasons = await DisabledReason.find(); // Assuming DisabledReason model exists
    res.status(200).json(disabledReasons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching disabled reason data' });
  }
});

module.exports = router;
