const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const authMiddleware = require('../middleware/authMiddleware');

// CRUD routes for exams
router.post('/add', authMiddleware(['principalAccess', 'teacherAccess']), examController.createExam); // Create an exam
router.get('/list', authMiddleware(['principalAccess', 'teacherAccess']), examController.getExamsbyfilter); // Get exams by filter
router.put('/edit/:id', authMiddleware(['principalAccess', 'teacherAccess']), examController.editExam); // Edit an exam
router.delete('/delete/:id', authMiddleware(['principalAccess', 'teacherAccess']), examController.deleteExam); // Delete an exam
router.get('/alllist', authMiddleware(['principalAccess', 'teacherAccess']), examController.getExams); // Get all exams

module.exports = router;
