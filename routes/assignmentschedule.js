const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentscheduleController');


router.post('/add', assignmentController.createAssignment);
router.post('/create', assignmentController.addAssignmentWithStudents);


router.get('/assignment/:class/:section', assignmentController.getAssignmentWithTeacher);
router.get('/assignment/all', assignmentController.getFilteredAssignments);
router.get('/submission', assignmentController.getAssignments);
router.get('/submission/gradNo', assignmentController.getAssignmentSubmissiongradNo);
router.get('/Submissionfilter', assignmentController.getAssignmentSubmissionfilter);

router.put('/edit/:id', assignmentController.updateAssignment);
router.put('/submission/:id', assignmentController.updateAssignmentSubmission);


router.delete('/delete/:id', assignmentController.deleteAssignment);


module.exports = router;
