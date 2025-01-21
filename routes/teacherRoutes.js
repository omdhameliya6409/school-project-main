const express = require('express');

const {
  addTeacher,
  getTeacherList,
  getTeachers,
  deleteTeacher,
  getTeachercategory,
} = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// POST route to add a new teacher and user
router.post('/admissions/add', authMiddleware(["principalAccess"]) ,addTeacher);
router.get('/admissions/list' , authMiddleware(["principalAccess"]), getTeacherList);
router.get('/admissions/listcategory' , authMiddleware(["principalAccess"]),getTeachercategory);
module.exports = router;
