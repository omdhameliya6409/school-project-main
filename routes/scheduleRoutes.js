const express = require('express');
const { getFormattedSchedule, addSchedule } = require('../controllers/scheduleController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();


router.get('/show',authMiddleware(['principalAccess', 'teacherAccess']) , getFormattedSchedule);


router.post('/add', authMiddleware(['principalAccess', 'teacherAccess']) ,addSchedule);

module.exports = router;