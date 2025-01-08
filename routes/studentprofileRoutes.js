
const express = require('express');
const router = express.Router();

const studentController = require('../controllers/studentprofileController');
router.get('/profile', studentController.getStudentProfile);
router.get('/profile/FeeDetails', studentController.getFeeDetails);
router.get('/profile/ExamSchedule', studentController.getExamSchedule);
router.get('/profile/Attendance', studentController.getAttendance);
router.get('/profile/ExamGrade', studentController.getExamGrade);
module.exports = router;