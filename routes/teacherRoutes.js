const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Student = require('../models/Student');
const Admission = require('../models/Admission');
const OnlineAdmission = require('../models/OnlineAdmission');
const DisabledReason = require('../models/DisabledReason');
const StudentCategory = require('../models/Category');
const StudentHouse = require('../models/Category');

// Teacher Dashboard route (limited access to student data)
router.get('/dashboard/teacher', authMiddleware('teacherAccess'), (req, res) => {
  res.status(200).json({ message: 'Welcome to Teacher Dashboard' });
});

// Route to get Student Information (only students assigned to the teacher or based on access)
router.get('/dashboard/teacher/students', authMiddleware('teacherAccess'), async (req, res) => {
  try {
    // Assuming the teacher has access to only a subset of students, modify as needed
    const students = await Student.find(); // You can filter this based on the teacher's assigned class or subjects
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student information' });
  }
});

// Route to get Student Admission Details
router.get('/dashboard/teacher/admissions', authMiddleware('teacherAccess'), async (req, res) => {
  try {
    // Teacher can access all admissions or only their assigned students
    const admissions = await Admission.find();
    res.status(200).json(admissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admission information' });
  }
});

// Route to get Online Admission Data
router.get('/dashboard/teacher/online-admissions', authMiddleware('teacherAccess'), async (req, res) => {
  try {
    const onlineAdmissions = await OnlineAdmission.find();
    res.status(200).json(onlineAdmissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching online admission data' });
  }
});

// Route to get Disabled Students
router.get('/dashboard/teacher/disabled-students', authMiddleware('teacherAccess'), async (req, res) => {
  try {
    const disabledStudents = await Student.find({ isDisabled: true });
    res.status(200).json(disabledStudents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching disabled students data' });
  }
});

// Route for Multi-Class Students (if applicable)
router.get('/dashboard/teacher/multi-class-students', authMiddleware('teacherAccess'), async (req, res) => {
  try {
    const multiClassStudents = await Student.find({ isMultiClass: true });
    res.status(200).json(multiClassStudents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching multi-class students data' });
  }
});

// Route for Student Categories (Teacher may have access to some categories)
router.get('/dashboard/teacher/student-categories', authMiddleware('teacherAccess'), async (req, res) => {
  try {
    const studentCategories = await StudentCategory.find();
    res.status(200).json(studentCategories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student categories' });
  }
});

// Route for Student Houses (Teacher may have access to some houses)
router.get('/dashboard/teacher/student-houses', authMiddleware('teacherAccess'), async (req, res) => {
  try {
    const studentHouses = await StudentHouse.find();
    res.status(200).json(studentHouses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student houses' });
  }
});

// Route for Disabled Reason (Teacher may need to know why some students are disabled)
router.get('/dashboard/teacher/disable-reason', authMiddleware('teacherAccess'), async (req, res) => {
  try {
    const disabledReasons = await DisabledReason.find();
    res.status(200).json(disabledReasons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching disabled reasons' });
  }
});

module.exports = router;
