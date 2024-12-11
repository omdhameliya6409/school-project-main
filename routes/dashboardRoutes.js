const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// Dashboard route for Principal (access all data)
router.get('/principal', authMiddleware('principalAccess'), (req, res) => {
  res.status(200).json({ message: 'Welcome to Principal Dashboard' });
});

// Dashboard route for Teacher (access teacher and student data)
router.get('/teacher', authMiddleware('teacherAccess'), async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.userId }); // Ensure userId exists in Teacher model
    const students = await Student.find();
    res.status(200).json({
      message: 'Welcome to Teacher Dashboard',
      teacher,
      students,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching teacher data' });
  }
});

// Dashboard route for Student (access own data only)
router.get('/student', authMiddleware('studentAccess'), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.userId }); // Ensure userId exists in Student model
    res.status(200).json({
      message: 'Welcome to Student Dashboard',
      student,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching student data' });
  }
});

module.exports = router;
