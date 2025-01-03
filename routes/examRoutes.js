const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');

// CRUD routes for exams
router.post('/add', examController.createExam); // Create an exam
router.get('/list', examController.getExams); // Get all exams
router.put('/edit/:id', examController.editExam); // Edit an exam
router.delete('/delete/:id', examController.deleteExam); // Delete an exam

module.exports = router;
