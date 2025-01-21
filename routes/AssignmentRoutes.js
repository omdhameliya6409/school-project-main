const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createAssignment,
  getAssignmentByFilters,
  updateAssignment,
  deleteAssignment,
} = require('../controllers/AssignmentController');


router.post('/add', authMiddleware(['principalAccess', 'teacherAccess']) ,createAssignment); 
router.get('/list', authMiddleware(['principalAccess', 'teacherAccess']) ,getAssignmentByFilters); 
router.put('/edit/:id', authMiddleware(['principalAccess', 'teacherAccess']) ,updateAssignment); 
router.delete('/delete/:id',authMiddleware(['principalAccess', 'teacherAccess']) , deleteAssignment); 

module.exports = router;
