const express = require('express');

const {
  addTeacher,
  getTeacherList,
  getTeachers,
  deleteTeacher,
} = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// POST route to add a new teacher and user
router.post('/admissions/add', authMiddleware(["principalAccess"]) ,addTeacher);
router.get('/admissions/list' , authMiddleware(["principalAccess"]), getTeacherList);
module.exports = router;
