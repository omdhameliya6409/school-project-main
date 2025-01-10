const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentscheduleController');

// Route to create a new assignment
router.post('/add', assignmentController.createAssignment);

// Route to get assignments
router.get('/list', assignmentController.getAssignments);

// Route to update an assignment
router.put('/edit/:id', assignmentController.updateAssignment);

// Route to delete an assignment
router.delete('/delete/:id', assignmentController.deleteAssignment);

module.exports = router;
