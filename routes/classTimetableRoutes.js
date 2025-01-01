const express = require('express');
const { addClassTimetable, getClassTimetable } = require('../controllers/classTimetableController');

const router = express.Router();

// Route to add a new class timetable entry (POST)
router.post('/add', addClassTimetable);

// Route to get the class timetable for a specific class (GET)
router.get('/show', getClassTimetable);

module.exports = router;
