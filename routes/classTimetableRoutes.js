const express = require('express');
const { addClassTimetable, getClassTimetable } = require('../controllers/classTimetableController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Route to add a new class timetable entry (POST)
router.post('/add',authMiddleware(['principalAccess', 'teacherAccess']) , addClassTimetable);

// Route to get the class timetable for a specific class (GET)
router.get('/show',authMiddleware(['principalAccess', 'teacherAccess']) , getClassTimetable);

module.exports = router;
