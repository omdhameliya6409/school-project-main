const express = require('express');
const { getFormattedSchedule, addSchedule } = require('../controllers/scheduleController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Route to get the teacher's formatted schedule (GET)
router.get('/show',authMiddleware(['principalAccess', 'teacherAccess']) , getFormattedSchedule);

// Route to add a new schedule (POST)
router.post('/add', authMiddleware(['principalAccess', 'teacherAccess']) ,addSchedule);

module.exports = router;