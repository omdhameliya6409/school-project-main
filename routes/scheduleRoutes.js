const express = require('express');
const { getFormattedSchedule, addSchedule } = require('../controllers/scheduleController');

const router = express.Router();

// Route to get the teacher's formatted schedule (GET)
router.get('/show/:teacherId', getFormattedSchedule);

// Route to add a new schedule (POST)
router.post('/add', addSchedule);

module.exports = router;