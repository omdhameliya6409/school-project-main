const express = require('express');
const { addClassTimetable, getClassTimetable } = require('../controllers/classTimetableController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();


router.post('/add',authMiddleware(['principalAccess', 'teacherAccess']) , addClassTimetable);


router.get('/show',authMiddleware(['principalAccess', 'teacherAccess']) , getClassTimetable);

module.exports = router;
