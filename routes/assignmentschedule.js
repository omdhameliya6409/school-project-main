const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentscheduleController');

// Route to create a new assignment
router.post('/add', assignmentController.createAssignment);
router.post('/create', assignmentController.addAssignmentWithStudents);
// Route to get assignments
router.get('/list', assignmentController.getAssignments);
router.get('/assignments/:class/:section', assignmentController.getAssignments);
router.get('/assignmentschedule/assignment/:class/:section', assignmentController.getAssignmentWithTeacher);
router.get('/submission', assignmentController.getAssignments);
router.get('/assignments/filter/grade',assignmentController.filterAssignmentsByGrade);
// Route to update an assignment
router.put('/edit/:id', assignmentController.updateAssignment);
router.put('/submission/:id', assignmentController.updateAssignmentSubmission);

// Route to delete an assignment
router.delete('/delete/:id', assignmentController.deleteAssignment);


module.exports = router;
