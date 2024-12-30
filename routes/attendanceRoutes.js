const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Routes
router.get('/attendance', attendanceController.getStudentsByClassAndSection);
router.post('/attendance', attendanceController.addAttendance);

module.exports = router;
    