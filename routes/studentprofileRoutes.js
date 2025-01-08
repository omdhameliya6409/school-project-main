
const express = require('express');
const router = express.Router();

const studentController = require('../controllers/studentprofileController');
router.get('/profile', studentController.getStudentProfile);
router.get('/profile/FeeDetails', studentController.getFeeDetails);
router.get('/profile/ExamSchedule', studentController.getExamSchedule);
router.get('/profile/Attendance', studentController.getAttendance);
router.get('/profile/ExamGrade', studentController.getExamGrade);
router.get('/profile/ClassTimetable', studentController.getClassTimetable);
router.get('/profile/LiveClassMeeting', studentController.LiveClassMeeting);
router.get('/profile/Leave', studentController.ApplyLeave);
module.exports = router;