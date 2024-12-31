const express = require('express');

const {
  addTeacher,
  updateTeacher,
  getTeachers,
  deleteTeacher,
} = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// POST route to add a new teacher and user
router.post('/add', authMiddleware(["principalAccess"]) ,addTeacher);


module.exports = router;
