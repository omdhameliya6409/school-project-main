const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController'); 
const authMiddleware = require('../middleware/authMiddleware');


router.post('/add', authMiddleware(['principalAccess', 'teacherAccess']), examController.createExam); // Create an exam
router.get('/list', authMiddleware(['principalAccess', 'teacherAccess']), examController.getExamsByFilter); // Get all exams with filters
router.put('/edit/:id', authMiddleware(['principalAccess', 'teacherAccess']), examController.editExam); // Edit an exam
router.delete('/delete/:id', authMiddleware(['principalAccess', 'teacherAccess']), examController.deleteExam); // Delete an exam


module.exports = router;
