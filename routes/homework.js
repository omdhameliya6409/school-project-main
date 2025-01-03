const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createHomework,
  getHomeworkByFilters,
  updateHomework,
  deleteHomework,
} = require('../controllers/homeworkController');

// Homework routes
router.post('/add', authMiddleware(['principalAccess', 'teacherAccess']) ,createHomework); 
router.get('/list', authMiddleware(['principalAccess', 'teacherAccess']) ,getHomeworkByFilters); 
router.put('/edit/:id', authMiddleware(['principalAccess', 'teacherAccess']) ,updateHomework); 
router.delete('/delete/:id',authMiddleware(['principalAccess', 'teacherAccess']) , deleteHomework); 

module.exports = router;
